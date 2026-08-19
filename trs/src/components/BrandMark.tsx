const SIZES = {
  sm: "h-7 w-7 rounded-lg text-[10px]",
  lg: "h-12 w-12 rounded-xl text-sm",
} as const;

export function BrandMark({ size = "sm" }: { size?: keyof typeof SIZES }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-brand-900 font-semibold text-white ${SIZES[size]}`}
    >
      TRS
    </div>
  );
}
