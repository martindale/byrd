/**
 * byrd/shredder
 */

'use strict';

var crypto = require('crypto');
var aes = require('aes-js');
var path = require('path');
var DataURI = require('datauri');

Shredder.MIN_CHUNKS = 10;
Shredder.MAX_CHUNK_SIZE = 32 * 1000;

function Shredder(filename) {
  this._filename = filename;
  this._chunks = [];
}

Shredder.prototype.shred = function(buffer) {
  this._fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
  this._encryptedText = this._encrypt(this._fileHash, buffer).toString('hex');

  var remainder = this._encryptedText.length % Shredder.MIN_CHUNKS;
  var chunkSize = (this._encryptedText.length - remainder) / Shredder.MIN_CHUNKS;
  var iterations = Shredder.MIN_CHUNKS;
  var position = 0;

  if (chunkSize > Shredder.MAX_CHUNK_SIZE) {
    remainder = this._encryptedText.length % Shredder.MAX_CHUNK_SIZE;
    chunkSize = Shredder.MAX_CHUNK_SIZE;
    iterations = (this._encryptedText.length - remainder) / Shredder.MAX_CHUNK_SIZE;
  }

  for (var i = 0; i < iterations; i++) {
    var encryptedChunk = this._encryptedText.slice(position, position + chunkSize);
    this._chunks.push(encryptedChunk);
    position = position + chunkSize;
  }

  if (remainder > 0) {
    var buttChunk = this._encryptedText.slice(position, this._encryptedText.length);
    this._chunks.push(buttChunk);
  }

  return this._chunks;
};

Shredder.prototype.getHash = function() {
  return this._fileHash;
};

Shredder.prototype.unshred = function(fileHash, chunks) {
  this._encryptedText = '';
  this._fileHash = fileHash;

  for (var i = 0; i < chunks.length; i++) {
    this._encryptedText += chunks[i].toString('hex');
  }

  this._decryptedText = this._decrypt(
    fileHash,
    new Buffer(this._encryptedText, 'hex')
  );

  return this._decryptedText;
};

Shredder.prototype.getContents = function() {
  return this._decryptedText || null;
};

Shredder.prototype.getDataURI = function() {
  var datauri = new DataURI();

  return datauri.format(this._filename, this._decryptedText).content;
};

Shredder.prototype._encrypt = function(key, data) {
  return this._ctr(key).decrypt(data);
};

Shredder.prototype._decrypt = function(key, data) {
  return this._ctr(key).decrypt(data);
};

Shredder.prototype._ctr = function(key) {
  return new aes.ModeOfOperation.ctr(
    new Buffer(key, 'hex').slice(0, 128 / 8), // trunc to 128 bit key
    new aes.Counter(0)
  );
};

module.exports = Shredder;
