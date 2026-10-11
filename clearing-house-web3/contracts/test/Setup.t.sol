// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Checks that forge-std and OpenZeppelin resolve through remappings.txt.
contract SetupToken is ERC20 {
    constructor() ERC20("Setup", "SET") {}
}

contract SetupTest is Test {
    function test_remappingsResolve() public {
        SetupToken token = new SetupToken();
        assertEq(token.decimals(), 18);
    }
}
