'use strict';

var assert = require('assert');
var config = require('config');
var BYRDEngine = require('../lib/engine');
var BYRDTransport = require('../lib/server-transport');
var kadfs = require('kad-fs');
var os = require('os');

var storage = function(name) {
  return kadfs(os.tmpdir() + '/byrd.simulation.node.' + name + '.db');
};

var byrd1 = BYRDEngine(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3050,
  storage: storage('1'),
  transport: BYRDTransport,
  seeds: [],
  logLevel: 4
}));

var byrd2 = BYRDEngine(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3051,
  storage: storage('2'),
  transport: BYRDTransport,
  seeds: [
    {
      protocol: 'http',
      address: '127.0.0.1',
      port: 3050
    }
  ],
  logLevel: 4
}));

var byrd3 = BYRDEngine(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3052,
  storage: storage('3'),
  transport: BYRDTransport,
  seeds: [
    {
      protocol: 'http',
      address: '127.0.0.1',
      port: 3050
    },
    {
      protocol: 'http',
      address: '127.0.0.1',
      port: 3051
    }
  ],
  logLevel: 4
}));

var byrd4 = BYRDEngine(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3053,
  storage: storage('4'),
  transport: BYRDTransport,
  seeds: [
    {
      protocol: 'http',
      address: '127.0.0.1',
      port: 3051
    },
    {
      protocol: 'http',
      address: '127.0.0.1',
      port: 3052
    }
  ],
  logLevel: 4
}));

var byrd5 = BYRDEngine(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3054,
  storage: storage('5'),
  transport: BYRDTransport,
  seeds: [
    {
      protocol: 'http',
      address: '127.0.0.1',
      port: 3052
    },
    {
      protocol: 'http',
      address: '127.0.0.1',
      port: 3053
    }
  ],
  logLevel: 4
}));

var byrd6 = BYRDEngine(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3055,
  storage: storage('6'),
  transport: BYRDTransport,
  seeds: [
    {
      protocol: 'http',
      address: '127.0.0.1',
      port: 3053
    },
    {
      protocol: 'http',
      address: '127.0.0.1',
      port: 3054
    }
  ],
  logLevel: 4
}));

function fakeConfig(config) {
  config.get = function(key) {
    return config[key] || null;
  };
  return config;
}
