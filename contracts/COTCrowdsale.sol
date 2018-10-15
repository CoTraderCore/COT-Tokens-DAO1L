pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract COTCrowdsale is Crowdsale, MintedCrowdsale, Ownable{
  address DAOaddress;
  ERC20 private token;
  uint256 private limit;

  constructor(
    uint256 _rate,
    address _wallet,
    ERC20 _token,
    address _DAOaddress,
    uint256 _limit
  )
  Crowdsale(_rate, _wallet, _token)
  public
  {
    DAOaddress = _DAOaddress;
    token = _token;
    limit = _limit;
  }

  /*
     Owner can mint new Tokens up to a certain limit
  */
  function MintLimit(
    address _beneficiary,
    uint256 _tokenAmount
  )
    public
    onlyOwner()
  {
  require(token.totalSupply() < limit);

  if(_tokenAmount.add(token.totalSupply()) > limit ){
     _tokenAmount = 0;
  }
  require(_tokenAmount > 0);
  require(MintableToken(address(token)).mint(_beneficiary, _tokenAmount));
  }

  /*
     Owner can transfer token owner permissions
     to DAO contract
  */

  function transferTokenOwnerToDAO()
    public
    onlyOwner()
  {
    MintableToken(address(token)).transferOwnership(DAOaddress);
  }

}
