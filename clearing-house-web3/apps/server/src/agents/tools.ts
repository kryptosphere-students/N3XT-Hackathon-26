import { z } from "zod";
import type { ToolDefinition } from "./llm.ts";

// S-027: the only tool the intake agent may call. The model extracts text
// fields; our code turns units into bigint and checks the mandate later.
export const DRAFT_INSTRUCTION = "draft_instruction";

export const draftInstructionTool: ToolDefinition = {
  type: "function",
  function: {
    name: DRAFT_INSTRUCTION,
    description:
      "Create a draft subscription or redemption order from an email. Call it only when the fund, the side, the number of units and the manager are all explicit in the email.",
    parameters: {
      type: "object",
      properties: {
        fund: { type: "string", description: "Fund name exactly as written, for example Fund F" },
        side: { type: "string", enum: ["BUY", "SELL"], description: "BUY for a subscription, SELL for a redemption" },
        units: { type: "string", description: "Number of units as written in the email, digits only, for example 100 or 12.5" },
        participant: { type: "string", description: "Name of the manager giving the order, for example Manager A" },
      },
      required: ["fund", "side", "units", "participant"],
      additionalProperties: false,
    },
    strict: true,
  },
};

const MAX_UNIT_DECIMALS = 6;
const UNITS_PATTERN = new RegExp(`^\\d+(\\.\\d{1,${MAX_UNIT_DECIMALS}})?$`);

export function draftInstructionArgsSchema(knownFunds: string[]) {
  return z.object({
    fund: z.string().refine((name) => knownFunds.includes(name), "unknown fund"),
    side: z.enum(["BUY", "SELL"]),
    units: z.string().regex(UNITS_PATTERN, "units must be a positive decimal number"),
    participant: z.string().min(1).max(40),
  });
}

export type DraftInstructionArgs = z.infer<ReturnType<typeof draftInstructionArgsSchema>>;

export const WHITELISTED_TOOLS: ToolDefinition[] = [draftInstructionTool];
