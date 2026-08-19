export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10">
      <svg
        className="h-5 w-5 animate-spin text-brand-500"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-90"
          d="M22 12a10 10 0 0 0-10-10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && <p className="text-xs text-stone-500">{label}</p>}
    </div>
  );
}
