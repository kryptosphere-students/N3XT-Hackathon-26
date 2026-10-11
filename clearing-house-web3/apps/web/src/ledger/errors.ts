// The Ethereum app answers 6985 when the user rejects on the device.
// A rejection is a decision, not a bug: the UI shows it as such.
const USER_REJECTED_STATUS = "6985";

export function isDeviceRejection(error: unknown): boolean {
  const text = JSON.stringify(error) ?? "";
  return text.includes(USER_REJECTED_STATUS) || /rejected|refused|denied/i.test(text);
}

export function describeDeviceError(error: unknown): string {
  if (isDeviceRejection(error)) return "Rejected on the Flex";
  if (error instanceof Error) return error.message;
  const tag = (error as { _tag?: string })?._tag;
  return tag ? `Device error: ${tag}` : "Device error: " + JSON.stringify(error);
}
