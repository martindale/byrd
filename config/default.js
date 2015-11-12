'use strict';

module.exports = {
  name: require('../package').name,
  ssl: false,
  ca: [], // array of paths to ca
  cert: null, // string path to certificate
  key: null, // string path to key
  seeds: [
    // { address: 'byrd.io', port: 443, protocol: 'https' }
  ],
  address: '127.0.0.1',
  port: 8080,
  protocol: 'http',
  logLevel: 4,
  datadir: '/tmp/byrd.db'
};
