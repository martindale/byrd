'use strict';

var Vue = require('vue');
var $ = require('jquery');

module.exports = function(engine) {
  var FILE_QUEUE = [];

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

          peers = peers.concat(
            bucket.getContactList().map(function(contact) {
              return contact.toString();
            })
          );
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
      queueFile: function(e) {
        var reader = new FileReader();
        var fileInfo = (e.target.files || e.dataTransfer.files)[0];

        reader.onloadend = function() {
          var fileArrayBuffer = reader.result; // store locally
          var fileBuffer = new Buffer(fileArrayBuffer); // pass to engine
          var fileBlob = new Blob([fileBuffer], { type: fileInfo.type });

          FILE_QUEUE.push({
            mimetype: fileInfo.type,
            filename: fileInfo.name,
            size: fileInfo.size,
            contents: fileArrayBuffer,
            status: {
              type: 'info',
              message: 'Queued for distribution'
            },
            working: false
          });
        }

        reader.readAsArrayBuffer(fileInfo);
      }
    }
  });

  /**
   * File Queue View
   */
  var queue = new Vue({
    el: '#queue',
    data: {
      queued: FILE_QUEUE
    },
    methods: {
      distribute: function(file) {
        file.working = !file.working;
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
    queue: queue,
    files: files
  };

};
