import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
};

export function StatCard({ icon: Icon, label, value, note }: StatCardProps) {
  return (
    <article className="rounded-lg border border-sage/80 bg-paper p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">{label}</p>
        <div className="grid size-9 place-items-center rounded-md bg-mint text-fern">
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-sm text-muted">{note}</p>
    </article>
  );
}
