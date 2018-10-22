pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract COTCrowdsale is Crowdsale, MintedCrowdsale, CappedCrowdsale, Ownable{

 using SafeMath for uint256;

 address private DAOaddress;
 uint256 private limit;
 uint256 private percent;
 uint256 private ICOrate;

 constructor(
    uint256 _rate,
    address _wallet,
    ERC20 _token,
    address _DAOaddress,
    uint256 _limit,
    uint256 _cap,
    uint256 _percent,
    uint256 _ICOrate
  )
  Crowdsale(_rate, _wallet, _token)
  CappedCrowdsale(_cap)
  public
  {
    DAOaddress = _DAOaddress;
    limit = _limit;
    percent = _percent;
    ICOrate = _ICOrate;
  }

  /*
    @dev check the correctness of address
  */

  function DAOAddress() public view returns (address) {
    return DAOaddress;
  }

  /*
    @dev Owner can reduce bonus percent 25% by default
    each call reduces of 1%
  */

  function ReduceRate()
    public
    onlyOwner()
  {
    require(rate > ICOrate);
    uint256 totalPercent = ICOrate.div(100).mul(percent);
    rate = ICOrate.add(totalPercent);
    if (percent != 0) {
    percent = percent.sub(1);
    }
  }

  /*
    @dev Owner can mint new Tokens up to a certain limit
    @param _beneficiary - receiver
    @param _tokenAmount - amount
  */
  function MintLimit(
    address _beneficiary,
    uint256 _tokenAmount
  )
    public
    onlyOwner()
  {
  uint256 total = token.totalSupply();
  require(total < limit);

  if(_tokenAmount.add(total) > limit ){
    _tokenAmount = 0;
  }
  require(_tokenAmount > 0);
  require(MintableToken(address(token)).mint(_beneficiary, _tokenAmount));
  }

  /*
    @dev Owner can transfer token owner permissions to DAO contract
  */

  function transferTokenOwnerToDAO()
    public
    onlyOwner()
  {
    MintableToken(address(token)).transferOwnership(DAOaddress);
  }

}
