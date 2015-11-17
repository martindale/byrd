/**
 * @module byrd/egg
 */

'use strict';

var assert = require('assert');
var Shredder = require('./shredder');

function Egg(filename, hash, chunks) {
  this.filename = filename;
  this.hash = hash;
  this.chunks = chunks || [];
}

Egg.prototype.serialize = function() {
  return new Buffer(JSON.stringify(this)).toString('hex');
};

Egg.prototype.getSize = function() {
  return new Buffer(this.serialize(), 'hex').length;
};

Egg.fromShredder = function(shredder) {
  assert(shredder instanceof Shredder, 'Invalid shredder');
  var hashes = shredder._chunks.map(function(chunk) {
    var value = chunk.toString('hex');
    return crypto.createHash('sha256').update(value).digest('hex');
  });
  return new Egg(shredder._filename, shredder._fileHash, hashes);
};

Egg.fromBuffer = function(buffer) {
  var parsed = JSON.parse(buffer.toString());
  assert(Egg.isEgg(parsed), 'Invalid egg');
  return new Egg(parsed.filename, parsed.hash, parsed.chunks);
};

Egg.fromHexString = function(string) {
  return Egg.fromBuffer(new Buffer(string, 'hex'));
};

Egg.isEgg = function(obj) {
  try {
    assert(typeof obj.filename === 'string');
    assert(typeof obj.hash === 'string');
    assert(Array.isArray(obj.chunks));
    assert(obj.chunks.length);
  } catch(err) {
    return false;
  }
  return true;
};

module.exports = Egg;
