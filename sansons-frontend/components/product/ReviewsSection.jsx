import StarRating from "@/components/ui/StarRating";
import { formatDate } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";

export default function ReviewsSection({ product, reviews }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="text-center">
          <p className="font-display text-4xl">{product.rating}</p>
          <StarRating rating={product.rating} showCount={false} size={16} />
          <p className="text-xs text-ink2 mt-1">{product.reviewCount} reviews</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-ink2">No written reviews yet — be the first to share your thoughts.</p>
      ) : (
        <ul className="divide-y divide-line">
          {reviews.map((r) => (
            <li key={r.id} className="py-5">
              <div className="flex items-center justify-between mb-1">
                <StarRating rating={r.rating} showCount={false} size={13} />
                <span className="text-xs text-ink2">{formatDate(r.date)}</span>
              </div>
              <p className="font-medium text-sm mt-2">{r.title}</p>
              <p className="text-sm text-ink2 mt-1 leading-relaxed">{r.body}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-ink2">
                {r.verified && <BadgeCheck size={13} className="text-forest" />}
                <span>{r.author}</span>
                {r.verified && <span>· Verified purchase</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
