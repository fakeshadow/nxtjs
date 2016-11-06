(function() {

  var crypto = require('crypto');
  var BigInteger = require('jsbn');

  function simpleHash(message, encoding) {
    if (message instanceof Array) {
      message = Buffer.from(message);
    }
    return crypto.createHash('sha256').update(message).digest(encoding);
  };


  function byteArrayToBigInteger(byteArray, startIndex) {
    var value = new BigInteger('0', 10);
    var temp1, temp2;
    for (var i = byteArray.length - 1; i >= 0; i--) {
      temp1 = value.multiply(new BigInteger('256', 10));
      temp2 = temp1.add(new BigInteger(byteArray[i].toString(10), 10));
      value = temp2;
    }
    return value;
  };


  function intValToByteArray(number) {
    // We want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0];
    for (var index = 0; index < byteArray.length; index ++) {
      var byte = number & 0xff;
      byteArray [ index ] = byte;
      long = (number - byte) / 256 ;
    }
    return byteArray;
  };


  function byteArrayToIntVal(byteArray) {
    // We want to represent the input as a 8-bytes array
    var intval = 0;
    for (var index = 0; index < byteArray.length; index ++) {
      var byt = byteArray[index] & 0xFF;
      var value = byt * Math.pow(256, index);
      intval += value;
    }
    return intval;
  };


  module.exports = {
    simpleHash: simpleHash,
    byteArrayToBigInteger: byteArrayToBigInteger,
    intValToByteArray: intValToByteArray,
    byteArrayToIntVal: byteArrayToIntVal,
  };

})();
