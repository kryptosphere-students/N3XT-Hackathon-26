import { useEffect, useState } from "react";
import { checkDraft, getDemoEmails, intake, type IntakeResult } from "../api.ts";
import { sideLabel, units } from "../format.ts";
import { PARTICIPANTS, type ParticipantKey } from "../ledger/accounts.ts";
import { Badge } from "./Badge.tsx";

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

  // What the hidden notice of the trapped email asks for. Second line of defence:
  // even an agent that obeyed it would be stopped by the signed mandate.
  async function simulateFooledAgent() {
    setResult(null);
    setError("");
    setBusy(true);
    try {
      setResult(await checkDraft({ fundName: "Fund F", participantName: "Manager A", side: "SELL", units: "1000000" }));
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
      <div className="actions">
        <button className="demo" onClick={() => run(emails.clear ?? "")} disabled={busy || !emails.clear}>
          New email order
        </button>
        <button className="demo" onClick={() => run(emails.trapped ?? "")} disabled={busy || !emails.trapped}>
          Trapped email
        </button>
        <button className="demo" onClick={() => run(emails.ambiguous ?? "")} disabled={busy || !emails.ambiguous}>
          Ambiguous email
        </button>
        <button className="demo" onClick={simulateFooledAgent} disabled={busy}>
          Simulate a fooled agent
        </button>
      </div>
      <textarea value={emailText} onChange={(e) => setEmailText(e.target.value)} rows={7} placeholder="Paste an email from a manager, or use a demo button" />
      <div className="actions">
        <button className="secondary" onClick={() => run(emailText)} disabled={busy || !emailText.trim()}>
          {busy ? "The agent is reading..." : "Read with the agent"}
        </button>
      </div>
      {error && <p className="notice bad">{error}</p>}
      {result && (
        <div className="agent-result" data-testid="agent-result">
          <p>
            <Badge tone="accent">Agent</Badge> <span className="small muted">{result.modelUsed}</span>
            <br />
            {result.explanation || "no explanation"}
          </p>
          {result.refusedTools.length > 0 && <p className="notice bad">Refused tool calls: {result.refusedTools.join(", ")}</p>}
          {draft ? (
            <p>
              <strong>Draft:</strong> {sideLabel(draft.side)} {units(draft.shares)} units of {draft.fundName} for {draft.participantName}.
            </p>
          ) : (
            <p>
              <strong>No draft created.</strong>
            </p>
          )}
          {draft && result.check && (
            <p className={`notice ${result.check.ok ? "ok" : "bad"}`}>
              Mandate check by code: {result.check.ok ? "inside the signed mandate." : `refused. ${result.check.reasons.join("; ")}.`}
              {!result.check.ok && " The Flex is not asked to sign anything."}
            </p>
          )}
          {accepted && who && (
            <div className="actions">
              <button onClick={() => onDraft({ who, side: draft!.side, units: units(draft!.shares).replace(/,/g, "") })}>Send the draft to the order form</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
