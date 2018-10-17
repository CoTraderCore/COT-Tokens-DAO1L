pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";
import "openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";


contract COTCrowdsale is Crowdsale, MintedCrowdsale, CappedCrowdsale, Ownable{
  address DAOaddress;
  ERC20 private token;
  uint256 private limit;

  // Crowdsale Stages
  enum CrowdsaleStage {PrePreICO, PreICO, ICO } // 0 - PrePreICO 1 - PreICO,  2 - ICO
  // Default to presale stage
  CrowdsaleStage public stage = CrowdsaleStage.PrePreICO;


  constructor(
    uint256 _rate,
    address _wallet,
    ERC20 _token,
    address _DAOaddress,
    uint256 _limit,
    uint _cap
  )
  Crowdsale(_rate, _wallet, _token)
  CappedCrowdsale(_cap)
  public
  {
    DAOaddress = _DAOaddress;
    token = _token;
    limit = _limit;
  }

  /*
  @dev Owner can update the crowdsale stage
  @param _stage Crowdsale stage
  */

 function setCrowdsaleStage(uint _stage) public onlyOwner {
   if(uint(CrowdsaleStage.PrePreICO) == _stage) {
     stage = CrowdsaleStage.PrePreICO;
   } else if(uint(CrowdsaleStage.PreICO) == _stage) {
     stage = CrowdsaleStage.PreICO;
   } else if (uint(CrowdsaleStage.ICO) == _stage) {
     stage = CrowdsaleStage.ICO;
   }

   if(stage == CrowdsaleStage.PrePreICO) {
     rate = 1750000; // + 25%
   } else if(stage == CrowdsaleStage.PreICO) {
     rate = 1540000; // + 10%
   } else if (stage == CrowdsaleStage.ICO) {
     rate = 1400000;
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
  require(token.totalSupply() < limit);

  if(_tokenAmount.add(token.totalSupply()) > limit ){
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
