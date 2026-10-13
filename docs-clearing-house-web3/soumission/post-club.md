# Club post, two versions

Post from the club account, with #LedgerN3XTCollab and @Ledger. Replace the placeholders. Attach the screenshot `docs-clearing-house-web3/screenshots/07-lot-settled.png` or a short clip of the Flex approving a lot.

## X (under 280 characters)

Kryptosphere at the @Ledger N3XT hackathon: Cendro, a settlement engine for tokenized funds. An AI agent drafts orders from emails, code checks the signed mandate, managers approve on a Ledger Flex. Repo: [LINK] Demo: [LINK] #LedgerN3XTCollab

## LinkedIn

Kryptosphere took part in the @Ledger N3XT hackathon this week. Our project: Cendro, a settlement engine for tokenized funds.

Orders still arrive by email and get retyped by hand. In our prototype, an AI agent reads the email and drafts the order. It only has one tool and never computes an amount. Deterministic code checks the draft against a mandate the manager signed on a Ledger Flex. The manager then reads the order on the device and signs it, as plain text. The engine nets the cycle, each participant approves on the Flex what it receives and what it pays, and the escrow settles units against cash in one transaction on Base Sepolia.

The boundary is simple to state: the agent reads and explains, the code nets and checks, the human signs on the device every time. A trapped email asking to redeem everything is refused by the signed mandate and never reaches the Flex.

Ledger tools used: Device Management Kit (EIP-191 signing over WebHID) and Ledger Key Ring to keep the agent's API key encrypted.

Thanks to Ledger for the mentoring during the week and for covering the trip to Paris for the final.

Repository: [LINK]
Demo video: [LINK]
Contracts on Base Sepolia: https://sepolia.basescan.org/address/0xeBc2456c49a5E29c69D68258A8865E3f8A694AcE#code

#LedgerN3XTCollab #Kryptosphere #Web3 #Ledger
