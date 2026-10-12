// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Test cash, 6 decimals
/// @notice Anyone can mint. Test money only, no link to a real currency.
contract MockCash is ERC20 {
    uint8 public constant DECIMALS = 6;

    constructor() ERC20("Mock Cash", "mCASH") {}

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
