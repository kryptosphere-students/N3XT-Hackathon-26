import { formatUnits } from "viem";
import { SHARE_DECIMALS, type Instruction, type Side } from "@chw3/engine";

// An instruction plus what the Flex must display. The names are for the
// screen only: the server checks the signature against instruction.participant.
export type InstructionPayload = {
  instruction: Instruction;
  fundName: string;
  participantName: string;
  nonce: number;
};

const ORDER_VERB: Record<Side, string> = { BUY: "Subscribe", SELL: "Redeem" };

// The exact text shown on the Flex and signed with EIP-191 (S-020).
export function instructionToText(payload: InstructionPayload): string {
  const { instruction } = payload;
  return [
    `${payload.fundName} order ${instruction.id}`,
    `${ORDER_VERB[instruction.side]} ${formatUnits(instruction.shares, SHARE_DECIMALS)} units`,
    `Cycle ${instruction.cycleId}`,
    payload.participantName,
    `Nonce ${payload.nonce}`,
  ].join("\n");
}
