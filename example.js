var Jay = require('./jay.js'),
    jay = new Jay();

jay.request('getBlockchainStatus', {}, function(data){
  console.log(data);
});
