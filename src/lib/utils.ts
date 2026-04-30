import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  format,
} from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DateRange = {
  from: Date;
  to: Date;
  label: string;
};

export function getDateRange(preset: string): DateRange {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now), label: "Today" };
    case "yesterday": {
      const y = subDays(now, 1);
      return { from: startOfDay(y), to: endOfDay(y), label: "Yesterday" };
    }
    case "last7":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now), label: "Last 7 days" };
    case "last30":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now), label: "Last 30 days" };
    case "week":
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
        label: "This week",
      };
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now), label: "This month" };
    default:
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now), label: "Last 7 days" };
  }
}

export function parseDateRange(searchParams: URLSearchParams): DateRange {
  const preset = searchParams.get("range");
  if (preset) return getDateRange(preset);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from && to) {
    return {
      from: startOfDay(new Date(from)),
      to: endOfDay(new Date(to)),
      label: `${from} → ${to}`,
    };
  }
  return getDateRange("last7");
}

export function formatDate(d: Date | string, fmt = "MMM d, yyyy") {
  return format(new Date(d), fmt);
}

export function formatDateTime(d: Date | string) {
  return format(new Date(d), "MMM d, yyyy h:mm a");
}

export function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCSV(rows: Record<string, unknown>[], columns?: string[]): string {
  if (!rows.length) return "";
  const cols = columns ?? Object.keys(rows[0]);
  const header = cols.map(csvEscape).join(",");
  const body = rows
    .map((r) => cols.map((c) => csvEscape(r[c])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

export const STATUS_COLORS: Record<string, string> = {
  sent: "bg-blue-100 text-blue-700 border-blue-200",
  accepted: "bg-cyan-100 text-cyan-700 border-cyan-200",
  replied: "bg-indigo-100 text-indigo-700 border-indigo-200",
  interested: "bg-green-100 text-green-700 border-green-200",
  not_interested: "bg-red-100 text-red-700 border-red-200",
  no_response: "bg-gray-100 text-gray-700 border-gray-200",
  opened: "bg-violet-100 text-violet-700 border-violet-200",
  bounced: "bg-orange-100 text-orange-700 border-orange-200",
  connected: "bg-emerald-100 text-emerald-700 border-emerald-200",
  no_answer: "bg-gray-100 text-gray-700 border-gray-200",
  busy: "bg-yellow-100 text-yellow-700 border-yellow-200",
  voicemail: "bg-amber-100 text-amber-700 border-amber-200",
  callback: "bg-sky-100 text-sky-700 border-sky-200",
  meeting_scheduled: "bg-purple-100 text-purple-700 border-purple-200",
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  no_show: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  rescheduled: "bg-yellow-100 text-yellow-700 border-yellow-200",
  follow_up: "bg-indigo-100 text-indigo-700 border-indigo-200",
  closed_won: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed_lost: "bg-red-100 text-red-700 border-red-200",
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-cyan-100 text-cyan-700 border-cyan-200",
  converted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-red-100 text-red-700 border-red-200",
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-gray-100 text-gray-700 border-gray-200",
};

export function statusBadge(status?: string | null): string {
  if (!status) return STATUS_COLORS.no_response;
  return STATUS_COLORS[status] || "bg-gray-100 text-gray-700 border-gray-200";
}

export function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
