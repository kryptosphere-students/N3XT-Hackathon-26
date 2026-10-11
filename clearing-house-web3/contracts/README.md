# contracts

Foundry project. Three contracts, Base Sepolia as target.

- `ShareToken.sol`: ERC-20 shares of the fund, 6 decimals, whitelist of participants kept by the owner. Only whitelisted addresses can receive shares. The escrow is the minter.
- `MockCash.sol`: ERC-20 test cash, 6 decimals, free mint.
- `SettlementEscrow.sol`: internal balances per participant and per token, prefunded by the owner. The engine key calls `settle` with a lot that sums to zero. Everything moves or nothing does. One event `LotSettled(lotId, lotHash, navHash, signatures)`.

```bash
forge test
forge test -vv --match-test referenceLotHash
```

## Lot hash (S-012, S-017)

```
lotHash = keccak256(abi.encode(lotId, shareToken, cashToken, navPerUnit, positions))
positions = (address participant, int256 shares, int256 cash)[]
```

`cycleId` is not in the hash. Reference values, checked on both sides on 12 Oct 2026:

| Input | Value |
|---|---|
| lotId | 7 |
| shareToken | 0x16c97EfC46019D42ab6CdDa5dAd70C6A96568a69 |
| cashToken | 0xCd0e0EAf78435fdC882dE50833adaFCB5951a27A |
| navPerUnit | 105000000 |
| position 1 | 0x1111111111111111111111111111111111111111, +100000000, -10500000000 |
| position 2 | 0x2222222222222222222222222222222222222222, -40000000, +4200000000 |
| position 3 | 0x3333333333333333333333333333333333333333, -60000000, +6300000000 |
| lotHash | 0xd9e1d479dbe07a9fa30625248c923e1831eb32501690ede4a5355900cccd9ea2 |

In TypeScript, `encodeAbiParameters` from viem with the types `uint256, address, address, uint256, tuple(address,int256,int256)[]`, then `keccak256`, gives the same hash.

## Deployment (S-014)

See `script/Deploy.s.sol` and `docs-clearing-house-web3/dev/SETUP.md`, section 4.
