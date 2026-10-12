// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ShareToken} from "../src/ShareToken.sol";

contract ShareTokenTest is Test {
    uint256 constant ONE_SHARE = 1e6;
    uint256 constant HUNDRED_SHARES = 100 * ONE_SHARE;

    ShareToken token;
    address manager = makeAddr("manager");
    address a = makeAddr("A");
    address b = makeAddr("B");
    address stranger = makeAddr("stranger");

    function setUp() public {
        vm.prank(manager);
        token = new ShareToken("Fund F", "FNDF");
        vm.startPrank(manager);
        token.setWhitelisted(a, true);
        token.setWhitelisted(b, true);
        vm.stopPrank();
    }

    function test_sixDecimals() public view {
        assertEq(token.decimals(), 6);
    }

    function test_mintToWhitelistedEmitsTransfer() public {
        vm.expectEmit(true, true, false, true);
        emit IERC20.Transfer(address(0), a, HUNDRED_SHARES);
        vm.prank(manager);
        token.mint(a, HUNDRED_SHARES);
        assertEq(token.balanceOf(a), HUNDRED_SHARES);
    }

    function test_mintToStrangerReverts() public {
        vm.prank(manager);
        vm.expectRevert(abi.encodeWithSelector(ShareToken.NotWhitelisted.selector, stranger));
        token.mint(stranger, ONE_SHARE);
    }

    function test_transferToStrangerReverts() public {
        vm.prank(manager);
        token.mint(a, HUNDRED_SHARES);
        vm.prank(a);
        vm.expectRevert(abi.encodeWithSelector(ShareToken.NotWhitelisted.selector, stranger));
        token.transfer(stranger, ONE_SHARE);
    }

    function test_transferBetweenWhitelisted() public {
        vm.prank(manager);
        token.mint(a, HUNDRED_SHARES);
        vm.prank(a);
        token.transfer(b, ONE_SHARE);
        assertEq(token.balanceOf(b), ONE_SHARE);
    }

    function test_removedParticipantCannotReceive() public {
        vm.prank(manager);
        token.setWhitelisted(b, false);
        vm.prank(manager);
        vm.expectRevert(abi.encodeWithSelector(ShareToken.NotWhitelisted.selector, b));
        token.mint(b, ONE_SHARE);
    }

    function test_onlyOwnerManagesWhitelist() public {
        vm.prank(a);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, a));
        token.setWhitelisted(stranger, true);
    }

    function test_minterCanMint() public {
        address escrow = makeAddr("escrow");
        vm.startPrank(manager);
        token.setMinter(escrow);
        token.setWhitelisted(escrow, true);
        vm.stopPrank();
        vm.prank(escrow);
        token.mint(escrow, ONE_SHARE);
        assertEq(token.balanceOf(escrow), ONE_SHARE);
    }

    function test_strangerCannotMint() public {
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(ShareToken.NotMinter.selector, stranger));
        token.mint(a, ONE_SHARE);
    }
}
