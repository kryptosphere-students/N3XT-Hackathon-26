// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ShareToken} from "./ShareToken.sol";

interface IMintable {
    function mint(address to, uint256 amount) external;
}

/// @title DvP escrow with prefunded internal balances
/// @notice Holds shares and cash for every participant, the fund included.
/// A lot is a list of net positions that sums to zero (D11). The engine key
/// settles a lot in one call: either every line moves or nothing does.
/// Participants never sign a transaction here: they sign readable text on
/// their Ledger, and the engine checks those signatures before calling
/// settle. The signatures are published in LotSettled for later audit (D6).
contract SettlementEscrow is Ownable {
    using SafeERC20 for IERC20;

    struct Position {
        address participant;
        int256 shares; // + receives, - delivers
        int256 cash; // + receives, - pays
    }

    ShareToken public immutable shareToken;
    IERC20 public immutable cashToken;
    address public engine;

    // participant => token => internal balance
    mapping(address => mapping(address => uint256)) public balances;
    mapping(uint256 => bool) public settled;

    event EngineUpdated(address indexed engine);
    event Prefunded(address indexed participant, address indexed token, uint256 amount);
    event Withdrawn(address indexed participant, address indexed token, uint256 amount);
    event LotSettled(uint256 indexed lotId, bytes32 lotHash, bytes32 navHash, bytes[] signatures);

    error NotEngine(address caller);
    error ZeroAddress();
    error UnknownToken(address token);
    error LotAlreadySettled(uint256 lotId);
    error LotNotBalanced(int256 sharesSum, int256 cashSum);
    error InsufficientBalance(address participant, address token, uint256 balance, uint256 needed);
    error NotWhitelisted(address participant);

    modifier onlyEngine() {
        if (msg.sender != engine) revert NotEngine(msg.sender);
        _;
    }

    constructor(ShareToken shareToken_, IERC20 cashToken_, address engine_) Ownable(msg.sender) {
        if (engine_ == address(0)) revert ZeroAddress();
        shareToken = shareToken_;
        cashToken = cashToken_;
        engine = engine_;
    }

    function setEngine(address newEngine) external onlyOwner {
        if (newEngine == address(0)) revert ZeroAddress();
        engine = newEngine;
        emit EngineUpdated(newEngine);
    }

    /// @notice Mint test tokens into the escrow and credit a participant.
    /// Used at deployment so nobody has to sign an approve on the Flex.
    function creditPrefund(address participant, address token, uint256 amount) external onlyOwner {
        if (token != address(shareToken) && token != address(cashToken)) revert UnknownToken(token);
        balances[participant][token] += amount;
        emit Prefunded(participant, token, amount);
        IMintable(token).mint(address(this), amount);
    }

    /// @notice Take tokens out of the escrow.
    function withdraw(address token, uint256 amount) external {
        if (token != address(shareToken) && token != address(cashToken)) revert UnknownToken(token);
        uint256 balance = balances[msg.sender][token];
        if (balance < amount) revert InsufficientBalance(msg.sender, token, balance, amount);
        balances[msg.sender][token] = balance - amount;
        emit Withdrawn(msg.sender, token, amount);
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /// @notice Settle one lot. Reverts if the lot id was used, if shares or
    /// cash do not sum to zero, or if any balance would go negative.
    /// @param lotId Unique id of the lot, also the replay guard.
    /// @param navPerUnit Cash for one share, 6 decimals. Part of the lot hash.
    /// @param positions Net lines of the lot, the fund included.
    /// @param navHash Hash of the NAV inputs and result (S-041).
    /// @param signatures EIP-191 approvals of the participants, checked by the engine.
    function settle(
        uint256 lotId,
        uint256 navPerUnit,
        Position[] calldata positions,
        bytes32 navHash,
        bytes[] calldata signatures
    ) external onlyEngine {
        if (settled[lotId]) revert LotAlreadySettled(lotId);

        int256 sharesSum = 0;
        int256 cashSum = 0;
        for (uint256 i = 0; i < positions.length; i++) {
            sharesSum += positions[i].shares;
            cashSum += positions[i].cash;
        }
        if (sharesSum != 0 || cashSum != 0) revert LotNotBalanced(sharesSum, cashSum);

        settled[lotId] = true;
        for (uint256 i = 0; i < positions.length; i++) {
            Position calldata p = positions[i];
            // One view call per line is fine: a lot has a handful of lines, and the lot must fail as a whole.
            // forge-lint: disable-next-line(calls-loop,require-revert-in-loop)
            if (p.shares != 0 && !shareToken.isWhitelisted(p.participant)) revert NotWhitelisted(p.participant);
            _apply(p.participant, address(shareToken), p.shares);
            _apply(p.participant, address(cashToken), p.cash);
        }

        emit LotSettled(lotId, hashLot(lotId, navPerUnit, positions), navHash, signatures);
    }

    /// @notice Hash of a lot, recomputed off-chain by the engine (S-017).
    function hashLot(uint256 lotId, uint256 navPerUnit, Position[] calldata positions) public view returns (bytes32) {
        return keccak256(abi.encode(lotId, address(shareToken), address(cashToken), navPerUnit, positions));
    }

    function _apply(address participant, address token, int256 delta) private {
        if (delta >= 0) {
            // casting to uint256 is safe because delta is not negative here
            // forge-lint: disable-next-line(unsafe-typecast)
            balances[participant][token] += uint256(delta);
            return;
        }
        // casting to uint256 is safe because delta is negative here, and int256 min is excluded by the sum check
        // forge-lint: disable-next-line(unsafe-typecast)
        uint256 needed = uint256(-delta);
        uint256 balance = balances[participant][token];
        // The revert is the point: a lot settles as a whole or not at all.
        // forge-lint: disable-next-line(require-revert-in-loop)
        if (balance < needed) revert InsufficientBalance(participant, token, balance, needed);
        balances[participant][token] = balance - needed;
    }
}
