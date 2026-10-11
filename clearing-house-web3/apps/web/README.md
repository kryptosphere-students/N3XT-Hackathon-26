# web

Vite + React + DMK over WebHID, Chrome only. One Flex, three derived accounts.

From `clearing-house-web3/`, with the server running (`npm run dev -w apps/server`):

```bash
npm run dev -w apps/web
```

Close Ledger Wallet first, otherwise Chrome can't see the device.

Steps on the page:

1. Connect the Flex (Ethereum app open).
2. Read the three addresses `44'/60'/0'/0/0`, `44'/60'/1'/0/0`, `44'/60'/2'/0/0`, each checked on the device (S-007). Copy them into `.env`.
3. Sign a mandate as a manager (S-019). The Flex shows the text, the server verifies it with `verifyMessage`.
4. Sign an order (S-020). Same flow.

Everything signed is plain text (EIP-191). The DMK code is in `src/ledger/`: `dmk.tsx` (React provider, no module singleton), `accounts.ts` (paths as constants), `sign.ts` (`getAddress` with `checkOnDevice`, `signMessage` to a viem signature), `errors.ts` (user rejection told apart from errors).

## Flex test results (11 Oct 2026, Ledger Flex, Ethereum app)

The first test page (S-005, S-006) is in the git history, commit `86d8da4`.

| Test | Result |
|---|---|
| Read the address (`getAddress`) | Works. Address shown on the page and checked on the device. |
| Sign plain text (EIP-191, `signMessage`) | Works. The text is readable on the Flex, line breaks included. |
| Sign typed data (EIP-712, `signTypedData`) with no descriptor registered | First an opt-in screen for Transaction Check. Then "This transaction cannot be clear-signed, enable blind signing in the settings". We rejected. The app returned `6a80 Invalid data`. |

What we take from it: anything the user must read on the Flex goes through EIP-191 text, or through contracts that already have an ERC-7730 descriptor in the Clear Signing registry. Our own EIP-712 types or our own contracts would need blind signing, which we don't want.

Versions: device-management-kit 1.11.0, device-transport-kit-web-hid 1.2.4, device-signer-kit-ethereum 1.18.1.
