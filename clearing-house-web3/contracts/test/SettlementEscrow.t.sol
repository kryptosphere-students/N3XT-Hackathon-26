// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ShareToken} from "../src/ShareToken.sol";
import {MockCash} from "../src/MockCash.sol";
import {SettlementEscrow} from "../src/SettlementEscrow.sol";

contract SettlementEscrowTest is Test {
    uint256 constant ONE_SHARE = 1e6;
    uint256 constant ONE_CASH = 1e6;
    uint256 constant NAV_105 = 105 * ONE_CASH; // 105.000000 cash per share

    uint256 constant PREFUND_SHARES = 1_000 * ONE_SHARE;
    uint256 constant PREFUND_CASH = 1_000_000 * ONE_CASH;

    uint256 constant LOT_1 = 1;
    bytes32 constant NAV_HASH = keccak256("nav inputs and result");

    ShareToken shares;
    MockCash cash;
    SettlementEscrow escrow;

    address manager = makeAddr("manager");
    address engine = makeAddr("engine");
    address fund = makeAddr("fund");
    address a = makeAddr("A");
    address b = makeAddr("B");
    address c = makeAddr("C");
    address stranger = makeAddr("stranger");

    bytes[] noSignatures;

    function setUp() public {
        vm.startPrank(manager);
        shares = new ShareToken("Fund F", "FNDF");
        cash = new MockCash();
        escrow = new SettlementEscrow(shares, cash, engine);
        shares.setMinter(address(escrow));
        shares.setWhitelisted(address(escrow), true);
        shares.setWhitelisted(fund, true);
        shares.setWhitelisted(a, true);
        shares.setWhitelisted(b, true);
        shares.setWhitelisted(c, true);
        address[4] memory participants = [fund, a, b, c];
        for (uint256 i = 0; i < participants.length; i++) {
            escrow.creditPrefund(participants[i], address(shares), PREFUND_SHARES);
            escrow.creditPrefund(participants[i], address(cash), PREFUND_CASH);
        }
        vm.stopPrank();
    }

    // A subscribes 100, B redeems 40, the fund takes the opposite: net 60 shares out of the fund.
    function nettedLot() internal view returns (SettlementEscrow.Position[] memory positions) {
        positions = new SettlementEscrow.Position[](3);
        positions[0] = SettlementEscrow.Position(a, int256(100 * ONE_SHARE), -int256(10_500 * ONE_CASH));
        positions[1] = SettlementEscrow.Position(b, -int256(40 * ONE_SHARE), int256(4_200 * ONE_CASH));
        positions[2] = SettlementEscrow.Position(fund, -int256(60 * ONE_SHARE), int256(6_300 * ONE_CASH));
    }

    // Instant mode (S-042): one order, two lines.
    function instantLot() internal view returns (SettlementEscrow.Position[] memory positions) {
        positions = new SettlementEscrow.Position[](2);
        positions[0] = SettlementEscrow.Position(a, int256(10 * ONE_SHARE), -int256(1_050 * ONE_CASH));
        positions[1] = SettlementEscrow.Position(fund, -int256(10 * ONE_SHARE), int256(1_050 * ONE_CASH));
    }

    function test_prefundCreditsBalanceAndMintsToEscrow() public view {
        assertEq(escrow.balances(a, address(cash)), PREFUND_CASH);
        assertEq(escrow.balances(a, address(shares)), PREFUND_SHARES);
        assertEq(cash.balanceOf(address(escrow)), 4 * PREFUND_CASH);
        assertEq(shares.balanceOf(address(escrow)), 4 * PREFUND_SHARES);
    }

    function test_prefundOnlyOwner() public {
        vm.prank(a);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, a));
        escrow.creditPrefund(a, address(cash), ONE_CASH);
    }

    function test_prefundUnknownTokenReverts() public {
        vm.prank(manager);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.UnknownToken.selector, stranger));
        escrow.creditPrefund(a, stranger, ONE_CASH);
    }

    function test_settleNettedLotMovesSharesAndCash() public {
        vm.prank(engine);
        escrow.settle(LOT_1, NAV_105, nettedLot(), NAV_HASH, noSignatures);

        assertEq(escrow.balances(a, address(shares)), PREFUND_SHARES + 100 * ONE_SHARE);
        assertEq(escrow.balances(a, address(cash)), PREFUND_CASH - 10_500 * ONE_CASH);
        assertEq(escrow.balances(b, address(shares)), PREFUND_SHARES - 40 * ONE_SHARE);
        assertEq(escrow.balances(b, address(cash)), PREFUND_CASH + 4_200 * ONE_CASH);
        assertEq(escrow.balances(fund, address(shares)), PREFUND_SHARES - 60 * ONE_SHARE);
        assertEq(escrow.balances(fund, address(cash)), PREFUND_CASH + 6_300 * ONE_CASH);
        assertTrue(escrow.settled(LOT_1));
    }

    function test_settleInstantLotOfOneOrder() public {
        vm.prank(engine);
        escrow.settle(LOT_1, NAV_105, instantLot(), NAV_HASH, noSignatures);
        assertEq(escrow.balances(a, address(shares)), PREFUND_SHARES + 10 * ONE_SHARE);
        assertEq(escrow.balances(fund, address(cash)), PREFUND_CASH + 1_050 * ONE_CASH);
    }

    function test_settleEmitsLotSettledWithHashAndSignatures() public {
        SettlementEscrow.Position[] memory positions = nettedLot();
        bytes[] memory signatures = new bytes[](2);
        signatures[0] = hex"aa";
        signatures[1] = hex"bb";
        bytes32 expectedHash = escrow.hashLot(LOT_1, NAV_105, positions);

        vm.expectEmit(true, false, false, true);
        emit SettlementEscrow.LotSettled(LOT_1, expectedHash, NAV_HASH, signatures);
        vm.prank(engine);
        escrow.settle(LOT_1, NAV_105, positions, NAV_HASH, signatures);
    }

    function test_settleOnlyEngine() public {
        vm.prank(manager);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.NotEngine.selector, manager));
        escrow.settle(LOT_1, NAV_105, nettedLot(), NAV_HASH, noSignatures);
    }

    function test_settleReplayReverts() public {
        vm.startPrank(engine);
        escrow.settle(LOT_1, NAV_105, nettedLot(), NAV_HASH, noSignatures);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.LotAlreadySettled.selector, LOT_1));
        escrow.settle(LOT_1, NAV_105, nettedLot(), NAV_HASH, noSignatures);
        vm.stopPrank();
    }

    function test_settleUnbalancedSharesReverts() public {
        SettlementEscrow.Position[] memory positions = nettedLot();
        positions[2].shares += 1;
        vm.prank(engine);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.LotNotBalanced.selector, int256(1), int256(0)));
        escrow.settle(LOT_1, NAV_105, positions, NAV_HASH, noSignatures);
    }

    function test_settleUnbalancedCashReverts() public {
        SettlementEscrow.Position[] memory positions = nettedLot();
        positions[0].cash -= 1;
        vm.prank(engine);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.LotNotBalanced.selector, int256(0), int256(-1)));
        escrow.settle(LOT_1, NAV_105, positions, NAV_HASH, noSignatures);
    }

    function test_settleInsufficientCoverageRevertsWithoutAnyChange() public {
        // A pays more cash than prefunded. B's line is applied before A's in this lot,
        // so a partial settlement would already have moved B's balances.
        SettlementEscrow.Position[] memory positions = new SettlementEscrow.Position[](3);
        positions[0] = SettlementEscrow.Position(b, -int256(40 * ONE_SHARE), int256(4_200 * ONE_CASH));
        positions[1] = SettlementEscrow.Position(a, int256(100 * ONE_SHARE), -int256(PREFUND_CASH + 1));
        positions[2] =
            SettlementEscrow.Position(fund, -int256(60 * ONE_SHARE), int256(PREFUND_CASH + 1 - 4_200 * ONE_CASH));

        vm.prank(engine);
        vm.expectRevert(
            abi.encodeWithSelector(
                SettlementEscrow.InsufficientBalance.selector, a, address(cash), PREFUND_CASH, PREFUND_CASH + 1
            )
        );
        escrow.settle(LOT_1, NAV_105, positions, NAV_HASH, noSignatures);

        assertEq(escrow.balances(b, address(shares)), PREFUND_SHARES);
        assertEq(escrow.balances(b, address(cash)), PREFUND_CASH);
        assertFalse(escrow.settled(LOT_1));
    }

    function test_settleNonWhitelistedParticipantReverts() public {
        SettlementEscrow.Position[] memory positions = new SettlementEscrow.Position[](2);
        positions[0] = SettlementEscrow.Position(stranger, int256(ONE_SHARE), 0);
        positions[1] = SettlementEscrow.Position(fund, -int256(ONE_SHARE), 0);
        vm.prank(engine);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.NotWhitelisted.selector, stranger));
        escrow.settle(LOT_1, NAV_105, positions, NAV_HASH, noSignatures);
    }

    function test_withdrawTransfersTokens() public {
        vm.prank(a);
        escrow.withdraw(address(cash), 10 * ONE_CASH);
        assertEq(cash.balanceOf(a), 10 * ONE_CASH);
        assertEq(escrow.balances(a, address(cash)), PREFUND_CASH - 10 * ONE_CASH);
    }

    function test_withdrawMoreThanBalanceReverts() public {
        vm.prank(a);
        vm.expectRevert(
            abi.encodeWithSelector(
                SettlementEscrow.InsufficientBalance.selector, a, address(cash), PREFUND_CASH, PREFUND_CASH + 1
            )
        );
        escrow.withdraw(address(cash), PREFUND_CASH + 1);
    }

    function test_setEngineOnlyOwner() public {
        vm.prank(engine);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, engine));
        escrow.setEngine(stranger);
    }

    // Property: any balanced lot inside the prefunded limits settles and keeps totals unchanged.
    function testFuzz_balancedLotKeepsTotals(int128 sharesA, int128 sharesB, int128 cashA, int128 cashB) public {
        int256 limitShares = int256(PREFUND_SHARES);
        int256 limitCash = int256(PREFUND_CASH);
        sharesA = int128(bound(int256(sharesA), -limitShares, limitShares));
        sharesB = int128(bound(int256(sharesB), -limitShares, limitShares));
        cashA = int128(bound(int256(cashA), -limitCash, limitCash));
        cashB = int128(bound(int256(cashB), -limitCash, limitCash));

        SettlementEscrow.Position[] memory positions = new SettlementEscrow.Position[](3);
        positions[0] = SettlementEscrow.Position(a, sharesA, cashA);
        positions[1] = SettlementEscrow.Position(b, sharesB, cashB);
        positions[2] = SettlementEscrow.Position(fund, -(int256(sharesA) + sharesB), -(int256(cashA) + cashB));
        // The fund line may exceed its prefund when A and B move the same way: skip those draws.
        vm.assume(-(int256(sharesA) + sharesB) >= -limitShares);
        vm.assume(-(int256(cashA) + cashB) >= -limitCash);

        vm.prank(engine);
        escrow.settle(LOT_1, NAV_105, positions, NAV_HASH, noSignatures);

        uint256 totalShares = escrow.balances(a, address(shares)) + escrow.balances(b, address(shares))
            + escrow.balances(c, address(shares)) + escrow.balances(fund, address(shares));
        uint256 totalCash = escrow.balances(a, address(cash)) + escrow.balances(b, address(cash))
            + escrow.balances(c, address(cash)) + escrow.balances(fund, address(cash));
        assertEq(totalShares, 4 * PREFUND_SHARES);
        assertEq(totalCash, 4 * PREFUND_CASH);
    }

    // Property: a lot whose shares do not sum to zero never settles.
    function testFuzz_unbalancedLotReverts(int128 sharesA, int128 delta) public {
        vm.assume(delta != 0);
        SettlementEscrow.Position[] memory positions = new SettlementEscrow.Position[](2);
        positions[0] = SettlementEscrow.Position(a, sharesA, 0);
        positions[1] = SettlementEscrow.Position(fund, -int256(sharesA) + delta, 0);
        vm.prank(engine);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.LotNotBalanced.selector, int256(delta), int256(0)));
        escrow.settle(LOT_1, NAV_105, positions, NAV_HASH, noSignatures);
    }

    // Reference values for the TypeScript side (S-017). Deployed from a fresh
    // address so the token addresses, and the hash, are the same on every run.
    function test_referenceLotHashForParity() public {
        address deployer = makeAddr("reference-deployer");
        address refEngine = makeAddr("reference-engine");
        vm.startPrank(deployer);
        ShareToken refShares = new ShareToken("Fund F", "FNDF");
        MockCash refCash = new MockCash();
        SettlementEscrow refEscrow = new SettlementEscrow(refShares, refCash, refEngine);
        vm.stopPrank();

        SettlementEscrow.Position[] memory positions = new SettlementEscrow.Position[](3);
        positions[0] = SettlementEscrow.Position(
            0x1111111111111111111111111111111111111111, int256(100 * ONE_SHARE), -int256(10_500 * ONE_CASH)
        );
        positions[1] = SettlementEscrow.Position(
            0x2222222222222222222222222222222222222222, -int256(40 * ONE_SHARE), int256(4_200 * ONE_CASH)
        );
        positions[2] = SettlementEscrow.Position(
            0x3333333333333333333333333333333333333333, -int256(60 * ONE_SHARE), int256(6_300 * ONE_CASH)
        );
        bytes32 lotHash = refEscrow.hashLot(7, NAV_105, positions);

        console2.log("reference shareToken", address(refShares));
        console2.log("reference cashToken", address(refCash));
        console2.logBytes32(lotHash);
        assertEq(lotHash, REFERENCE_LOT_HASH);
    }

    // keccak256(abi.encode(7, shareToken, cashToken, 105e6, positions)) with the three lines above.
    // Checked against viem encodeAbiParameters + keccak256 on 12 Oct 2026 (see contracts/README.md).
    bytes32 constant REFERENCE_LOT_HASH = 0xd9e1d479dbe07a9fa30625248c923e1831eb32501690ede4a5355900cccd9ea2;
}
