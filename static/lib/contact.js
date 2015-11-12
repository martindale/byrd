'use strict';

byrd.ByrdClientContact = (function() {

  inherits(ByrdClientContact, kad.Contact);

  function ByrdClientContact(options) {
    this.address = options.address;
    this.port = options.port;
    this.protocol = options.protocol;

    kad.Contact.call(this, options)
  }

  ByrdClientContact.prototype._createNodeID = function() {
    return kad.utils.createID(this.toString());
  };

  ByrdClientContact.prototype.toString = function() {
    return this.protocol + '://' + this.address + ':' + this.port;
  };

  return ByrdClientContact;

})();
