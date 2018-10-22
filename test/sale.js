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
    this.totalSupply = ether(10);

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
     this.half = ether(50000000000); // 50 000 000 000

     // Deploy COTDAO
     this.dao = await COTDAO.new(
       this.token.address,
       this.limit,
       this.openingdaoTime,
       this.half
   );

    //Crowdsale
    this.rate = 1750000;
    this.wallet = "0x627306090abab3a6e1400e9345bc60c78a8bef57"; // TODO: Replace me
    this.cap = ether(10); // CAP
    this.ICOrate = 1400000;
    this.percent = 24;
    //Deploy sale
    this.sale = await Sale.new(
        this.rate,
        this.wallet,
        this.token.address,
        this.dao.address,
        this.limit,
        this.cap,
        this.percent,
        this.ICOrate
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

    it('Correct DAO address in sale contract', async function() {
    const DAOaddress = await this.sale.DAOAddress();
    assert.equal(DAOaddress, this.dao.address);
    });

    it('Correct Token address in sale contract', async function() {
    const TokenAddress = await this.sale.token();
    assert.equal(TokenAddress, this.token.address);
    });

    it('Correct init rate (PrePreSale by default) (25%)', async function() {
    const oldBalance = await this.token.balanceOf(_);
    await this.sale.sendTransaction({ value: ether(1), from: _});
    const newBalance = await this.token.balanceOf(_);
    const sum = await web3.fromWei(newBalance, 'ether') - web3.fromWei(oldBalance, 'ether');
    assert.equal(sum, 1750000);
    });

    it('Balance Wallet 0', async function() {
    const balance = await this.token.balanceOf(wallet);
    assert.equal(web3.fromWei(balance, 'ether'), 0);
    });
  });

  describe('SALE', function() {
    it('Owner DAO can not call mintLimit if owner is SALE', async function() {
    await this.dao.MintLimit(_, ether(1)).should.be.rejectedWith(EVMRevert);
    });

    it('Owner DAO can call mintLimit if sale transferOwnership', async function() {
    await this.sale.transferTokenOwnerToDAO();
    await this.dao.MintLimit(_, ether(1)).should.be.fulfilled;
    });

    it('DAO can not call mintPercent if owner is SALE', async function() {
    await this.dao.MintLimit(_, ether(1)).should.be.rejectedWith(EVMRevert);
    });

    it('DAO can call mintPercent if sale transferOwnership', async function() {
    await this.sale.transferTokenOwnerToDAO();
    await this.dao.MintLimit(_, ether(1)).should.be.fulfilled;
    });

    it('Owner DAO can not call unpauseDAO if owner is SALE', async function() {
    await this.dao.unpauseDAO().should.be.rejectedWith(EVMRevert);
    });

    it('Owner DAO can call unpauseDAO if sale transferOwnership', async function() {
    await this.sale.transferTokenOwnerToDAO();
    await this.dao.unpauseDAO().should.be.fulfilled;
    });

    it('Owner Sale can call MintLimit from sale', async function() {
    await this.sale.MintLimit(_, ether(1)).should.be.fulfilled;
    });

    it('NOT Owner Sale can NOT call MintLimit from sale', async function() {
    await this.sale.MintLimit(_, ether(1), { from:wallet }).should.be.rejectedWith(EVMRevert);
    });

    it('NOT Owner Sale can NOT call transferTokenOwnerToDAO', async function() {
    await this.sale.transferTokenOwnerToDAO({ from:wallet }).should.be.rejectedWith(EVMRevert);
    });

    it('Owner Sale can not mint after transferOwnership', async function() {
    await this.sale.transferTokenOwnerToDAO();
    await this.sale.MintLimit(_, ether(1)).should.be.rejectedWith(EVMRevert);
    });

    it('totalSuply increase when owner call MintLimit from sale', async function() {
    const before = await this.token.totalSupply();
    await this.sale.MintLimit(_, ether(1));
    const after = await this.token.totalSupply();
    assert.isTrue(web3.fromWei(after, 'ether') > web3.fromWei(before, 'ether'));
    });

    it('receiver balance increase when owner call MintLimit from sale', async function() {
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

    it('sender balance increase after send ETH to ICO contract', async function() {
    const before = await this.token.balanceOf(_);
    await this.sale.sendTransaction({ value: ether(1), from: _});
    const after = await this.token.balanceOf(_);
    assert.isTrue(web3.fromWei(after, 'ether') > web3.fromWei(before, 'ether'));
    });
  });

  describe('CAP', function() {
    it('CAP Limit (cap is 10 eth for test)', async function() {
    await this.sale.sendTransaction({ value: ether(10), from: _}).should.be.fulfilled;
    });
    it('try buy more cap limit should be fail', async function() {
    await this.sale.sendTransaction({ value: ether(11), from: _}).should.be.rejectedWith(EVMRevert);
   });
  });

  describe('BONUS for early investors', function() {
    it('NOT Owner can NOT call ReduceRate', async function() {
    await this.sale.ReduceRate({ from: wallet}).should.be.rejectedWith(EVMRevert);
    });

    it('Correct ReduceRate call, after 25 call rate equal 1400000', async function() {
    for(var i = 0; i < 25; i ++){
    await this.sale.ReduceRate({ from: _ }).should.be.fulfilled;
    }
    const r = await this.sale.rate();
    assert.equal(r, 1400000);
    });

    it('Can not call ReduceRate more than 25 times', async function() {
    for(var i = 0; i < 25; i ++){
    await this.sale.ReduceRate({ from: _ }).should.be.fulfilled;
    }
    await this.sale.ReduceRate({ from: _ }).should.be.rejectedWith(EVMRevert);
    });

    it('Correct reduce percent after 1 call percent is 24% is 336000 (1400 000 / 100 * 24)', async function() {
    await this.sale.ReduceRate({ from: _ }); // 24%
    await this.sale.sendTransaction({ value: ether(1), from: wallet});
    const balance = await this.token.balanceOf(wallet);
    const sum = await web3.fromWei(balance, 'ether') - 1400000;
    assert.equal(sum, 336000);
    });

    it('Correct reduce percent after 4 call percent is 20% is 280000 (1400 000 / 100 * 20)', async function() {
    await this.sale.ReduceRate({ from: _ }); // 24%
    await this.sale.ReduceRate({ from: _ }); // 23%
    await this.sale.ReduceRate({ from: _ }); // 22%
    await this.sale.ReduceRate({ from: _ }); // 21%
    await this.sale.ReduceRate({ from: _ }); // 20%

    await this.sale.sendTransaction({ value: ether(1), from: wallet});
    const balance = await this.token.balanceOf(wallet);
    const sum = await web3.fromWei(balance, 'ether') - 1400000;
    assert.equal(sum, 280000);
    });

    it('OPTIONAL Repeat Test Correct reduce 1% percent with out loop', async function() {
    await this.sale.ReduceRate({ from: _ }); // 24%
    await this.sale.ReduceRate({ from: _ }); // 23%
    await this.sale.ReduceRate({ from: _ }); // 22%
    await this.sale.ReduceRate({ from: _ }); // 21%
    await this.sale.ReduceRate({ from: _ }); // 20%
    await this.sale.ReduceRate({ from: _ }); // 19%
    await this.sale.ReduceRate({ from: _ }); // 18%
    await this.sale.ReduceRate({ from: _ }); // 17%
    await this.sale.ReduceRate({ from: _ }); // 16%
    await this.sale.ReduceRate({ from: _ }); // 15%
    await this.sale.ReduceRate({ from: _ }); // 14%
    await this.sale.ReduceRate({ from: _ }); // 13%
    await this.sale.ReduceRate({ from: _ }); // 12%
    await this.sale.ReduceRate({ from: _ }); // 11%
    await this.sale.ReduceRate({ from: _ }); // 10%
    await this.sale.ReduceRate({ from: _ }); // 9%
    await this.sale.ReduceRate({ from: _ }); // 8%
    await this.sale.ReduceRate({ from: _ }); // 7%
    await this.sale.ReduceRate({ from: _ }); // 6%
    await this.sale.ReduceRate({ from: _ }); // 5%
    await this.sale.ReduceRate({ from: _ }); // 4%
    await this.sale.ReduceRate({ from: _ }); // 3%
    await this.sale.ReduceRate({ from: _ }); // 2%
    await this.sale.ReduceRate({ from: _ }); // 1%

    await this.sale.sendTransaction({ value: ether(1), from: wallet});
    const balance = await this.token.balanceOf(wallet);
    const sum = await web3.fromWei(balance, 'ether') - 1400000;
    assert.equal(sum, 14000);
    });

    it('OPTIONAL Repeat Test Correct reduce 0% percent with out loop', async function() {
    await this.sale.ReduceRate({ from: _ }); // 24%
    await this.sale.ReduceRate({ from: _ }); // 23%
    await this.sale.ReduceRate({ from: _ }); // 22%
    await this.sale.ReduceRate({ from: _ }); // 21%
    await this.sale.ReduceRate({ from: _ }); // 20%
    await this.sale.ReduceRate({ from: _ }); // 19%
    await this.sale.ReduceRate({ from: _ }); // 18%
    await this.sale.ReduceRate({ from: _ }); // 17%
    await this.sale.ReduceRate({ from: _ }); // 16%
    await this.sale.ReduceRate({ from: _ }); // 15%
    await this.sale.ReduceRate({ from: _ }); // 14%
    await this.sale.ReduceRate({ from: _ }); // 13%
    await this.sale.ReduceRate({ from: _ }); // 12%
    await this.sale.ReduceRate({ from: _ }); // 11%
    await this.sale.ReduceRate({ from: _ }); // 10%
    await this.sale.ReduceRate({ from: _ }); // 9%
    await this.sale.ReduceRate({ from: _ }); // 8%
    await this.sale.ReduceRate({ from: _ }); // 7%
    await this.sale.ReduceRate({ from: _ }); // 6%
    await this.sale.ReduceRate({ from: _ }); // 5%
    await this.sale.ReduceRate({ from: _ }); // 4%
    await this.sale.ReduceRate({ from: _ }); // 3%
    await this.sale.ReduceRate({ from: _ }); // 2%
    await this.sale.ReduceRate({ from: _ }); // 1%
    await this.sale.ReduceRate({ from: _ }); // 0%

    await this.sale.sendTransaction({ value: ether(1), from: wallet});
    const balance = await this.token.balanceOf(wallet);
    const sum = await web3.fromWei(balance, 'ether') - 1400000;
    assert.equal(sum, 0);
    });

    it('Owner can NOT call more then 25 even if percent more 24 beceuse default rate is 1750000', async function() {
    this.percent = 30;
    for(var i = 0; i < 25; i ++){
    await this.sale.ReduceRate({ from: _ }).should.be.fulfilled;
    }
    await this.sale.ReduceRate({ from: _ }).should.be.rejectedWith(EVMRevert);
    });
  });
});
