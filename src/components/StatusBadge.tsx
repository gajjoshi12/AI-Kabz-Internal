import { formatLabel } from "@/lib/utils";

const STATUS_DOT: Record<string, string> = {
  sent: "bg-blue-500",
  accepted: "bg-cyan-500",
  replied: "bg-indigo-500",
  interested: "bg-emerald-500",
  not_interested: "bg-red-500",
  no_response: "bg-slate-400",
  opened: "bg-violet-500",
  bounced: "bg-orange-500",
  connected: "bg-emerald-500",
  no_answer: "bg-slate-400",
  busy: "bg-amber-500",
  voicemail: "bg-amber-500",
  callback: "bg-sky-500",
  meeting_scheduled: "bg-purple-500",
  scheduled: "bg-blue-500",
  completed: "bg-emerald-500",
  no_show: "bg-red-500",
  cancelled: "bg-slate-400",
  rescheduled: "bg-amber-500",
  follow_up: "bg-indigo-500",
  closed_won: "bg-emerald-500",
  closed_lost: "bg-red-500",
  new: "bg-blue-500",
  contacted: "bg-cyan-500",
  converted: "bg-emerald-500",
  lost: "bg-red-500",
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-slate-400",
  linkedin: "bg-blue-500",
  instagram: "bg-pink-500",
  email: "bg-amber-500",
  referral: "bg-indigo-500",
  other: "bg-slate-400",
};

const STATUS_BG: Record<string, string> = {
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-cyan-50 text-cyan-700 border-cyan-200",
  replied: "bg-indigo-50 text-indigo-700 border-indigo-200",
  interested: "bg-emerald-50 text-emerald-700 border-emerald-200",
  not_interested: "bg-red-50 text-red-700 border-red-200",
  no_response: "bg-slate-50 text-slate-600 border-slate-200",
  opened: "bg-violet-50 text-violet-700 border-violet-200",
  bounced: "bg-orange-50 text-orange-700 border-orange-200",
  connected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  no_answer: "bg-slate-50 text-slate-600 border-slate-200",
  busy: "bg-amber-50 text-amber-700 border-amber-200",
  voicemail: "bg-amber-50 text-amber-700 border-amber-200",
  callback: "bg-sky-50 text-sky-700 border-sky-200",
  meeting_scheduled: "bg-purple-50 text-purple-700 border-purple-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  no_show: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-slate-50 text-slate-600 border-slate-200",
  rescheduled: "bg-amber-50 text-amber-700 border-amber-200",
  follow_up: "bg-indigo-50 text-indigo-700 border-indigo-200",
  closed_won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed_lost: "bg-red-50 text-red-700 border-red-200",
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-cyan-50 text-cyan-700 border-cyan-200",
  converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-red-50 text-red-700 border-red-200",
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-600 border-slate-200",
  linkedin: "bg-blue-50 text-blue-700 border-blue-200",
  instagram: "bg-pink-50 text-pink-700 border-pink-200",
  email: "bg-amber-50 text-amber-700 border-amber-200",
  referral: "bg-indigo-50 text-indigo-700 border-indigo-200",
  other: "bg-slate-50 text-slate-600 border-slate-200",
};

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="text-ink-300">—</span>;
  const dot = STATUS_DOT[status] || "bg-slate-400";
  const bg = STATUS_BG[status] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`badge ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {formatLabel(status)}
    </span>
  );
}
