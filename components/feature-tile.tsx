import type { LucideIcon } from "lucide-react";

type FeatureTileProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureTile({ icon: Icon, title, description }: FeatureTileProps) {
  return (
    <article className="rounded-lg border border-sage/80 bg-paper/90 p-5 shadow-soft">
      <div className="mb-4 grid size-10 place-items-center rounded-lg bg-mint text-fern">
        <Icon size={20} />
      </div>
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}
