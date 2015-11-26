'use strict';

var Vue = require('vue');
var $ = require('jquery');
var localforage = require('localforage');
var Egg = require('./egg');

localforage.config({
  name: 'BYRD',
  version: 1.0,
  storeName: 'files'
});

module.exports = function(engine) {
  var FILE_QUEUE = [];
  var FILE_LIST = [];

  /**
   * Search View
   */
  var search = new Vue({
    el: '#header',
    data: {
      key: location.hash.substr(1),
      menuVisibility: '',
      peers: []
    },
    created: function() {
      var self = this;

      if (self.key) {
        self.resolve();
      }

      setInterval(function() {
        while (self.peers.length) {
          self.peers.splice(0, 1);
        }

        for (var key in engine.dht._buckets) {
          engine.dht._buckets[key].getContactList().map(function(contact) {
            return contact.toString();
          }).forEach(function(peer) {
            self.peers.push(peer);
          });
        }
      }, 1000);
    },
    methods: {
      panic: function() {
        if (confirm('You will lose everything.')) {
          localforage.clear(function(err) {
            if (err) {
              return alert(err.message);
            }

            localStorage.clear();
            location.href = '/';
          });
        }
      },
      resolve: function(e) {
        var self = this;
        var resolve = engine.resolve(this.key, onComplete);

        if (e) {
          e.preventDefault();
        }

        var file = {
          mimetype: 'application/octet-stream',
          filename: this.key,
          size: '???',
          contents: null,
          status: {
            type: 'info',
            message: 'Discovering file metadata...'
          },
          working: true
        };

        FILE_QUEUE.push(file);

        resolve.on('status', function(status) {
          file.status = status;
        });

        function onComplete(err, shredder) {
          if (err) {
            file.working = false;
            file.status.type = 'error';
            file.status.message = err.message;
            return;
          }

          var reader = new FileReader();
          var egg = Egg.fromShredder(shredder);

          file.contents = shredder.getContents();
          file.filename = egg.filename;
          file.key = self.key;
          file.size = file.contents.length;

          localforage.setItem(self.key, file.contents, function(err) {
            if (err) {
              file.working = false;
              file.status.type = 'error';
              file.status.message = err.message;
              return;
            }

            var metadata = {
              filename: file.filename,
              mimetype: file.mimetype,
              key: self.key,
              size: file.size
            };

            localStorage.setItem(metadata.key, JSON.stringify(metadata));

            reader.onloadend = function() {
              metadata.uri = reader.result;

              FILE_QUEUE.splice(FILE_QUEUE.indexOf(file), 1);
              FILE_LIST.unshift(metadata);
            };

            reader.readAsDataURL(new Blob([file.contents], {
              type: metadata.mimetype
            }));
          });
        }
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
          FILE_QUEUE.push({
            mimetype: fileInfo.type,
            filename: fileInfo.name,
            size: fileInfo.size,
            contents: reader.result,
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
        var buffer = new Buffer(file.contents);
        var distribute = engine.distribute(file.filename, buffer, onComplete);
        var reader = new FileReader();

        distribute.on('status', function(status) {
          file.status = status;
        });

        file.working = true;

        function onComplete(err, hash) {
          if (err) {
            file.working = false;
            file.status.type = 'error';
            file.status.message = err.message;
            return;
          }

          localforage.setItem(hash, file.contents, function(err) {
            if (err) {
              file.working = false;
              file.status.type = 'error';
              file.status.message = err.message;
              return;
            }

            var metadata = {
              filename: file.filename,
              mimetype: file.mimetype,
              key: hash,
              size: file.size
            };

            localStorage.setItem(hash, JSON.stringify(metadata));

            reader.onloadend = function() {
              metadata.uri = reader.result;

              FILE_QUEUE.splice(FILE_QUEUE.indexOf(file), 1);
              FILE_LIST.unshift(metadata);
            };

            reader.readAsDataURL(new Blob([file.contents], {
              type: metadata.mimetype
            }));
          });
        }
      }
    }
  });

  /**
   * File List View
   */
  var files = new Vue({
    el: '#files',
    data: {
      files: FILE_LIST
    },
    created: function() {
      localforage.iterate(function(value, key, index) {
        var metadata = JSON.parse(localStorage.getItem(key));
        var reader = new FileReader();

        reader.onloadend = function() {
          metadata.uri = reader.result;

          FILE_LIST.unshift(metadata);
        };

        reader.readAsDataURL(new Blob([value], {
          type: metadata.mimetype
        }));
      });
    },
    methods: {
      showkey: function(metadata) {
        prompt('', metadata.key);
      }
    }
  });

  return {
    search: search,
    dropzone: dropzone,
    queue: queue,
    files: files
  };

};
