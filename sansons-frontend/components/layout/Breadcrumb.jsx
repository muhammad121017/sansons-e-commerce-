import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink2 flex-wrap">
      <Link href="/" className="hover:text-forest">Home</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={12} />
          {item.href ? (
            <Link href={item.href} className="hover:text-forest">{item.label}</Link>
          ) : (
            <span aria-current="page" className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
