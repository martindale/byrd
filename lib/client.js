/**
 * @module byrd/client
 */

'use strict';

// load third party deps
var kademlia = require('kad');
var KadLocalStorage = require('kad-localstorage');

// load our local deps
var Engine = require('./engine');
var ClientTransport = require('./client-transport');

// parse location to get seed info
var address = location.hostname;
var protocol = location.protocol.substr(0, location.protocol.length - 1);
var port = Number(location.port) || (protocol === 'https' ? 443 : 80);

// initialize the byrd engine
var byrd = Engine({
  transport: ClientTransport,
  address: '0.0.0.0',
  port: 0,
  protocol: protocol,
  storage: new KadLocalStorage('byrd'),
  seeds: [
    {
      address: address,
      port: port,
      protocol: protocol
    }
  ],
  logLevel: 3
});

// miscellaneous dom listeners
document.addEventListener('DOMContentLoaded', function() {
  require('./views')(byrd);

  // prevent default browser drag/drop behavior
  window.addEventListener('dragover',function(e){
    e.preventDefault();
  }, false);

  // prevent default browser drag/drop behavior
  window.addEventListener('drop',function(e){
    e.preventDefault();
  }, false);

});

module.exports = byrd;
