'use strict';

var bitcore = require('bitcore-lib');
var Buffer = bitcore.deps.Buffer;
var sha256 = bitcore.crypto.Hash.sha256;

function inherits(ctor, superCtor) {
  ctor.super_ = superCtor
  var TempCtor = function () {}
  TempCtor.prototype = superCtor.prototype
  ctor.prototype = new TempCtor()
  ctor.prototype.constructor = ctor
}
