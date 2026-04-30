import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  hint?: string;
  delta?: number;
  color?: "indigo" | "emerald" | "rose" | "amber" | "sky" | "purple" | "slate" | "fuchsia";
  accent?: boolean;
};

const COLORS: Record<string, { bg: string; ring: string; gradient: string }> = {
  indigo: {
    bg: "bg-indigo-50 text-indigo-600",
    ring: "ring-indigo-500/10",
    gradient: "from-indigo-500 to-violet-500",
  },
  emerald: {
    bg: "bg-emerald-50 text-emerald-600",
    ring: "ring-emerald-500/10",
    gradient: "from-emerald-500 to-teal-500",
  },
  rose: {
    bg: "bg-rose-50 text-rose-600",
    ring: "ring-rose-500/10",
    gradient: "from-rose-500 to-pink-500",
  },
  amber: {
    bg: "bg-amber-50 text-amber-600",
    ring: "ring-amber-500/10",
    gradient: "from-amber-500 to-orange-500",
  },
  sky: {
    bg: "bg-sky-50 text-sky-600",
    ring: "ring-sky-500/10",
    gradient: "from-sky-500 to-blue-500",
  },
  purple: {
    bg: "bg-purple-50 text-purple-600",
    ring: "ring-purple-500/10",
    gradient: "from-purple-500 to-fuchsia-500",
  },
  fuchsia: {
    bg: "bg-fuchsia-50 text-fuchsia-600",
    ring: "ring-fuchsia-500/10",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  slate: {
    bg: "bg-slate-50 text-slate-600",
    ring: "ring-slate-500/10",
    gradient: "from-slate-500 to-slate-700",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  color = "indigo",
  accent,
}: StatCardProps) {
  const c = COLORS[color];
  return (
    <div
      className={cn(
        "card card-hover p-5 relative overflow-hidden group",
        accent && "ring-1 ring-brand-500/15"
      )}
    >
      {/* subtle decorative gradient */}
      <div
        className={cn(
          "absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.07] bg-gradient-to-br blur-2xl transition-opacity duration-300 group-hover:opacity-[0.12]",
          c.gradient
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-ink-900 tracking-tight tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
          {delta !== undefined && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-2.5 text-xs font-semibold px-2 py-0.5 rounded-md",
                delta > 0
                  ? "text-emerald-700 bg-emerald-50"
                  : delta < 0
                  ? "text-rose-700 bg-rose-50"
                  : "text-ink-600 bg-ink-100"
              )}
            >
              {delta > 0 ? (
                <TrendingUp size={11} />
              ) : delta < 0 ? (
                <TrendingDown size={11} />
              ) : (
                <Minus size={11} />
              )}
              {delta > 0 ? "+" : ""}
              {delta}%
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-xl ring-4 shrink-0", c.bg, c.ring)}>
            <Icon size={18} strokeWidth={2.25} />
          </div>
        )}
      </div>
    </div>
  );
}
