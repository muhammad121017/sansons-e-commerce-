import { Star } from "lucide-react";

export default function StarRating({ rating = 0, reviewCount, size = 14, showCount = true }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < Math.round(rating) ? "fill-brass text-brass" : "fill-none text-line"}
          />
        ))}
      </div>
      {showCount && reviewCount != null && (
        <span className="text-xs text-ink2">({reviewCount})</span>
      )}
    </div>
  );
}
