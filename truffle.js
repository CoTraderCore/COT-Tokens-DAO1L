require('babel-register');
require('babel-polyfill');

var HDWalletProvider = require("truffle-hdwallet-provider");

var infura_apikey = "";
var mnemonic = "";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 9545,
      network_id: '*',
      gas: 6300000,
    },
    ganache: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
    },
    ropsten: {
      provider: function() {
		  return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+infura_apikey)
		  },
      gas: 6300000,
      network_id: 3
    },
    rinkeby: {
      provider: function() {
		  return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/"+infura_apikey)
		  },
      gas: 6300000,
      network_id: 4
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
