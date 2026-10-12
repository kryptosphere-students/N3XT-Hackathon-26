// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MockCash} from "../src/MockCash.sol";

contract MockCashTest is Test {
    uint256 constant ONE_MILLION = 1_000_000 * 1e6;

    MockCash cash;
    address c = makeAddr("C");

    function setUp() public {
        cash = new MockCash();
    }

    function test_sixDecimals() public view {
        assertEq(cash.decimals(), 6);
    }

    function test_anyoneCanMint() public {
        vm.prank(c);
        cash.mint(c, ONE_MILLION);
        assertEq(cash.balanceOf(c), ONE_MILLION);
    }
}
