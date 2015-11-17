/**
 * @module byrd/engine
 */

'use strict';

var util = require('util');
var assert = require('assert');
var events = require('events');
var crypto = require('crypto');
var kademlia = require('kad');
var async = require('async');

var Egg = require('./egg');
var Shredder = require('./shredder');

util.inherits(Engine, events.EventEmitter);

function Engine(config) {
  if (!(this instanceof Engine)) {
    return new Engine(config);
  }

  events.EventEmitter.call(this);
  config.validate = this._validate;
  
  this.dht = kademlia(config);
}

Engine.prototype._validate = function(key, value, callback) {
  callback(crypto.createHash('sha256').update(value).digest('hex') === key);
};

Engine.prototype.distribute = function(filename, buffer, callback) {
  var self = this;
  var shredder = new Shredder(filename);
  var chunks = shredder.shred(new Buffer(buffer));
  var egg = Egg.fromShredder(shredder);
  var iterator = this._distributeChunk.bind(this);

  async.eachLimit(chunks, 4, iterator, function(err) {
    if (egg.getSize() > Shredder.MAX_CHUNK_SIZE) {
      // shred the egg and recurse
      self.distribute(shredder.getHash(), egg.serialize(), callback);
    } else {
      // store the egg and callback with key
      self.dht.put(shredder.getHash(), egg.serialize(), function(err) {
        callback(err, shredder.getHash());
      });
    }
  });
};

Engine.prototype._distributeChunk = function(buffer, callback) {
  var value = buffer.toString('hex');
  var key = crypto.createHash('sha256').update(value).digest('hex');

  this.emit('status', {
    type: 'info',
    message: 'Distributing file chunk ' + key
  });
  this.dht.put(key, value, callback);
};

Engine.prototype.resolve = function(hash, callback) {
  var self = this;

  if (Egg.isEgg(hash)) {
    var egg = hash;
    var iterator = this._resolveChunk.bind(this);

    async.mapLimit(egg.chunks, 4, iterator, function(err, chunks) {
      if (err) {
        return callback(err);
      }

      var shredder = new Shredder(egg.filename);
      var fileBuffer = shredder.unshred(egg.hash, egg.chunks);

      try {
        // if we got another egg, resolve it
        return self.resolve(Egg.fromBuffer(fileBuffer), callback);
      } catch(err) {
        // we have the final resolved file
        return callback(null, shredder);
      }
    });
  } else {
    this._resolveChunk(hash, function(err, egg) {
      if (err) {
        return callback(err);
      }

      try {
        return self.resolve(Egg.fromHexString(egg), callback);
      } catch(err) {
        return callback(err);
      }
    });
  }
};

Engine.prototype._resolveChunk = function(key, callback) {
  this.emit('status', {
    type: 'info',
    message: 'Resolving file chunk ' + key
  });
  this.dht.get(key, callback);
};

module.exports = Engine;
