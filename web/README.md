# web: Ledger Flex test page

Test page used to check what a Ledger Flex shows before we build the real interface. Vite + React + DMK over WebHID, Chrome only.

```bash
npm install
npm run dev
```

Close Ledger Wallet first, otherwise Chrome can't see the device.

## Results (11 Oct 2026, Ledger Flex, Ethereum app)

| Test | Result |
|---|---|
| Read the address (`getAddress`) | Works. Address shown on the page and checked on the device. |
| Sign plain text (EIP-191, `signMessage`) | Works. The text is readable on the Flex, line breaks included. |
| Sign typed data (EIP-712, `signTypedData`) with no descriptor registered | First an opt-in screen for Transaction Check. Then "This transaction cannot be clear-signed, enable blind signing in the settings". We rejected. The app returned `6a80 Invalid data`. |

What we take from it: anything the user must read on the Flex goes through EIP-191 text, or through contracts that already have an ERC-7730 descriptor in the Clear Signing registry. Our own EIP-712 types or our own contracts would need blind signing, which we don't want.

Versions: device-management-kit 1.11.0, device-transport-kit-web-hid 1.2.4, device-signer-kit-ethereum 1.18.1.
