import type { PublishOutcome } from "../api/publish";

const MEANINGS: Record<number, string> = {
  200: "Saved.",
  201: "Saved — first time for this language.",
  400: "Couldn't save. Check the text, or sign in again.",
  422: "A key isn't in the English source.",
  500: "Couldn't save. Try again.",
};

function meaningFor(status: number): string {
  if (status === 403) return "This sign-in can't change this copy.";

  return MEANINGS[status] ?? "Couldn't save. Try again.";
}

export function PublishResult({ outcome }: { outcome: PublishOutcome }) {
  const succeeded = outcome.status >= 200 && outcome.status < 300;

  return (
    <div className="px-4 py-4">
      <div
        className={`rounded-lg border px-4 py-3 ${
          succeeded
            ? "border-emerald-200 bg-emerald-50"
            : "border-stone-200 bg-stone-50"
        }`}
      >
        <p className="text-sm text-stone-800">{meaningFor(outcome.status)}</p>
        {outcome.messages.length > 0 && (
          <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-stone-600">
            {outcome.messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
