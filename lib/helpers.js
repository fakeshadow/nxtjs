(function() {

  var crypto = require('crypto');
  var BigInteger = require('jsbn');

  var charToNibble = {};
  var nibbleToChar = [];

  var i;
  for (i = 0; i <= 9; ++i) {
    var character = i.toString();
    charToNibble[character] = i;
    nibbleToChar.push(character);
  }

  for (i = 10; i <= 15; ++i) {
    var lowerChar = String.fromCharCode('a'.charCodeAt(0) + i - 10);
    var upperChar = String.fromCharCode('A'.charCodeAt(0) + i - 10);

    charToNibble[lowerChar] = i;
    charToNibble[upperChar] = i;
    nibbleToChar.push(lowerChar);
  }

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


  function hexStringToByteArray(str) {
    var bytes = [];
    var i = 0;
    if (0 !== str.length % 2) {
      bytes.push(charToNibble[str.charAt(0)]);
      ++i;
    }

    for (; i < str.length - 1; i += 2) {
      bytes.push(
        (charToNibble[str.charAt(i)] << 4) + charToNibble[str.charAt(i + 1)]
      );
    }

    return bytes;
  };


  function byteArrayToHexString(bytes) {
    var str = '';
    for (var i = 0; i < bytes.length; ++i) {
      if (bytes[i] < 0) {
        bytes[i] += 256;
      }
      str += nibbleToChar[bytes[i] >> 4] + nibbleToChar[bytes[i] & 0x0F];
    }

    return str;
  };


  function stringToByteArray(str) {
    str = unescape(encodeURIComponent(str));
    var bytes = new Array(str.length);
    for (var i = 0; i < str.length; ++i) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  };


  function stringToHexString(str) {
    return byteArrayToHexString(stringToByteArray(str));
  };


  module.exports = {
    simpleHash: simpleHash,
    byteArrayToBigInteger: byteArrayToBigInteger,
    intValToByteArray: intValToByteArray,
    byteArrayToIntVal: byteArrayToIntVal,
    hexStringToByteArray: hexStringToByteArray,
    byteArrayToHexString: byteArrayToHexString,
    stringToByteArray: stringToByteArray,
    stringToHexString: stringToHexString,
  };

})();
