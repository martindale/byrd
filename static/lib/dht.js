'use strict';

var kademlia = window.kad;
var address = location.hostname;
var port = Number(location.port) || (protocol === 'https' ? 443 : 80);
var protocol = location.protocol.substr(0, location.protocol.length - 1);

window.byrd.dht = kademlia({
  transport: byrd.ByrdClientTransport,
  address: 'PASSIVE_CLIENT_NODE',
  port: 0,
  protocol: 'byrd',
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
