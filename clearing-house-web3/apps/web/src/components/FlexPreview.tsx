// The exact EIP-191 text the Flex will display. What you see here is what gets signed.
export function FlexPreview({ text, label = "Your Flex will show" }: { text: string; label?: string }) {
  return (
    <div className="flex-preview">
      <div className="label">{label}</div>
      {text}
    </div>
  );
}
