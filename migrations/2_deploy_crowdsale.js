const Token = artifacts.require("./Token.sol");
const VestingToken = artifacts.require("VestingToken");
const MintNewTokens = artifacts.require("MintNewTokens");

const _duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};


module.exports = function(deployer) {
  const name = "CoTrader";
  const symbol = "COT";
  const decimals = 18;
  const totalSupply = 2000000000; // 2 000 000 000
  const limit = 10000000000; // 10 000 000 000

  const start = 1538568527; // Unix Data
  const cliff = _duration.years(1); // Time in seconds
  const duration = _duration.years(4); // Time in seconds
  const revocable = false; // Owner can not return tokens until time runs out

  const openingMintTime = web3.eth.getBlock('latest').timestamp  + _duration.days(7);

  // Team address pass in Vesting contract
  const beneficiary = "0xf17f52151ebef6c7334fad080c5704d77216b732";
  // Tokens for Vesting contract
  // limit * 0.1
  const amount = 1000000000; // 1 000 000 000

  // SEND ALL Tokens in Ropsten test deploy
  const GaryAddress = "0x7035fb83a7c18289b94e443170bee56b92df8e46";



  deployer.deploy(VestingToken, beneficiary, start, cliff, duration, revocable, {gas:4712388}).then(() =>{
  return deployer.deploy(Token, name, symbol, decimals, totalSupply, {gas:4712388}).then(() => {
    const token = Token.at(Token.address);
    // Transfer 10B to Vesting contract
    token.transfer(VestingToken.address, amount);
  }).then(() => {
    return deployer.deploy(MintNewTokens, Token.address, limit, openingMintTime, {gas:5712388});
  }).then(() => {
    const token = Token.at(Token.address);
    // Only contract can call mint function
    token.transferOwnership(MintNewTokens.address);
  });
  });
};
