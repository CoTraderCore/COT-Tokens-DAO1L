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
    this.name = "Cotrader";
    this.symbol = "COT";
    this.decimals = 18;
    this.totalSupply = 20000000000;

    // Deploy Token
    this.token = await Token.new(
      this.name,
      this.symbol,
      this.decimals,
      this.totalSupply,
   );

     // Mint config
     this.halfTotalSupply = 40000000000,
     this.limit = 80000000000,
     this.openingMintTime = latestTime() + duration.minutes(1) // 1 minute

     // Deploy MintNewTokens
     this.mint = await MintNewTokens.new(
       this.token.address,
       this.halfTotalSupply,
       this.limit,
       this.openingMintTime
    );
    // Transfer token ownership to mint
    await this.token.transferOwnership(this.mint.address);
    });

  describe('MintLimit', function() {
    it('MintLimit call owner should be fulfilled', async function() {
    await this.mint.MintLimit(wallet, 100).should.be.fulfilled;
    });

    it('MintLimit call not owner should fail', async function() {
    await this.mint.MintLimit(wallet, 100, { from: wallet }).should.be.rejectedWith(EVMRevert);
    });

    it('Call MintLimit with input > limit should fail', async function() {
    await this.mint.MintLimit(wallet, 80000000000).should.be.rejectedWith(EVMRevert);
    });

    it('totalSuply increases after call MintLimit function', async function() {
    const before = await this.token.totalSupply();
    await this.mint.MintLimit(wallet, 100);
    const after = await this.token.totalSupply();
    assert.isTrue(after > before);
    });
  });

  describe('MintPercent', function() {
    it('Call MintPercent ahead of time should fail', async function() {
    await this.mint.MintPercent(wallet).should.be.rejectedWith(EVMRevert);
    });

    it('Call MintPercent at the allowed time should be fulfilled', async function() {
    await increaseTimeTo(this.openingMintTime, duration.minutes(2));
    await this.mint.MintPercent(wallet).should.be.fulfilled;
    });

    it('totalSuply increases after call MintPercent function', async function() {
    const before = await this.token.totalSupply();
    await increaseTimeTo(this.openingMintTime, duration.minutes(2));
    await this.mint.MintPercent(wallet);
    const after = await this.token.totalSupply();
    assert.isTrue(after > before);
    });

    it('Call MintPercent double call should be fail because after the call, the time increases', async function() {
    await increaseTimeTo(this.openingMintTime, duration.minutes(2));
    await this.mint.MintPercent(wallet).should.be.fulfilled;
    await this.mint.MintPercent(wallet).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ChanheOwner 51%', function() {
    it('Call ChanheOwner from address with balance 0 should fail', async function() {
    await this.mint.ChangeOwnerDAO(wallet, { from: wallet }).should.be.rejectedWith(EVMRevert);
    });

    it('Call ChanheOwner from address with balance > totalSuply / 2 should fulfilled', async function() {
    await this.mint.MintLimit(wallet, 40000000001);
    await this.mint.ChangeOwnerDAO(wallet, { from: wallet }).should.be.fulfilled;
    });

  });

  describe('MintLimit correct limit', function() {
    it('totalSuply equal 20000000000', async function() {
    const totalSuply = await this.token.totalSupply();
    assert.equal(totalSuply, 20000000000);
    });

    it('Mint limit maximum should be fulfilled', async function() {
    const totalSuply = await this.token.totalSupply();
    await this.mint.MintLimit(wallet, 60000000000);
    const totalSuplyAfter = await this.token.totalSupply();
    assert.equal(totalSuplyAfter, 80000000000);
    });

    it('Mint + 1 more limit should fail', async function() {
    await this.mint.MintLimit(wallet, 60000000001).should.be.rejectedWith(EVMRevert);
    });
  });


})
