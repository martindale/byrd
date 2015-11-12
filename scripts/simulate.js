'use strict';

var assert = require('assert');
var config = require('config');
var kademlia = require('kad');
var memdown = require('memdown');
var BYRDTransport = require('../lib/transport');
var levelup = require('levelup');

var byrd1 = kademlia(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3050,
  storage: levelup({ db: memdown }),
  transport: BYRDTransport,
  seeds: [],
  logLevel: 4
}));

var byrd2 = kademlia(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3051,
  storage: levelup({ db: memdown }),
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

var byrd3 = kademlia(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3052,
  storage: levelup({ db: memdown }),
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

var byrd4 = kademlia(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3053,
  storage: levelup({ db: memdown }),
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

var byrd5 = kademlia(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3054,
  storage: levelup({ db: memdown }),
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

var byrd6 = kademlia(fakeConfig({
  protocol: 'http',
  address: '127.0.0.1',
  port: 3055,
  storage: levelup({ db: memdown }),
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
