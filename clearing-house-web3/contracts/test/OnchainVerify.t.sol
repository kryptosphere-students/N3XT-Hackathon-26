// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ShareToken} from "../src/ShareToken.sol";
import {MockCash} from "../src/MockCash.sol";
import {SettlementEscrow} from "../src/SettlementEscrow.sol";

// The escrow rebuilds the Ledger approval text and checks the EIP-191 signature itself.
contract OnchainVerifyTest is Test {
    uint256 constant ONE = 1e6;
    uint256 constant NAV_105 = 105 * ONE;
    uint256 constant PREFUND_SHARES = 1_000 * ONE;
    uint256 constant PREFUND_CASH = 1_000_000 * ONE;
    bytes32 constant NAV_HASH = keccak256("nav");
    string constant FUND_NAME = "Fund F";

    ShareToken shares;
    MockCash cash;
    SettlementEscrow escrow;

    address manager = makeAddr("manager");
    address engine = makeAddr("engine");
    address fund = makeAddr("fund");
    uint256 keyA;
    uint256 keyB;
    address a;
    address b;

    function setUp() public {
        (a, keyA) = makeAddrAndKey("A");
        (b, keyB) = makeAddrAndKey("B");
        vm.startPrank(manager);
        shares = new ShareToken("Fund F", "FNDF");
        cash = new MockCash();
        escrow = new SettlementEscrow(shares, cash, engine);
        shares.setMinter(address(escrow));
        shares.setWhitelisted(address(escrow), true);
        address[3] memory participants = [fund, a, b];
        for (uint256 i = 0; i < participants.length; i++) {
            shares.setWhitelisted(participants[i], true);
            escrow.creditPrefund(participants[i], address(shares), PREFUND_SHARES);
            escrow.creditPrefund(participants[i], address(cash), PREFUND_CASH);
        }
        vm.stopPrank();
    }

    function nettedLot() internal view returns (SettlementEscrow.Position[] memory positions) {
        positions = new SettlementEscrow.Position[](3);
        positions[0] = SettlementEscrow.Position(a, int256(100 * ONE), -int256(10_500 * ONE));
        positions[1] = SettlementEscrow.Position(b, -int256(40 * ONE), int256(4_200 * ONE));
        positions[2] = SettlementEscrow.Position(fund, -int256(60 * ONE), int256(6_300 * ONE));
    }

    function sign(uint256 key, uint256 lotId, SettlementEscrow.Position memory p, bytes32 lotHash)
        internal
        view
        returns (bytes memory)
    {
        bytes32 digest =
            MessageHashUtils.toEthSignedMessageHash(bytes(escrow.approvalText(lotId, FUND_NAME, p, lotHash)));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }

    function signedLot(uint256 lotId)
        internal
        view
        returns (SettlementEscrow.Position[] memory positions, bytes[] memory signatures)
    {
        positions = nettedLot();
        bytes32 lotHash = escrow.hashLot(lotId, NAV_105, positions);
        signatures = new bytes[](3);
        signatures[0] = sign(keyA, lotId, positions[0], lotHash);
        signatures[1] = sign(keyB, lotId, positions[1], lotHash);
        signatures[2] = "";
    }

    // Same lines as lotApprovalToText in packages/protocol, checked against its test.
    function test_approvalTextMatchesTheProtocolText() public {
        address deployer = makeAddr("reference-deployer");
        vm.startPrank(deployer);
        ShareToken refShares = new ShareToken("Fund F", "FNDF");
        MockCash refCash = new MockCash();
        SettlementEscrow refEscrow = new SettlementEscrow(refShares, refCash, engine);
        vm.stopPrank();

        SettlementEscrow.Position[] memory positions = new SettlementEscrow.Position[](3);
        positions[0] = SettlementEscrow.Position(
            0x1111111111111111111111111111111111111111, int256(100 * ONE), -int256(10_500 * ONE)
        );
        positions[1] = SettlementEscrow.Position(
            0x2222222222222222222222222222222222222222, -int256(40 * ONE), int256(4_200 * ONE)
        );
        positions[2] = SettlementEscrow.Position(
            0x3333333333333333333333333333333333333333, -int256(60 * ONE), int256(6_300 * ONE)
        );
        bytes32 lotHash = refEscrow.hashLot(7, NAV_105, positions);
        assertEq(lotHash, 0xd9e1d479dbe07a9fa30625248c923e1831eb32501690ede4a5355900cccd9ea2);

        assertEq(
            refEscrow.approvalText(7, FUND_NAME, positions[0], lotHash),
            "Lot 7, Fund F\nYou receive 100 units\nYou pay 10500 cash\nLot hash 0xd9e1...9ea2\nFull hash 0xd9e1d479dbe07a9fa30625248c923e1831eb32501690ede4a5355900cccd9ea2"
        );
        assertEq(
            refEscrow.approvalText(7, FUND_NAME, positions[1], lotHash),
            "Lot 7, Fund F\nYou deliver 40 units\nYou receive 4200 cash\nLot hash 0xd9e1...9ea2\nFull hash 0xd9e1d479dbe07a9fa30625248c923e1831eb32501690ede4a5355900cccd9ea2"
        );
    }

    function test_formatsFractionalUnitsLikeViem() public view {
        SettlementEscrow.Position memory p = SettlementEscrow.Position(a, int256(12_500_000), -int256(1_312_500_000));
        string memory text = escrow.approvalText(1, FUND_NAME, p, bytes32(0));
        assertTrue(contains(text, "You receive 12.5 units"));
        assertTrue(contains(text, "You pay 1312.5 cash"));
    }

    function test_settlesWithValidApprovals() public {
        (SettlementEscrow.Position[] memory positions, bytes[] memory signatures) = signedLot(1);
        vm.prank(engine);
        escrow.settle(1, NAV_105, positions, NAV_HASH, signatures, FUND_NAME);
        assertEq(escrow.balances(a, address(shares)), PREFUND_SHARES + 100 * ONE);
        assertEq(escrow.balances(b, address(cash)), PREFUND_CASH + 4_200 * ONE);
        assertTrue(escrow.settled(1));
    }

    function test_rejectsASignatureFromAnotherKey() public {
        (SettlementEscrow.Position[] memory positions, bytes[] memory signatures) = signedLot(1);
        bytes32 lotHash = escrow.hashLot(1, NAV_105, positions);
        signatures[0] = sign(keyB, 1, positions[0], lotHash);
        vm.prank(engine);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.BadApproval.selector, a));
        escrow.settle(1, NAV_105, positions, NAV_HASH, signatures, FUND_NAME);
    }

    function test_rejectsALotChangedAfterApproval() public {
        (SettlementEscrow.Position[] memory positions, bytes[] memory signatures) = signedLot(1);
        positions[0].cash -= int256(ONE);
        positions[2].cash += int256(ONE);
        vm.prank(engine);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.BadApproval.selector, a));
        escrow.settle(1, NAV_105, positions, NAV_HASH, signatures, FUND_NAME);
    }

    function test_rejectsAMissingApproval() public {
        (SettlementEscrow.Position[] memory positions, bytes[] memory signatures) = signedLot(1);
        signatures[1] = "";
        vm.prank(engine);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.BadApproval.selector, b));
        escrow.settle(1, NAV_105, positions, NAV_HASH, signatures, FUND_NAME);
    }

    function test_rejectsAWrongSignatureCount() public {
        (SettlementEscrow.Position[] memory positions,) = signedLot(1);
        bytes[] memory signatures = new bytes[](2);
        vm.prank(engine);
        vm.expectRevert(abi.encodeWithSelector(SettlementEscrow.SignatureCountMismatch.selector, 3, 2));
        escrow.settle(1, NAV_105, positions, NAV_HASH, signatures, FUND_NAME);
    }

    function contains(string memory haystack, string memory needle) internal pure returns (bool) {
        bytes memory h = bytes(haystack);
        bytes memory n = bytes(needle);
        if (n.length > h.length) return false;
        for (uint256 i = 0; i + n.length <= h.length; i++) {
            bool same = true;
            for (uint256 j = 0; j < n.length; j++) {
                if (h[i + j] != n[j]) {
                    same = false;
                    break;
                }
            }
            if (same) return true;
        }
        return false;
    }
}
