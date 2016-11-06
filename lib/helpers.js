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

  module.exports = {
    simpleHash: simpleHash,
    byteArrayToBigInteger: byteArrayToBigInteger,
  };

})();
