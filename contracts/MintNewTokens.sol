pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract MintNewTokens is Ownable{
  using SafeERC20 for ERC20;
  using SafeMath for uint256;

  ERC20 private token;
  uint256 private totalSupplyHalf;
  uint256 private limit;
  uint256 private openingTime;

  constructor(
    ERC20 _token,
    uint256 _totalSupplyHalf,
    uint256 _limit,
    uint256 _openingTime
    )
    public {
    require(_token != address(0));
    token = _token;
    totalSupplyHalf = _totalSupplyHalf;
    limit = _limit;
    openingTime = _openingTime;
  }

  modifier onlyWhenOpen {
    require(block.timestamp >= openingTime);
    _;
  }

 /*
    Owner can mint new Tokens up to a certain limit
    Limit set in migrations
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
  // Potentially dangerous assumption about the type of the token.
  require(MintableToken(address(token)).mint(_beneficiary, _tokenAmount));
  }

  /*
    Owner can mint 5% from totalSuply once a year (5 minute for test)
  */
  function MintPercent(
    address _beneficiary
  )
    public
    onlyOwner()
    onlyWhenOpen()
  {
  // Update time
  openingTime = now.add(30 seconds);

  // Potentially dangerous assumption about the type of the token.
  require(MintableToken(address(token)).mint(_beneficiary, token.totalSupply().div(100).mul(5)));
  }


  function ChangeOwnerDAO(
    address _newOwner
  )
    public
  {
  require(token.balanceOf(msg.sender) > totalSupplyHalf);
  super._transferOwnership(_newOwner);
  }

  /*
  Pool address with 51% balance can call mint function
  require(pool_address > totalSupply / 2)
  */

  /* function MintForPoolAddress(
    address _beneficiary,
    uint256 _tokenAmount
  )
    public
  {
  require(token.balanceOf(msg.sender) > totalSupplyHalf);
    // Potentially dangerous assumption about the type of the token.
  require(MintableToken(address(token)).mint(_beneficiary, _tokenAmount));
  } */
}
