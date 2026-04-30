import { formatLabel, statusBadge } from "@/lib/utils";

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  return <span className={`badge ${statusBadge(status)}`}>{formatLabel(status)}</span>;
}
