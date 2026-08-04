import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({ value, onChange, min = 1, max = 99 }) {
  return (
    <div className="inline-flex items-center border border-line rounded-sm">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="p-3 disabled:opacity-30 hover:bg-canvas2"
      >
        <Minus size={14} />
      </button>
      <span className="w-10 text-center text-sm font-medium" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="p-3 disabled:opacity-30 hover:bg-canvas2"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
