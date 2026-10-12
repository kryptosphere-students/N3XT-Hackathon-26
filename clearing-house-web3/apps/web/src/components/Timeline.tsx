export type Step = { label: string; state: "todo" | "done" | "current" | "bad" };

// One line of dots: what happened to an order or a lot, in order.
export function Timeline({ steps }: { steps: Step[] }) {
  return (
    <div className="timeline">
      {steps.map((s, i) => (
        <span key={i} className={`tstep ${s.state === "todo" ? "" : s.state}`}>
          {s.label}
        </span>
      ))}
    </div>
  );
}
