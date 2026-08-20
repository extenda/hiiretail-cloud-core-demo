import type { SelectHTMLAttributes } from "react";

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  options: readonly { value: string; label: string }[];
}

export function SelectInput({
  label,
  hint,
  options,
  id,
  ...rest
}: SelectInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-stone-600"
      >
        {label}
      </label>
      <select
        id={id}
        {...rest}
        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}
