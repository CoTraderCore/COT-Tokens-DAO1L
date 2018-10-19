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
// Helpers
function ether (n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}


module.exports = function(deployer) {
  // PARAMETRS

  //Token
  const name = "CoTrader";
  const symbol = "COT";
  const decimals = 18; // 1 COT is 1000000000000000000 decimals like ether
  const totalSupply = ether(10000000000); // 10 000 000 000

  //Crowdsale
  const rate = 1750000; // 1400000 + 350000 is 25% by default
  const ICOrate = 1400000;
  const percent = 24;
  const ICOWallet = "0x7035fb83a7c18289b94e443170bee56b92df8e46"; // TODO: Replace me
  const cap = ether(3000);

  // Vesting
  const start = 1539926426; // Unix Data TODO: (SEND RIGHT Data)
  const cliff = _duration.weeks(4); // Time in seconds
  const duration = _duration.years(4); // Time in seconds
  const revocable = false; // Owner can not return tokens until time runs out
  const timeNow = Math.floor(Date.now() / 1000);
  const TeamAddress = "0x7035fb83a7c18289b94e443170bee56b92df8e46"; //TODO: Replace me
  const amount = ether(10000000000); // Tokens for Vesting contract 10 000 000 000

  // DAO
  const openingMintTime = timeNow + _duration.days(7);
  const limit = ether(100000000000); // 100 000 000 000
  const half =  ether(50000000000); // 50 000 000 000
  const GaryAddress = "0x7035fb83a7c18289b94e443170bee56b92df8e46"; //TODO: Replace me


  // DEPLOY

  deployer.deploy(VestingToken, TeamAddress, start, cliff, duration, revocable).then( async () => {
    await deployer.deploy(Token, name, symbol, decimals, totalSupply);

    const token = await Token.at(Token.address);
    // Transfer 10B to Vesting contract
    await token.transfer(VestingToken.address, amount);
    // Block tokens
    await token.pause();

    await deployer.deploy(COTDAO, Token.address, limit, openingMintTime, half);
    // transferOwnership of DAO to Gary
    //const dao = await Token.at(COTDAO.address); //TODO: uncoment me
    //await dao.transferOwnership(GaryAddress); //TODO: uncoment me

    await deployer.deploy(COTCrowdsale, rate, ICOWallet, Token.address, COTDAO.address, limit, cap, percent, ICOrate);
    // transferOwnership of Sale to Gary
    //const sale = await Token.at(COTCrowdsale.address); //TODO: uncoment me
    //await sale.transferOwnership(GaryAddress); //TODO: uncoment me
    // transferOwnership of token to sale contract
    await token.transferOwnership(COTCrowdsale.address);
  })
};
