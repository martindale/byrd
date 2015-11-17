'use strict';

var config = require('config');
var levelup = require('levelup');
var express = require('express');
var http = require('http');

var ByrdEngine = require('../lib/engine');
var ByrdServerTransport = require('../lib/server-transport');

config.transport = ByrdServerTransport;
config.storage = levelup(config.datadir);

// redirect traffic from port 80 if port set to 443
if (config.get('protocol') === 'https' && config.get('port') === 443) {
  http.createServer(express().use(function(req, res, next) {
    return res.redirect(['https://', req.hostname, req.url].join(''));
  })).listen(80);
}

module.exports = ByrdEngine(config);
