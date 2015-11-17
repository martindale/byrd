/**
 * @module byrd/contact
 */

'use strict';

var assert = require('assert');
var Contact = require('kad/lib/contact');
var inherits = require('util').inherits;
var utils = require('kad/lib/utils');

inherits(ByrdServerContact, Contact);

function ByrdServerContact(options) {
  if (!(this instanceof ByrdServerContact)) {
    return new ByrdServerContact(options);
  }

  assert(typeof options === 'object', 'Invalid options were supplied');
  assert(typeof options.address === 'string', 'Invalid address was supplied');
  assert(typeof options.port === 'number', 'Invalid port was supplied');
  assert(typeof options.protocol === 'string', 'Invalid protocol was supplied');

  this.address = options.address;
  this.port = options.port;
  this.protocol = options.protocol;

  Contact.call(this, options)
}

ByrdServerContact.prototype._createNodeID = function() {
  return utils.createID(this.toString());
};

ByrdServerContact.prototype.toString = function() {
  return this.protocol + '://' + this.address + ':' + this.port;
};

module.exports = ByrdServerContact;
