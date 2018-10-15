const Token = artifacts.require("./COT.sol");
const VestingToken = artifacts.require("VestingToken");
const COTDAO = artifacts.require("COTDAO");
const COTCrowdsale = artifacts.require("COTCrowdsale");

const _duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};


module.exports = function(deployer) {
  // PARAMETRS

  //Token
  const name = "CoTrader";
  const symbol = "COT";
  const decimals = 18;
  const totalSupply = 10000000000000000000000000000; // 10 000 000 000
  //Crowdsale
  const rate = 500;
  const wallet = "0x627306090abab3a6e1400e9345bc60c78a8bef57"; // TODO: Replace me
  // Vesting
  const start = 1538568527; // Unix Data TODO: (SEND RIGHT Data)
  const cliff = _duration.years(1); // Time in seconds
  const duration = _duration.years(4); // Time in seconds
  const revocable = false; // Owner can not return tokens until time runs out
  const timeNow = Math.floor(Date.now() / 1000);
  // TeamAddress pass in Vesting contract
  const TeamAddress = "0x7035fb83a7c18289b94e443170bee56b92df8e46"; //TODO: Replace me
  // Tokens for Vesting contract
  const amount = 10000000000000000000000000000; // 10 000 000 000
  // DAO
  const openingMintTime = timeNow + _duration.days(7);
  const limit = 100000000000000000000000000000; // 100 000 000 000


  // DEPLOY

  deployer.deploy(VestingToken, TeamAddress, start, cliff, duration, revocable).then(() =>{
  return deployer.deploy(Token, name, symbol, decimals, totalSupply).then(() => {
    const token = Token.at(Token.address);
    // Transfer 10B to Vesting contract
    token.transfer(VestingToken.address, amount);
  })
  .then(()=>{
    const token = Token.at(Token.address);
    // Block tokens
    token.pause();
  })
  .then(()=>{
    // Deploy DAO
    return deployer.deploy(COTDAO, Token.address, limit, openingMintTime);
  })
  .then(() => {
    //Deploy sale
    return deployer.deploy(COTCrowdsale, rate, wallet, Token.address, COTDAO.address, limit)
  })
  .then(() => {
    const token = Token.at(Token.address);
    // transferOwnership of token to crowdsale
    token.transferOwnership(COTCrowdsale.address);
  });
});
};
