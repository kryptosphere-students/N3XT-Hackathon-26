import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { SHARE_DECIMALS } from "@chw3/engine";
import { getDemoEmails, intake, type IntakeResult } from "../api.ts";
import { PARTICIPANTS, type ParticipantKey } from "../ledger/accounts.ts";

export type DraftForForm = { who: ParticipantKey; side: "BUY" | "SELL"; units: string };

// S-044 and S-028. The agent reads an email and drafts. Our code checks the
// draft against the signed mandate. Only an accepted draft can go to the Flex.
export function IntakePanel({ onDraft }: { onDraft: (draft: DraftForForm) => void }) {
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getDemoEmails().then(setEmails).catch(() => setEmails({}));
  }, []);

  async function run(text: string) {
    setEmailText(text);
    setResult(null);
    setError("");
    setBusy(true);
    try {
      setResult(await intake(text));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const draft = result?.draft;
  const accepted = Boolean(draft && result?.check?.ok);
  const who = draft && PARTICIPANTS.find((p) => p.name.toLowerCase() === draft.participantName.toLowerCase())?.key;

  return (
    <div>
      <p>
        <button className="demo" onClick={() => run(emails.clear ?? "")} disabled={busy || !emails.clear}>
          Demo: new email order
        </button>{" "}
        <button className="demo" onClick={() => run(emails.trapped ?? "")} disabled={busy || !emails.trapped}>
          Demo: trapped email
        </button>{" "}
        <button className="demo" onClick={() => run(emails.ambiguous ?? "")} disabled={busy || !emails.ambiguous}>
          Demo: ambiguous email
        </button>
      </p>
      <textarea value={emailText} onChange={(e) => setEmailText(e.target.value)} rows={6} placeholder="Paste an email, or use a demo button" />
      <p>
        <button onClick={() => run(emailText)} disabled={busy || !emailText.trim()}>
          {busy ? "The agent is reading..." : "Read with the agent"}
        </button>
      </p>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="intake-result">
          <p>
            <strong>Agent</strong> ({result.modelUsed}): {result.explanation || "no explanation"}
          </p>
          {result.refusedTools.length > 0 && <p className="error">Refused tool calls: {result.refusedTools.join(", ")}</p>}
          {draft ? (
            <p>
              Draft: {draft.side === "BUY" ? "subscribe" : "redeem"} {formatUnits(BigInt(draft.shares), SHARE_DECIMALS)} units of {draft.fundName} for {draft.participantName}.
            </p>
          ) : (
            <p>No draft created.</p>
          )}
          {draft && result.check && (
            <p className={result.check.ok ? "ok" : "error"}>
              Mandate check (code, not the agent): {result.check.ok ? "inside the signed mandate" : `refused: ${result.check.reasons.join("; ")}`}
              {!result.check.ok && " The Flex is not asked to sign anything."}
            </p>
          )}
          {accepted && who && (
            <button onClick={() => onDraft({ who, side: draft!.side, units: formatUnits(BigInt(draft!.shares), SHARE_DECIMALS) })}>
              Send the draft to the order form
            </button>
          )}
        </div>
      )}
    </div>
  );
}
