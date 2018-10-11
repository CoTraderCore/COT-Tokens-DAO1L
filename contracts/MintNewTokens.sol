pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract MintNewTokens is Ownable{
  using SafeMath for uint256;

  MintableToken private token;
  uint256 private limit;
  uint256 private openingTime;

  constructor(
    MintableToken _token,
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
  require(token.mint(_beneficiary, _tokenAmount));
  }

  /*
    Owner can mint 5% from totalSuply once a year
  */
  function MintPercent(
    address _beneficiary
  )
    public
    onlyOwner()
    onlyWhenOpen()
  {
  require(token.mint(_beneficiary, token.totalSupply().div(100).div(10)));
  // Update time
  openingTime = now.add(7 days);
  }


  function ChangeOwnerDAO(
    address _newOwner
  )
    public
  {
  require(token.balanceOf(msg.sender) > token.totalSupply().div(2));
  super._transferOwnership(_newOwner);
  }
}
