'use strict';

var config = require('config');
var kademlia = require('kad');
var ByrdServerTransport = require('../lib/transport');
var levelup = require('levelup');
var express = require('express');
var http = require('http');

config.validate = function(key, value, done) {
  done(true); // TODO: add validation for content addressability
};

config.transport = ByrdServerTransport;
config.storage = levelup(config.datadir);

// redirect traffic from port 80 if port set to 443
if (config.get('protocol') === 'https' && config.get('port') === 443) {
  http.createServer(express().use(function(req, res, next) {
    return res.redirect(['https://', req.hostname, req.url].join(''));
  })).listen(80);
}

module.exports = kademlia(config, function(err) {});
