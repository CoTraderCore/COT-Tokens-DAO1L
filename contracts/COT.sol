pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

contract COT is MintableToken, PausableToken, DetailedERC20 {

    constructor(string _name, string _symbol, uint8 _decimals, uint256 _totalSuply)
        DetailedERC20(_name, _symbol, _decimals)
        public
    {
        // Initialize totalSupply
        totalSupply_ = _totalSuply;
        // Initialize Holder
        balances[msg.sender] = _totalSuply;
    }
}
