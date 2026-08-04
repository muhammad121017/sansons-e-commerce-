import { cn } from "@/lib/utils";

const TONES = {
  new: "bg-forest text-canvas",
  sale: "bg-wine text-canvas",
  cod: "bg-brass text-canvas",
  outOfStock: "bg-ink2 text-canvas",
  bestseller: "bg-ink text-canvas",
  success: "bg-forest text-canvas",
  warning: "bg-brass text-canvas",
  danger: "bg-wine text-canvas",
  neutral: "bg-canvas2 text-ink border border-line",
};

export default function Badge({ tone = "neutral", children, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider",
        TONES[tone] || TONES.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
