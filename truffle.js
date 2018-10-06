require('babel-register');
require('babel-polyfill');

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
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
