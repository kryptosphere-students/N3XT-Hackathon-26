import { z } from "zod";

// Validation of what comes over HTTP. Amounts travel as decimal strings
// and become bigint here, so no float ever touches a quantity.
export const addressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/)
  .transform((value) => value as `0x${string}`);

export const hexSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]*$/)
  .transform((value) => value as `0x${string}`);

export const amountSchema = z
  .string()
  .regex(/^\d+$/)
  .transform((value) => BigInt(value));

export const sideSchema = z.enum(["BUY", "SELL"]);

export const nonceSchema = z.number().int().nonnegative();

export const mandateBodySchema = z.object({
  mandate: z.object({
    participant: addressSchema,
    participantName: z.string().min(1).max(40),
    allowedFunds: z.array(z.string().min(1).max(40)).min(1),
    maxCashPerCycle: amountSchema,
    allowedSides: z.array(sideSchema).min(1),
    nonce: nonceSchema,
  }),
  signature: hexSchema,
});

export const instructionBodySchema = z.object({
  instruction: z.object({
    id: z.string().min(1).max(40),
    cycleId: z.string().min(1).max(40),
    fund: addressSchema,
    participant: addressSchema,
    side: sideSchema,
    shares: amountSchema.refine((value) => value > 0n, "shares must be positive"),
  }),
  fundName: z.string().min(1).max(40),
  participantName: z.string().min(1).max(40),
  nonce: nonceSchema,
  signature: hexSchema,
  // Where the fields came from, for the timeline. Not part of the signed text.
  origin: z.enum(["agent", "manual"]).default("manual"),
});
