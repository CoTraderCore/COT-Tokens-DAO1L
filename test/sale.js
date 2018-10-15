import ether from './helpers/ether';
import EVMRevert from './helpers/EVMRevert';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const COTDAO = artifacts.require('COTDAO');
const Token = artifacts.require('COT');
const Sale = artifacts.require('COTCrowdsale');

contract('Sale', function([_, wallet]) {

  beforeEach(async function () {
    // Token config
    this.name = "CoTrader";
    this.symbol = "COT";
    this.decimals = 18;
    // ether convert 10 000 000 000 COT to 10000000000000000000000000000 hex
    this.totalSupply = ether(10000000000);

    // Deploy Token
    this.token = await Token.new(
      this.name,
      this.symbol,
      this.decimals,
      this.totalSupply,
   );

     // dao config
     this.limit = ether(100000000000), // 100 000 000 000
     this.timeNow = Math.floor(Date.now() / 1000);
     this.openingdaoTime = latestTime() + duration.days(7); // 1 minute

     // Deploy COTDAO
     this.dao = await COTDAO.new(
       this.token.address,
       this.limit,
       this.openingdaoTime
   );

    //Crowdsale
    this.rate = 500;
    this.wallet = "0x627306090abab3a6e1400e9345bc60c78a8bef57"; // TODO: Replace me

    //Deploy sale
    this.sale = await Sale.new(
        this.rate,
        this.wallet,
        this.token.address,
        this.dao.address,
        this.limit
    );
    // block Tokens
    await this.token.pause();
    // Transfer token ownership to dao
    await this.token.transferOwnership(this.sale.address);
  });

  describe('INIT with correct values', function() {
    it('Owner SALE is _', async function() {
    const owner = await this.sale.owner();
    assert.equal(owner, _);
    });

    it('tokens init blocked', async function() {
    await this.token.transfer(wallet, ether(1)).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('SALE ownership', function() {
    it('DAO can not mint if owner SALE', async function() {
    await this.dao.MintLimit(_, ether(1)).should.be.rejectedWith(EVMRevert);
    });

    it('DAO can mint if sale transferOwnership', async function() {
    await this.sale.transferTokenOwnerToDAO();
    await this.dao.MintLimit(_, ether(1)).should.be.fulfilled;
    });

    it('Owner Sale can call MintLimit', async function() {
    await this.sale.MintLimit(_, ether(1)).should.be.fulfilled;
    });

    it('Owner Sale can not mint after transferOwnership', async function() {
    await this.sale.transferTokenOwnerToDAO();
    await this.sale.MintLimit(_, ether(1)).should.be.rejectedWith(EVMRevert);
    });

    it('totalSuply increase when owner call MintLimit', async function() {
    const before = await this.token.totalSupply();
    await this.sale.MintLimit(_, ether(1));
    const after = await this.token.totalSupply();
    assert.isTrue(web3.fromWei(after, 'ether') > web3.fromWei(before, 'ether'));
    });

    it('receiver balance increase when owner call MintLimit', async function() {
    const before = await this.token.balanceOf(wallet);
    await this.sale.MintLimit(wallet, ether(1));
    const after = await this.token.balanceOf(wallet);
    assert.isTrue(web3.fromWei(after, 'ether') > web3.fromWei(before, 'ether'));
    });

    it('Sale contract exchange ETH to tokens', async function() {
    await this.sale.sendTransaction({ value: ether(1), from: _}).should.be.fulfilled;
    });

    it('Sale contract CAN NOT exchange ETH to tokens after transferOwnership', async function() {
    await this.sale.transferTokenOwnerToDAO();
    await this.sale.sendTransaction({ value: ether(1), from: _}).should.be.rejectedWith(EVMRevert);
    });
  });

});
