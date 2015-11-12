'use strict';

var kademlia = window.kad;
var address = location.hostname;
var protocol = location.protocol.substr(0, location.protocol.length - 1);
var port = Number(location.port) || (protocol === 'https' ? 443 : 80);

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

window.byrd.peerlist = function() {
  var list = [];

  for (var key in byrd.dht._buckets) {
    var bucket = byrd.dht._buckets[key];

    list = list.concat(bucket.getContactList().map(function(contact) {
      return contact.toString();
    }));
  }

  return list;
};
