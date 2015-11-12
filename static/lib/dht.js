'use strict';

var kademlia = window.kad

window.byrd.dht = kademlia({
  transport: byrd.ByrdClientTransport,
  address: 'PASSIVE_CLIENT_NODE',
  port: 0,
  protocol: 'byrd',
  storage: new KadLocalStorage('byrd'),
  seeds: [
    {
      address: location.hostname,
      port: Number(location.port),
      protocol: location.protocol.substr(0, location.protocol.length - 1)
    }
  ],
  logLevel: 4
});
