/**
 * @module byrd/engine
 */

'use strict';

var util = require('util');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');
var kademlia = require('kad');
var async = require('async');
var Egg = require('./egg');
var Shredder = require('./shredder');

util.inherits(Engine, EventEmitter);

function Engine(config) {
  if (!(this instanceof Engine)) {
    return new Engine(config);
  }

  EventEmitter.call(this);
  config.validate = this._validate;

  this.dht = kademlia(config);
}

Engine.prototype._validate = function(key, value, callback) {
  callback(crypto.createHash('sha256').update(value).digest('hex') === key);
};

Engine.prototype.distribute = function(filename, buffer, callback, emitter) {
  var self = this;

  emitter = emitter || new EventEmitter();

  var shredder = new Shredder(filename);
  var chunks = shredder.shred(new Buffer(buffer));
  var egg = Egg.fromShredder(shredder);
  var iterator = _distributeChunk.bind(self);

  async.eachLimit(chunks, 4, iterator, function(err) {
    if (err) {
      emitter.emit('status', {
        type: 'error',
        message: err.message
      });
      return callback(err);
    }

    if (egg.getSize() > Shredder.MAX_CHUNK_SIZE) {
      // shred the egg and recurse
      self.distribute(shredder.getHash(), egg.serialize(), callback, emitter);
    } else {
      // store the egg and callback with key
      self.dht.put(egg.getHash(), egg.serialize(), function(err) {
        emitter.emit('status', {
          type: 'success',
          message: 'Successfully distributed ' + filename
        });
        callback(err, egg.getHash());
      });
    }
  });

  function _distributeChunk(buffer, callback) {
    var value = buffer.toString('hex');
    var key = crypto.createHash('sha256').update(value).digest('hex');

    emitter.emit('status', {
      type: 'info',
      message: 'Distributing file chunk ' + key
    });
    this.dht.put(key, value, callback);
  }

  return emitter;
};



Engine.prototype.resolve = function(hash, callback, emitter) {
  var self = this;

  emitter = emitter || new EventEmitter();

  if (!Egg.isEgg(hash)) {
    return this._resolveChunk(hash, function(err, egg) {
      if (err) {
        return callback(err);
      }

      try {
        return self.resolve(Egg.fromHexString(egg), callback, emitter);
      } catch(err) {
        return callback(err);
      }
    });
  }

  var egg = hash;
  var iterator = _resolveChunk.bind(self);

  async.mapLimit(egg.chunks, 4, iterator, function(err, chunks) {
    if (err) {
      return callback(err);
    }

    var shredder = new Shredder(egg.filename);
    var fileBuffer = shredder.unshred(egg.hash, chunks);

    try {
      // if we got another egg, resolve it
      return self.resolve(Egg.fromBuffer(fileBuffer), callback, emitter);
    } catch(err) {
      // we have the final resolved file
      return callback(null, shredder);
    }
  });

  function _resolveChunk(key, callback) {
    emitter.emit('status', {
      type: 'info',
      message: 'Resolving file chunk ' + key
    });
    this.dht.get(key, callback);
  }
};

module.exports = Engine;
