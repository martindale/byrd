/**
 * byrd/router
 */

'use strict';

var browserify = require('browserify-middleware');
var Message = require('kad').Message;

function Router(server) {
  this._server = server;
}

Router.prototype.mount = function() {
  this._server._app.get('/', this._renderClient.bind(this));
  this._server._app.post('/', this._rpcInterface.bind(this));
  this._server._app.get('/byrd.js', browserify('./lib/client.js', {
    cache: true,
    precompile: true,
    run: true,
    minify: true,
    gzip: true
  }));
};

Router.prototype._renderClient = function(req, res) {
  res.render('index', {});
};

Router.prototype._rpcInterface = function(req, res) {
  var payload = req.body;

  if (Message.isRequest(payload)) {
    this._server._queuedResponses[payload.id] = res;
  }

  this._server._handleMessage(new Buffer(JSON.stringify(payload)), {});
};

module.exports = Router;
