# nxtjs
Small collection of JavaScript functions for Nxt. Allows for local signing of transactions and token creation

## API

### getNxtTime()
Returns time in seconds since Nxt genesis block

### secretPhraseToPublicKey(secretPhrase)
Returns public key of a given passphrase

### publicKeyToAccountId(publicKey, numeric)
Returns account ID of a given public key. Set the second parameter to true to
get numeric account ID insted of RS format

### secretPhraseToAccountId(secretPhrase, numeric)
Returns account ID of a given passphrase.  Set the second parameter to true to
get numeric account ID insted of RS format.

### signTransactionBytes(unsignedTransactionBytes, secretPhrase)
Signs a hex string of unsigned transaction bytes (e.g. as received from NRS API)
with the provided passphrase and returns it.

### createToken(string, secretPhrase)
Generates a Nxt cryptographic token

### parseToken(token, string)
Parses a Nxt cryptographic token. Returns an object with the keys `isValid`,
`timestamp`, `publicKey` and `accountRS`.
