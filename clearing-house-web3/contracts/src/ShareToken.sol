// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Fund shares with a participant whitelist
/// @notice Shares of one fund. Only whitelisted addresses can receive them.
/// The owner (fund manager) keeps the whitelist and mints. A minter (the
/// escrow) may also mint, so prefunding needs no signature from a participant.
contract ShareToken is ERC20, Ownable {
    uint8 public constant DECIMALS = 6;

    mapping(address => bool) public isWhitelisted;
    address public minter;

    event WhitelistUpdated(address indexed participant, bool allowed);
    event MinterUpdated(address indexed minter);

    error NotWhitelisted(address participant);
    error NotMinter(address caller);
    error ZeroAddress();

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    function setWhitelisted(address participant, bool allowed) external onlyOwner {
        isWhitelisted[participant] = allowed;
        emit WhitelistUpdated(participant, allowed);
    }

    function setMinter(address newMinter) external onlyOwner {
        if (newMinter == address(0)) revert ZeroAddress();
        minter = newMinter;
        emit MinterUpdated(newMinter);
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != owner() && msg.sender != minter) revert NotMinter(msg.sender);
        _mint(to, amount);
    }

    /// @dev Every mint or transfer goes through here. Burns (to == 0) stay allowed.
    function _update(address from, address to, uint256 value) internal override {
        if (to != address(0) && !isWhitelisted[to]) revert NotWhitelisted(to);
        super._update(from, to, value);
    }
}
