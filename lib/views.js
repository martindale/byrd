'use strict';

var Vue = require('vue');
var $ = require('jquery');

module.exports = function(engine) {

  var header = new Vue({
    el: '#header',
    data: {
      key: '',
      menuVisibility: ''
    },
    methods: {
      resolve: function() {

      },
      showmore: function() {
        this.menuVisibility = 'visible';
      },
      showless: function() {
        this.menuVisibility = 'invisible';
      }
    }
  });

  var files = new Vue({
    el: '#files',
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

  return {
    header: header
  };

};
