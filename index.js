(function() {

  var account = require('./lib/account');
  var token = require('./lib/token');

  module.exports = {
    secretPhraseToPublicKey: account.secretPhraseToPublicKey,
    publicKeyToAccountId: account.publicKeyToAccountId,
    secretPhraseToAccountId: account.secretPhraseToAccountId,
    signTransactionBytes: account.signTransactionBytes,
    createToken: token.createToken,
    parseToken: token.parseToken,
  };

})();
