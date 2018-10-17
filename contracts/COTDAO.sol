pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

contract COTDAO is Ownable{
  using SafeMath for uint256;

  ERC20 private token;
  uint256 private limit;
  uint256 private openingTime;

  constructor(
    ERC20 _token,
    uint256 _limit,
    uint256 _openingTime
    )
    public {
    require(_token != address(0));
    token = _token;
    limit = _limit;
    openingTime = _openingTime;
  }

  modifier onlyWhenOpen {
    require(block.timestamp >= openingTime);
    _;
  }

 /*
  @dev Owner can mint new Tokens up to a certain limit
  @param _beneficiary - tokens receiver
  @param _tokenAmount - amount of mint tokens
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
  @dev Owner can mint 0.01% from totalSuply per week
  @param _beneficiary - tokens receiver
  */

  function MintPercent(
    address _beneficiary
  )
    public
    onlyOwner()
    onlyWhenOpen()
  {
  require(MintableToken(address(token)).mint(_beneficiary, token.totalSupply().div(100).div(10)));
  openingTime = now.add(7 days);
  }

  /*
   @dev address with 51% balance can change Owner DAO
   @param _newOwner - new owner of DAO
  */

  function ChangeOwnerDAO(
    address _newOwner
  )
    public
  {
  require(token.balanceOf(msg.sender) > token.totalSupply().div(2));
  super._transferOwnership(_newOwner);
  }

  /*
  @dev owner DAO can pause Token
    only through contract DAO
  */

  function pauseDAO()
    public
    onlyOwner()
  {
    PausableToken(address(token)).pause();
  }

  /*
  @dev owner DAO can unpause Token
    only through contract DAO
  */

  function unpauseDAO()
    public
    onlyOwner()
  {
    PausableToken(address(token)).unpause();
  }

  /*
  @dev owner DAO can finish mint
  */

  function finishMint()
    public
    onlyOwner()
  {
    MintableToken(address(token)).finishMinting();
  }
}
