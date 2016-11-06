(function() {

  var crypto = require('crypto');
  var BigInteger = require('jsbn');
  var converters = require('./util/converters.js');
  var curve25519 = require('./util/curve25519.js');
  var NxtAddress = require('./util/nxtaddress.js');

  var epochNum = 1385294400;

  /**
   * Public functions
   */
  function getNxtTime() {
    return Math.floor(Date.now() / 1000) - epochNum;
  };


  function secretPhraseToPublicKey(secretPhrase) {
    var hash = converters.hexStringToByteArray(
      simpleHash(secretPhrase, 'hex')
    );
    var pubKey = curve25519.keygen(hash).p;
    return converters.byteArrayToHexString(pubKey);
  };


  function publicKeyToAccountId(publicKey, numeric) {
    var arr = converters.hexStringToByteArray(publicKey);
    var account = simpleHash(arr, 'hex');

    var slice = (converters.hexStringToByteArray(account)).slice(0, 8);
    var accountId = byteArrayToBigInteger(slice).toString();

    if (numeric) {
      return accountId;
    }
    var address = new NxtAddress();
    if (!address.set(accountId)) {
      return '';
    }
    return address.toString();
  };


  function secretPhraseToAccountId(secretPhrase, numeric) {
    var pubKey = secretPhraseToPublicKey(secretPhrase);
    return publicKeyToAccountId(pubKey, numeric);
  };


  function signTransactionBytes(data, secretPhrase) {

    var unsignedBytes = converters.hexStringToByteArray(data);
    var sig = signBytes(unsignedBytes, secretPhrase);

    var signed = unsignedBytes.slice(0,96);
    signed = signed.concat(sig);
    signed = signed.concat(unsignedBytes.slice(96 + 64));

    return converters.byteArrayToHexString(signed);
  };


  function createToken(websiteString, secretPhrase) {
    var hexwebsite = converters.stringToHexString(websiteString);
    var website = converters.hexStringToByteArray(hexwebsite);
    var data = [];
    data = website.concat(getPublicKey(secretPhrase));
    var unix = Math.round(+new Date() / 1000);
    var timestamp = unix - epochNum;
    var timestamparray = toByteArray(timestamp);
    data = data.concat(timestamparray);

    var token = [];
    token = getPublicKey(secretPhrase).concat(timestamparray);

    var sig = signBytes(data, secretPhrase);

    token = token.concat(sig);

    var buf = '';
    for (var ptr = 0; ptr < 100; ptr += 5) {

      var nbr = [];
      nbr[0] = token[ptr] & 0xFF;
      nbr[1] = token[ptr + 1] & 0xFF;
      nbr[2] = token[ptr + 2] & 0xFF;
      nbr[3] = token[ptr + 3] & 0xFF;
      nbr[4] = token[ptr + 4] & 0xFF;
      var number = byteArrayToBigInteger(nbr);

      if (number < 32) {
        buf += '0000000';
      } else if (number < 1024) {
        buf += '000000';
      } else if (number < 32768) {
        buf += '00000';
      } else if (number < 1048576) {
        buf += '0000';
      } else if (number < 33554432) {
        buf += '000';
      } else if (number < 1073741824) {
        buf += '00';
      } else if (number < 34359738368) {
        buf += '0';
      }
      buf += number.toString(32);
    }

    return buf;
  };

  function parseToken(tokenString, website) {
    var websiteBytes = converters.stringToByteArray(website);
    var tokenBytes = [];
    var i = 0;
    var j = 0;

    for (; i < tokenString.length; i += 8, j += 5) {

      var number = new BigInteger(tokenString.substring(i, i + 8), 32);
      var part = converters.hexStringToByteArray(number.toRadix(16));

      tokenBytes[j] = part[4];
      tokenBytes[j + 1] = part[3];
      tokenBytes[j + 2] = part[2];
      tokenBytes[j + 3] = part[1];
      tokenBytes[j + 4] = part[0];
    }

    if (i != 160) {
      return new Error('tokenString parsed to invalid size');
    }
    var publicKey = [];
    publicKey = tokenBytes.slice(0, 32);
    var timebytes = [
      tokenBytes[32],
      tokenBytes[33],
      tokenBytes[34],
      tokenBytes[35],
    ];

    var timestamp = toIntVal(timebytes);
    var signature = tokenBytes.slice(36, 100);

    var data = websiteBytes.concat(tokenBytes.slice(0, 36));

    var isValid = verifyBytes(signature, data, publicKey);

    var ret = {};
    ret.isValid = isValid;
    ret.timestamp = timestamp;
    ret.publicKey = converters.byteArrayToHexString(publicKey);
    ret.accountRS = publicKeyToAccountId(ret.publicKey);

    return ret;
  };


  /**
   * Private functions
   */
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


  function toByteArray(long) {
    // We want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0];
    for (var index = 0; index < byteArray.length; index ++) {
      var byte = long & 0xff;
      byteArray [ index ] = byte;
      long = (long - byte) / 256 ;
    }
    return byteArray;
  };


  function toIntVal(byteArray) {
    // We want to represent the input as a 8-bytes array
    var intval = 0;
    for (var index = 0; index < byteArray.length; index ++) {
      var byt = byteArray[index] & 0xFF;
      var value = byt * Math.pow(256, index);
      intval += value;
    }
    return intval;
  };


  function areByteArraysEqual(bytes1, bytes2) {
    if (bytes1.length !== bytes2.length) {
      return false;
    }
    for (var i = 0; i < bytes1.length; ++i) {
      if (bytes1[i] !== bytes2[i]) {
        return false;
      }
    }
    return true;
  };


  function getPublicKey(secretPhrase) {
    var hash = crypto.createHash('sha256').update(secretPhrase);
    var ky = converters.byteArrayToHexString(
      curve25519.keygen(
        hash.digest()
      ).p
    );
    return converters.hexStringToByteArray(ky);
  };


  function signBytes(message, secretPhrase) {
    var messageBytes = message;
    var secretPhraseBytes = converters.stringToByteArray(secretPhrase);

    var digest = simpleHash(secretPhraseBytes);
    var s = curve25519.keygen(digest).s;
    var m = simpleHash(messageBytes);

    var hash = crypto.createHash('sha256');
    var mBuf = Buffer.from(m);
    var sBuf = Buffer.from(s);
    hash.update(mBuf)
    hash.update(sBuf)
    var x = hash.digest()

    var y = curve25519.keygen(x).p;

    hash = crypto.createHash('sha256');
    var yBuf = Buffer.from(y)
    hash.update(mBuf)
    hash.update(yBuf)
    var h = converters.hexStringToByteArray(
      hash.digest('hex')
    );

    var v = curve25519.sign(h, x, s);
    return v.concat(h);
  };


  function verifyBytes(signature, message, publicKey) {
    var signatureBytes = signature;
    var messageBytes = message;
    var publicKeyBytes = publicKey;
    var v = signatureBytes.slice(0, 32);
    var h = signatureBytes.slice(32);
    var y = Buffer.from(
      curve25519.verify(v, h, publicKeyBytes)
    );

    var m = Buffer.from(simpleHash(messageBytes));
    var hash = crypto.createHash('sha256');
    hash.update(m);
    hash.update(y);
    var h2 = hash.digest();

    return areByteArraysEqual(h, h2);
  };


  module.exports = {
    getNxtTime: getNxtTime,
    secretPhraseToPublicKey: secretPhraseToPublicKey,
    publicKeyToAccountId: publicKeyToAccountId,
    secretPhraseToAccountId: secretPhraseToAccountId,
    signTransactionBytes: signTransactionBytes,
    createToken: createToken,
    parseToken: parseToken,
  };

})();
