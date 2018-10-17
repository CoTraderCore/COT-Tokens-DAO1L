const Token = artifacts.require("./COT.sol");
const VestingToken = artifacts.require("VestingToken");
const COTDAO = artifacts.require("COTDAO");
const COTCrowdsale = artifacts.require("COTCrowdsale");

// Helpers
const _duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};

function ether (n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}


module.exports = function(deployer) {
  // PARAMETRS

  //Token
  const name = "CoTrader";
  const symbol = "COT";
  const decimals = 18;
  const totalSupply = 10000000000000000000000000000; // 10 000 000 000

  //Crowdsale
  const rate = 1750000; // TODO: Replace me
  const wallet = "0xf1d01163ccAc6D884f770B3251944dE551944680"; // TODO: Replace me
  const cap = ether(500); // TODO: Replace me

  // Vesting
  const start = 1538568527; // Unix Data TODO: (SEND RIGHT Data)
  const cliff = _duration.years(1); // Time in seconds
  const duration = _duration.years(4); // Time in seconds
  const revocable = false; // Owner can not return tokens until time runs out
  const timeNow = Math.floor(Date.now() / 1000);
  const TeamAddress = "0xf1d01163ccAc6D884f770B3251944dE551944680"; //TODO: Replace me
  // Tokens for Vesting contract
  const amount = 10000000000000000000000000000; // 10 000 000 000

  // DAO
  const openingMintTime = timeNow + _duration.days(7);
  const limit = 100000000000000000000000000000; // 100 000 000 000
  const GaryAddress = "0x7035fb83a7c18289b94e443170bee56b92df8e46"; //TODO: Replace me


  // DEPLOY

  deployer.deploy(VestingToken, TeamAddress, start, cliff, duration, revocable).then( async () => {
    await deployer.deploy(Token, name, symbol, decimals, totalSupply);

    const token = await Token.at(Token.address);
    // Transfer 10B to Vesting contract
    await token.transfer(VestingToken.address, amount);
    // Block tokens
    await token.pause();

    await deployer.deploy(COTDAO, Token.address, limit, openingMintTime);
    // transferOwnership of DAO to Gary
    const dao = await Token.at(COTDAO.address);
    await dao.transferOwnership(GaryAddress);

    await deployer.deploy(COTCrowdsale, rate, wallet, Token.address, COTDAO.address, limit, cap);
    // transferOwnership of Sale to Gary
    const sale = await Token.at(COTCrowdsale.address);
    await sale.transferOwnership(GaryAddress);
    // transferOwnership of token to sale contract
    await token.transferOwnership(COTCrowdsale.address);
  })
};
