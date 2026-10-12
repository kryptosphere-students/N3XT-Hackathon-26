import { verifyMessage, type Address, type Hex } from "viem";

// EIP-191 check (D6): the text the Flex displayed, signed by the participant's key.
// Every human signature in the POC goes through here.
export function verifyEip191(address: Address, text: string, signature: Hex): Promise<boolean> {
  return verifyMessage({ address, message: text, signature });
}
