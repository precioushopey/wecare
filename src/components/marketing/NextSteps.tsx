/**
 * The numbered "what happens next" step list used on the result page, the
 * checkout page, and the order-confirmation page. Presentational only — pass
 * already-translated `{ title, body }` strings.
 */
export function NextSteps({
  steps,
}: {
  steps: { title: string; body: string }[];
}) {
  return (
    <ol
      className={
        steps.length === 3 ? "grid gap-4 sm:grid-cols-3" : "grid gap-4"
      }
    >
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sage-100 font-display text-sm text-petrol-700">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-medium text-ink">{s.title}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
