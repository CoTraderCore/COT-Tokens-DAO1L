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
  const name = "Cotrader";
  const symbol = "COT";
  const decimals = 18;
  const totalSupply = 20000000000;
  const limit = 80000000000;

  const halfTotalSupply = 40000000000; // For 51% comparison
  const start = 1538568527; // Unix Data
  const cliff = _duration.minutes(3); // Time in seconds
  const duration = _duration.minutes(12); // Time in seconds
  const revocable = false; // Owner can not return tokens until time runs out

  const timeNow = Math.floor(Date.now() / 1000);
  const openingMintTime = timeNow  + _duration.minutes(1);

  // Team address pass in Vesting contract
  const beneficiary = "0xf17f52151ebef6c7334fad080c5704d77216b732";
  // Tokens for Vesting contract
  const amount = 30000000000;



  deployer.deploy(VestingToken, beneficiary, start, cliff, duration, revocable, {gas:4712388}).then(() =>{
  return deployer.deploy(Token, name, symbol, decimals, totalSupply, {gas:4712388}).then(() => {
    const token = Token.at(Token.address);
    // Transfer 10B to Vesting contract
    token.transfer(VestingToken.address, amount);
  }).then(() => {
    return deployer.deploy(MintNewTokens, Token.address, halfTotalSupply, limit, openingMintTime, {gas:5712388});
  }).then(() => {
    const token = Token.at(Token.address);
    // Only contract can call mint function
    token.transferOwnership(MintNewTokens.address);
  });
  });
};
