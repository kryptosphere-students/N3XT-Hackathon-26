// One Flex, three accounts (S-007). Ledger Live convention, no m/ prefix.
// These paths are part of the protocol: never built from user input.
export const PARTICIPANTS = [
  { key: "A", name: "Manager A", path: "44'/60'/0'/0/0" },
  { key: "B", name: "Manager B", path: "44'/60'/1'/0/0" },
  { key: "C", name: "Depositary C", path: "44'/60'/2'/0/0" },
] as const;

export type ParticipantKey = (typeof PARTICIPANTS)[number]["key"];

export function participant(key: ParticipantKey) {
  return PARTICIPANTS.find((p) => p.key === key)!;
}
