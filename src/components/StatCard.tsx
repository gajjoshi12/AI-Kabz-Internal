import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  hint?: string;
  delta?: number;
  color?: "indigo" | "emerald" | "rose" | "amber" | "sky" | "purple" | "slate";
};

const COLORS = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  purple: "bg-purple-50 text-purple-600",
  slate: "bg-slate-50 text-slate-600",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
  color = "indigo",
}: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
          {delta !== undefined && (
            <div
              className={cn(
                "inline-flex items-center gap-1 mt-2 text-xs font-medium",
                delta >= 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {delta >= 0 ? "+" : ""}
              {delta}%
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-lg", COLORS[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
