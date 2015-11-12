/**
 * byrd/router
 */

'use strict';

function Router(server) {
  this._server = server;
}

Router.prototype.mount = function() {
  this._server._app.get('/', this._renderClient.bind(this));
  this._server._app.post('/', this._rpcInterface.bind(this));
};

Router.prototype._renderClient = function(req, res) {
  res.render('index', {});
};

Router.prototype._rpcInterface = function(req, res) {
  var payload = req.body;
  var rpcID = payload.params.rpcID;

  if (rpcID) {
    this._server._queuedResponses[rpcID] = res;
  }

  this._server._handleMessage(new Buffer(JSON.stringify(payload)), {});
};

module.exports = Router;
