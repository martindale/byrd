/**
 * @module byrd/client-transport
 */

'use strict';

var util = require('util');
var kademlia = require('kad');
var ByrdContact = require('./contact');

util.inherits(ByrdClientTransport, kademlia.RPC);

function ByrdClientTransport(options) {
  kademlia.RPC.call(this, options);
}

ByrdClientTransport.prototype._send = function(data, contact) {
  var self = this;
  var xhr = new XMLHttpRequest();
  var url = contact.protocol + '://' + contact.address + ':' + contact.port;

  xhr.addEventListener('load', function() {
    var json;

    if (xhr.status !== 200 && xhr.status !== 304) {
      return self._handleMessage(null);
    }

    self._handleMessage(new Buffer(xhr.responseText), {});
  });

  try {
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data.toString());
  } catch(err) {
    self._handleMessage(null);
  }
};

ByrdClientTransport.prototype._createContact = function(options) {
  return new ByrdContact(options);
};

ByrdClientTransport.prototype._close = function() {
  return;
};

module.exports = ByrdClientTransport;
