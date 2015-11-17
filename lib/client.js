/**
 * @module byrd/client
 */

'use strict';

var kademlia = require('kad');
var $ = require('jquery');
var Vue = require('vue');

var Engine = require('./engine');
var ClientTransport = require('./client-transport');
var KadLocalStorage = require('kad-localStorage');

var address = location.hostname;
var protocol = location.protocol.substr(0, location.protocol.length - 1);
var port = Number(location.port) || (protocol === 'https' ? 443 : 80);

var BYRD = Engine({
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
  logLevel: 4
});

document.addEventListener('DOMContentLoaded', function() {

  // prevent default browser drag/drop behavior
  window.addEventListener('dragover',function(e){
    e.preventDefault();
  }, false);

  // prevent default browser drag/drop behavior
  window.addEventListener('drop',function(e){
    e.preventDefault();
  }, false);



});
