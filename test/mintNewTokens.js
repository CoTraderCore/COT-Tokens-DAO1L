// import ether from './helpers/ether';
import EVMRevert from './helpers/EVMRevert';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MintNewTokens = artifacts.require('MintNewTokens');
const Token = artifacts.require('Token');

contract('MintNewTokens', function([_, wallet]) {

  beforeEach(async function () {
    // Token config
    this.name = "CoTrader";
    this.symbol = "COT";
    this.decimals = 18;
    this.totalSupply = 2000000000; // 2 000 000 000

    // Deploy Token
    this.token = await Token.new(
      this.name,
      this.symbol,
      this.decimals,
      this.totalSupply,
   );

     // Mint config
     this.limit = 10000000000 , // 10 000 000 000
     this.timeNow = Math.floor(Date.now() / 1000);
     this.openingMintTime = latestTime() + duration.days(7); // 1 minute

     // Deploy MintNewTokens
     this.mint = await MintNewTokens.new(
       this.token.address,
       this.limit,
       this.openingMintTime
    );
    // Transfer token ownership to mint
    await this.token.transferOwnership(this.mint.address);
    });

  describe('INIT with correct values', function() {
    it('totalSuply 2000000000)', async function() {
    const total = await this.token.totalSupply();
    assert.equal(total, 2000000000);
    });

    it('owner balance 2000000000)', async function() {
    const balanceOwner = await this.token.balanceOf(_);
    assert.equal(balanceOwner, 2000000000);
    });
  });

  describe('MintLimit', function() {
    it('MintLimit call owner should be fulfilled', async function() {
    await this.mint.MintLimit(wallet, 100).should.be.fulfilled;
    });

    it('MintLimit call not owner should fail', async function() {
    await this.mint.MintLimit(wallet, 100, { from: wallet }).should.be.rejectedWith(EVMRevert);
    });

    it('New Owner call MintLimit should be fulfilled', async function() {
    await this.mint.transferOwnership(wallet, { from: _ })
    await this.mint.MintLimit(wallet, 100, { from: wallet }).should.be.fulfilled;
    });

    it('Old Owner call MintLimit should be fail', async function() {
    await this.mint.transferOwnership(wallet, { from: _ })
    await this.mint.MintLimit(_, 100, { from: _ }).should.be.rejectedWith(EVMRevert);
    });

    it('Call MintLimit with input > limit should be fail', async function() {
    await this.mint.MintLimit(wallet, 10000000000).should.be.rejectedWith(EVMRevert);
    });

    it('totalSuply increases after call MintLimit function', async function() {
    const before = await this.token.totalSupply();
    await this.mint.MintLimit(wallet, 100);
    const after = await this.token.totalSupply();
    assert.isTrue(after > before);
    });
  });

  describe('MintPercent', function() {
    it('Call MintPercent ahead of time should be fail', async function() {
    await this.mint.MintPercent(wallet).should.be.rejectedWith(EVMRevert);
    });

    it('Call MintPercent at the allowed time should be fulfilled', async function() {
    await increaseTimeTo(this.openingMintTime);
    await this.mint.MintPercent(wallet).should.be.fulfilled;
    });

    it('Correct percent 0.1% per week first call is 2 000 000 (curent totalSupply() / 100 / 10))', async function() {
    await increaseTimeTo(this.openingMintTime);
    const oldTotal = await this.token.totalSupply();
    await this.mint.MintPercent(wallet);
    const newTotal = await this.token.totalSupply();
    const sum = await newTotal - oldTotal;
    assert.equal(sum, 2000000);
    });

    it('New Owner call mint percent should be fulfilled', async function() {
    await this.mint.transferOwnership(wallet, { from: _ })
    await increaseTimeTo(this.openingMintTime);
    await this.mint.MintPercent(wallet, { from: wallet }).should.be.fulfilled;
    });

    it('Old Owner call mint percent should be fail', async function() {
    await this.mint.transferOwnership(wallet, { from: _ })
    await increaseTimeTo(this.openingMintTime);
    await this.mint.MintPercent(_, { from: _ }).should.be.rejectedWith(EVMRevert);
    });

    it('totalSuply increases after call MintPercent function', async function() {
    const before = await this.token.totalSupply();
    await increaseTimeTo(this.openingMintTime);
    await this.mint.MintPercent(wallet);
    const after = await this.token.totalSupply();
    assert.isTrue(after > before);
    });

    it('Call MintPercent double call should be fail because after the call, the time increases', async function() {
    await increaseTimeTo(this.openingMintTime);
    await this.mint.MintPercent(wallet).should.be.fulfilled;
    await this.mint.MintPercent(wallet).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ChanheOwner 51%', function() {
    it('Call ChanheOwner from address with balance 0 should be fail', async function() {
    await this.mint.ChangeOwnerDAO(wallet, { from: wallet }).should.be.rejectedWith(EVMRevert);
    });

    it('Call ChangeOwnerDAO from owner with 0 tokens on balance should be fail', async function() {
    await this.token.transfer(wallet, 1000000000);
    await this.mint.ChangeOwnerDAO(wallet, { from: _ }).should.be.rejectedWith(EVMRevert);
    });

    it('Call ChanheOwner from address with balance === no more half should fail', async function() {
    await this.token.transfer(wallet, 1000000000);
    await this.mint.ChangeOwnerDAO(wallet, { from: wallet }).should.be.rejectedWith(EVMRevert);
    });

    it('Call ChanheOwner from address with balance > totalSuply / 2 + 1 token should be fulfilled', async function() {
    await this.token.transfer(wallet, 1000000000 + 1);
    await this.mint.ChangeOwnerDAO(wallet, { from: wallet }).should.be.fulfilled;
    });
  });

  describe('MintLimit correct limit', function() {
    it('Mint limit maximum should be true', async function() {
    const totalSuply = await this.token.totalSupply();
    await this.mint.MintLimit(wallet, 8000000000);
    const totalSuplyAfter = await this.token.totalSupply();
    assert.equal(totalSuplyAfter, 10000000000);
    });

    it('MintLimit maximum + 1 should fail', async function() {
    await this.mint.MintLimit(wallet, 8000000001).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('transferOwnership standard openzeppelin stuff (optional)', function() {
    it('Call transferOwnership from owner should be fulfilled', async function() {
    await this.mint.transferOwnership(wallet, { from: _ }).should.be.fulfilled;
    });

    it('Call transferOwnership from NOT owner should be fail', async function() {
    await this.mint.transferOwnership(wallet, { from: wallet }).should.be.rejectedWith(EVMRevert);
    });
  });

});
