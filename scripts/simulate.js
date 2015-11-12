'use strict';

var assert = require('assert');
var config = require('config');
var kademlia = require('kad');
var memdown = require('memdown');
var BYRDTransport = require('../lib/server');
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

setTimeout(function() {
  byrd3.put('beep', 'boop', function(err) {
    if (err) {
      console.log(err);
      process.exit();
    }
    console.log(byrd1._buckets);
    console.log(byrd2._buckets);
    console.log(byrd3._buckets);
    byrd1.get('beep', function(err, value) {
      if (err) {
        console.log(err);
        process.exit();
      }
      assert(value === 'boop');
      console.log(byrd1._buckets);
      console.log(byrd2._buckets);
      console.log(byrd3._buckets);
      byrd2.put('boop', 'beep', function(err) {
        byrd3.get('boop', function(err, value) {
          if (err) {
            console.log(err);
            process.exit();
          }
          assert(value === 'beep');
          console.log(byrd1._buckets);
          console.log(byrd2._buckets);
          console.log(byrd3._buckets);
          console.log('\nSIMULATION SUCCESS\n');
          process.exit();
        });
      });
    });
  });
}, 3000);

function fakeConfig(config) {
  config.get = function(key) {
    return config[key] || null;
  };
  return config;
}
