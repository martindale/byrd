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

  return {
    header: header
  };

};
