import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  mono?: boolean;
}

export function TextField({ label, hint, mono, id, ...rest }: TextFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-stone-600"
      >
        {label}
      </label>
      <input
        id={id}
        {...rest}
        className={`w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:bg-stone-50 disabled:text-stone-500 ${
          mono ? "font-mono" : ""
        }`}
      />
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}
