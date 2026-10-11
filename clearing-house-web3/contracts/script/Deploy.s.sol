// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {ShareToken} from "../src/ShareToken.sol";
import {MockCash} from "../src/MockCash.sol";
import {SettlementEscrow} from "../src/SettlementEscrow.sol";

/// @notice Deploys the three contracts, sets the engine role, whitelists the
/// participants and prefunds them. Reads the addresses from the environment:
/// AGENT_PUBLIC_KEY (engine role), PARTICIPANT_A_ADDRESS, PARTICIPANT_B_ADDRESS,
/// PARTICIPANT_C_ADDRESS and FUND_ADDRESS (defaults to the deployer).
/// A participant whose address is empty is skipped.
/// Broadcasts with DEPLOYER_PRIVATE_KEY when set, otherwise with the sender
/// given on the command line (anvil unlocked account).
contract Deploy is Script {
    uint256 constant ONE_SHARE = 1e6;
    uint256 constant ONE_CASH = 1e6;

    // Demo prefunding. Managers hold a few shares and enough cash for a cycle,
    // the fund holds the shares it can issue and cash for redemptions.
    uint256 constant MANAGER_SHARES = 1_000 * ONE_SHARE;
    uint256 constant MANAGER_CASH = 1_000_000 * ONE_CASH;
    uint256 constant FUND_SHARES = 100_000 * ONE_SHARE;
    uint256 constant FUND_CASH = 10_000_000 * ONE_CASH;

    function run() external {
        uint256 deployerKey = vm.envOr("DEPLOYER_PRIVATE_KEY", uint256(0));
        address engine = vm.envAddress("AGENT_PUBLIC_KEY");

        if (deployerKey != 0) vm.startBroadcast(deployerKey);
        else vm.startBroadcast();

        address deployer = msg.sender;
        address fund = vm.envOr("FUND_ADDRESS", deployer);

        ShareToken shares = new ShareToken("Fund F", "FNDF");
        MockCash cash = new MockCash();
        SettlementEscrow escrow = new SettlementEscrow(shares, cash, engine);
        shares.setMinter(address(escrow));
        shares.setWhitelisted(address(escrow), true);

        shares.setWhitelisted(fund, true);
        escrow.creditPrefund(fund, address(shares), FUND_SHARES);
        escrow.creditPrefund(fund, address(cash), FUND_CASH);

        _prefundManager(shares, escrow, address(cash), "PARTICIPANT_A_ADDRESS");
        _prefundManager(shares, escrow, address(cash), "PARTICIPANT_B_ADDRESS");
        _prefundManager(shares, escrow, address(cash), "PARTICIPANT_C_ADDRESS");

        vm.stopBroadcast();

        console2.log("SHARE_TOKEN_ADDRESS=%s", address(shares));
        console2.log("CASH_TOKEN_ADDRESS=%s", address(cash));
        console2.log("ESCROW_ADDRESS=%s", address(escrow));
        console2.log("FUND_ADDRESS=%s", fund);
        console2.log("engine=%s", engine);
    }

    function _prefundManager(ShareToken shares, SettlementEscrow escrow, address cash, string memory envName) private {
        address manager = vm.envOr(envName, address(0));
        if (manager == address(0)) {
            console2.log("%s empty, skipped", envName);
            return;
        }
        shares.setWhitelisted(manager, true);
        escrow.creditPrefund(manager, address(shares), MANAGER_SHARES);
        escrow.creditPrefund(manager, cash, MANAGER_CASH);
    }
}
