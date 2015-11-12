'use strict';

window.byrd.Chomper = (function() {

  function Chomper() {
    this.logo = document.getElementById('logo');
  }

  Chomper.prototype.start = function() {
    this.logo.setAttribute('style', 'background-image:url("/img/byrd.gif")');
  };

  Chomper.prototype.stop = function() {
    var self = this;

    setTimeout(function() {
      self.logo.removeAttribute('style');
    }, 800);
  };

  return Chomper;
})();
