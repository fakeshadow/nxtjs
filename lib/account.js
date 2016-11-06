(function() {

  var crypto = require('crypto');
  var converters = require('../util/converters.js');
  var curve25519 = require('../util/curve25519.js');
  var NxtAddress = require('../util/nxtaddress.js');
  var helpers = require('./helpers')

  function secretPhraseToPublicKey(secretPhrase) {
    var hash = converters.hexStringToByteArray(
      helpers.simpleHash(secretPhrase, 'hex')
    );
    var pubKey = curve25519.keygen(hash).p;
    return converters.byteArrayToHexString(pubKey);
  };


  function publicKeyToAccountId(publicKey, numeric) {
    var arr = converters.hexStringToByteArray(publicKey);
    var account = helpers.simpleHash(arr, 'hex');

    var slice = (converters.hexStringToByteArray(account)).slice(0, 8);
    var accountId = helpers.byteArrayToBigInteger(slice).toString();

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


  function signBytes(message, secretPhrase) {
    var messageBytes = message;
    var secretPhraseBytes = converters.stringToByteArray(secretPhrase);

    var digest = helpers.simpleHash(secretPhraseBytes);
    var s = curve25519.keygen(digest).s;
    var m = helpers.simpleHash(messageBytes);

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



  module.exports = {
    secretPhraseToPublicKey: secretPhraseToPublicKey,
    publicKeyToAccountId: publicKeyToAccountId,
    secretPhraseToAccountId: secretPhraseToAccountId,
    signTransactionBytes: signTransactionBytes,
    signBytes: signBytes,
  };

})();
