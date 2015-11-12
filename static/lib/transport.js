'use strict';

window.byrd.ByrdClientTransport = (function() {

  inherits(ByrdClientTransport, kad.RPC);

  function ByrdClientTransport(options) {
    kad.RPC.call(this, options);
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

    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data.toString());
  };

  ByrdClientTransport.prototype._createContact = function(options) {
    return new byrd.ByrdClientContact(options);
  };

  ByrdClientTransport.prototype._close = function() {
    return;
  };

  return ByrdClientTransport;
})();
