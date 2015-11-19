'use strict';

var Vue = require('vue');
var $ = require('jquery');

module.exports = function(engine) {

  /**
   * Search View
   */
  var search = new Vue({
    el: '#header',
    data: {
      key: '',
      menuVisibility: '',
      peers: []
    },
    created: function() {
      var self = this;
      
      setInterval(function() {
        var peers = []

        for (var key in engine.dht._buckets) {
          var bucket = engine.dht._buckets[key];

          peers = peers.concat(bucket.getContactList().map(function(contact) {
            return contact.toString();
          }));
        }

        self.peers = peers;
      }, 1000);
    },
    methods: {
      resolve: function(e) {
        e.preventDefault();
        console.log(e)
      },
      showmore: function() {
        this.menuVisibility = 'visible';
      },
      showless: function() {
        this.menuVisibility = 'invisible';
      }
    }
  });

  /**
   * File Dropzone View
   */
  var dropzone = new Vue({
    el: '#dropzone',
    data: {

    },
    methods: {
      openFileDialog: function() {
        $('#file').trigger('click');
      },
      queueFileDistribution: function(e) {
        var reader = new FileReader();
        var filelist = e.target.files || e.dataTransfer.files;

        reader.onloadend = function() {
          // convert to buffer
          // store metadata and file
          // add to distribution queue
        }

        reader.readAsArrayBuffer(filelist[0]);
      }
    }
  });

  /**
   * File List View
   */
  var files = new Vue({
    el: '#files',
    data: {

    },
    methods: {

    }
  });

  return {
    search: search,
    dropzone: dropzone,
    files: files
  };

};
