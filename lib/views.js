'use strict';

var Vue = require('vue');
var $ = require('jquery');

module.exports = function(engine) {

  /**
   * Search View
   */
  var header = new Vue({
    el: '#header',
    data: {
      key: '',
      menuVisibility: ''
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
    header: header,
    dropzone: dropzone
  };

};
