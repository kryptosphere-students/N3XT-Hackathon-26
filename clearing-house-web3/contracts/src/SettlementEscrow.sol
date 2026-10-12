// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ShareToken} from "./ShareToken.sol";

interface IMintable {
    function mint(address to, uint256 amount) external;
}

/// @title DvP escrow with prefunded internal balances
/// @notice Holds shares and cash for every participant, the fund included.
/// A lot is a list of net positions that sums to zero (D11). The engine key
/// settles a lot in one call: either every line moves or nothing does.
/// Participants never sign a transaction here: they sign readable text on
/// their Ledger. This version rebuilds that text on chain and checks each
/// EIP-191 signature itself, so the escrow no longer trusts the engine for it.
contract SettlementEscrow is Ownable {
    using SafeERC20 for IERC20;

    struct Position {
        address participant;
        int256 shares; // + receives, - delivers
        int256 cash; // + receives, - pays
    }

    uint256 public constant DECIMALS = 6;
    uint256 private constant ONE = 10 ** DECIMALS;
    uint256 private constant SHORT_HASH_HEAD = 6; // "0x" + 4 hex chars
    uint256 private constant SHORT_HASH_TAIL = 4;
    uint256 private constant HEX_LENGTH = 66; // "0x" + 64 hex chars

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
    error SignatureCountMismatch(uint256 positions, uint256 signatures);
    error BadApproval(address participant);

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
    /// cash do not sum to zero, if any balance would go negative, or if a
    /// participant's approval does not match the text it should have signed.
    /// @param lotId Unique id of the lot, also the replay guard.
    /// @param navPerUnit Cash for one share, 6 decimals. Part of the lot hash.
    /// @param positions Net lines of the lot, the fund included.
    /// @param navHash Hash of the NAV inputs and result (S-041).
    /// @param signatures One EIP-191 approval per position, in the same order. Empty for the fund's line.
    /// @param fundName Fund name as shown on the Ledger, part of the approval text.
    function settle(
        uint256 lotId,
        uint256 navPerUnit,
        Position[] calldata positions,
        bytes32 navHash,
        bytes[] calldata signatures,
        string calldata fundName
    ) external onlyEngine {
        if (settled[lotId]) revert LotAlreadySettled(lotId);
        if (signatures.length != positions.length) revert SignatureCountMismatch(positions.length, signatures.length);

        int256 sharesSum = 0;
        int256 cashSum = 0;
        for (uint256 i = 0; i < positions.length; i++) {
            sharesSum += positions[i].shares;
            cashSum += positions[i].cash;
        }
        if (sharesSum != 0 || cashSum != 0) revert LotNotBalanced(sharesSum, cashSum);

        bytes32 lotHash = hashLot(lotId, navPerUnit, positions);
        settled[lotId] = true;
        for (uint256 i = 0; i < positions.length; i++) {
            Position calldata p = positions[i];
            // The fund's line is operated by the clearing house: no Ledger approval for it.
            // Every other line must carry the signature of its participant over the exact text.
            bool approved = signatures[i].length == 0
                ? _isFundLine(p, positions)
                : _approved(lotId, fundName, p, lotHash, signatures[i]);
            // The reverts are the point: a lot settles as a whole or not at all.
            // forge-lint: disable-next-line(require-revert-in-loop)
            if (!approved) revert BadApproval(p.participant);
            // One view call on our own token per line is fine: a lot has a handful of lines.
            // forge-lint: disable-next-line(calls-loop,require-revert-in-loop)
            if (p.shares != 0 && !shareToken.isWhitelisted(p.participant)) revert NotWhitelisted(p.participant);
            _apply(p.participant, address(shareToken), p.shares);
            _apply(p.participant, address(cashToken), p.cash);
        }

        // The only external call above is a view on our own ShareToken: no reentrancy path.
        // forge-lint: disable-next-line(reentrancy-events)
        emit LotSettled(lotId, lotHash, navHash, signatures);
    }

    /// @notice Hash of a lot, recomputed off-chain by the engine (S-017).
    function hashLot(uint256 lotId, uint256 navPerUnit, Position[] calldata positions) public view returns (bytes32) {
        return keccak256(abi.encode(lotId, address(shareToken), address(cashToken), navPerUnit, positions));
    }

    /// @notice The exact text a participant reads on the Ledger before approving a lot.
    /// Same lines as lotApprovalToText in packages/protocol.
    function approvalText(uint256 lotId, string memory fundName, Position memory p, bytes32 lotHash)
        public
        pure
        returns (string memory)
    {
        string memory fullHash = Strings.toHexString(uint256(lotHash), 32);
        return string.concat(
            "Lot ",
            Strings.toString(lotId),
            ", ",
            fundName,
            "\n",
            p.shares < 0 ? "You deliver " : "You receive ",
            _formatUnits(_abs(p.shares)),
            " units\n",
            p.cash < 0 ? "You pay " : "You receive ",
            _formatUnits(_abs(p.cash)),
            " cash\nLot hash ",
            _shortHash(fullHash),
            "\nFull hash ",
            fullHash
        );
    }

    function _approved(
        uint256 lotId,
        string calldata fundName,
        Position calldata p,
        bytes32 lotHash,
        bytes calldata signature
    ) private pure returns (bool) {
        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(bytes(approvalText(lotId, fundName, p, lotHash)));
        (address signer, ECDSA.RecoverError err,) = ECDSA.tryRecover(digest, signature);
        return err == ECDSA.RecoverError.NoError && signer == p.participant;
    }

    // The fund's line is the one that balances the others: it is the last line by convention (D11).
    function _isFundLine(Position calldata p, Position[] calldata positions) private pure returns (bool) {
        return p.participant == positions[positions.length - 1].participant;
    }

    // Same output as viem formatUnits(value, 6): no trailing zeros, no dot when whole.
    function _formatUnits(uint256 value) private pure returns (string memory) {
        uint256 whole = value / ONE;
        uint256 fraction = value % ONE;
        if (fraction == 0) return Strings.toString(whole);
        bytes memory digits = bytes(Strings.toString(fraction + ONE)); // pad to 6 digits with a leading 1
        uint256 end = digits.length;
        while (digits[end - 1] == "0") end--;
        bytes memory trimmed = new bytes(end - 1);
        for (uint256 i = 1; i < end; i++) {
            trimmed[i - 1] = digits[i];
        }
        return string.concat(Strings.toString(whole), ".", string(trimmed));
    }

    // "0x1a2b...9ea2"
    function _shortHash(string memory fullHash) private pure returns (string memory) {
        bytes memory full = bytes(fullHash);
        bytes memory head = new bytes(SHORT_HASH_HEAD);
        bytes memory tail = new bytes(SHORT_HASH_TAIL);
        for (uint256 i = 0; i < SHORT_HASH_HEAD; i++) {
            head[i] = full[i];
        }
        for (uint256 i = 0; i < SHORT_HASH_TAIL; i++) {
            tail[i] = full[HEX_LENGTH - SHORT_HASH_TAIL + i];
        }
        return string.concat(string(head), "...", string(tail));
    }

    function _abs(int256 value) private pure returns (uint256) {
        // casting is safe because the sum check excludes int256 min and the value is made non negative first
        // forge-lint: disable-next-line(unsafe-typecast)
        return value < 0 ? uint256(-value) : uint256(value);
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
