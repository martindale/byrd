'use strict';

var config = require('config');
var kademlia = require('kad');
var ByrdServerTransport = require('../lib/transport');
var levelup = require('levelup');

config.validateKeyValuePair = function(key, value, done) {
  done(true); // TODO: add validation for content addressability
};

config.transport = ByrdServerTransport;
config.storage = levelup(config.datadir);

module.exports = kademlia(config, function(err) {});
