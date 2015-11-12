'use strict';

var config = require('config');
var kademlia = require('kad');
var ByrdServerTransport = require('../lib/transport');
var levelup = require('levelup');
var express = require('express');
var http = require('http');

config.validateKeyValuePair = function(key, value, done) {
  done(true); // TODO: add validation for content addressability
};

config.transport = ByrdServerTransport;
config.storage = levelup(config.datadir);

// redirect traffic from port 80 if port set to 443
if (config.get('protocol') === 'https' && config.get('port') === 443) {
  http.createServer(express().use(function(req, res, next) {
    var port  = (config.server.port === 443) ? '' : ':' + config.server.port;
    var parts = ['https://', req.hostname, port, req.url];
    return res.redirect(parts.join(''));
  })).listen(80);
}

module.exports = kademlia(config, function(err) {});
