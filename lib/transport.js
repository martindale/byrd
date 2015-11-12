/**
 * byrd/transport
 */

'use strict';

var http = require('http'), https = require('https');
var request = require('request');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var log = require('./log');
var RPC = require('kad/lib/rpc');
var Router = require('./router');
var ByrdServerContact = require('./contact');
var express = require('express');
var bodyparser = require('body-parser');
var inherits = require('util').inherits;

inherits(ByrdServerTransport, RPC);

function ByrdServerTransport(_config) {
  if (!(this instanceof ByrdServerTransport)) {
    return new ByrdServerTransport(_config);
  }

  var self = this;

  this._config = _config;
  this._app = express();
  this._queuedResponses = {};

  RPC.call(this, _config);

  if (this._config.get('ssl')) {
    this._server = https.createServer({
      ca: this._config.get('ca').map(function(path) {
        return fs.readFileSync(path);
      }),
      key: fs.readFileSync(this._config.get('key')),
      cert: fs.readFileSync(this._config.get('cert')),
      requestCert: false,
      rejectUnauthorized: false
    }, this._app);
  } else {
    this._server = http.createServer(this._app);
  }

  process.on('uncaughtException', function(err){
    log.error('Got uncaught exception: ' + err.stack);
    self.close();
  });

  this._configure();
  this.start();
}

ByrdServerTransport.prototype._configure = function() {
  this._router = new Router(this);

  this._app.set('x-powered-by', false);
  this._app.set('views', __dirname + '/../views');
  this._app.set('view engine', 'jade');
  this._app.engine('jade', require('jade').__express);
  this._app.use(express.static(path.resolve(__dirname, '../static')));
  this._app.use(bodyparser.json());
  this._app.use(this._enableCORS);
  this._router.mount();

  return this;
};

ByrdServerTransport.prototype.start = function(callback) {
  var self = this;

  this._server.listen(
    this._config.get('port'),
    this._config.get('address'),
    function() {
      log.info('Started express server on ' + self._config.get('port'));
    }
  );
};

ByrdServerTransport.prototype._close = function(callback) {
  this._server.close(function() {
    log.info('Closed remaining http connections.');
    process.exit();
  });
};

ByrdServerTransport.prototype._createContact = function(options) {
  return new ByrdServerContact(options);
}

ByrdServerTransport.prototype._send = function(data, contact) {
  var self = this;
  var parsed = JSON.parse(data.toString());
  var referenceID = parsed.params.referenceID;

  if (referenceID && this._queuedResponses[referenceID]) {
    this._queuedResponses[referenceID].send(parsed);
    delete this._queuedResponses[referenceID];
    return;
  }

  var options = {
    url: contact.toString(),
    body: JSON.parse(data.toString()),
    method: 'POST',
    json: true
  };

  request.post(options, function(err, res, body) {
    self._handleMessage(body ? new Buffer(JSON.stringify(body)) : '', {});
  });
};

ByrdServerTransport.prototype._enableCORS = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
}

module.exports = ByrdServerTransport;
