import Link from "next/link";
import Button from "./Button";

export default function EmptyState({ icon: Icon, title, description, ctaLabel, ctaHref }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      {Icon && (
        <div className="mb-4 p-4 rounded-full bg-canvas2 text-ink2">
          <Icon size={28} />
        </div>
      )}
      <h3 className="font-display text-2xl mb-2">{title}</h3>
      {description && <p className="text-ink2 max-w-sm mb-6">{description}</p>}
      {ctaLabel && ctaHref && (
        <Button as={Link} href={ctaHref} variant="primary">
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
