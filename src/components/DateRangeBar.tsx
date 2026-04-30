"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar } from "lucide-react";

const PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "7d" },
  { value: "last30", label: "30d" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

export function DateRangeBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const current = sp.get("range") || "last7";

  const setRange = (v: string) => {
    const params = new URLSearchParams(sp.toString());
    params.set("range", v);
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="inline-flex items-center gap-1.5 bg-white border border-ink-200 rounded-xl shadow-soft p-1">
      <Calendar size={15} className="text-ink-400 ml-2 mr-0.5" />
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => setRange(p.value)}
          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            current === p.value
              ? "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-glow-sm"
              : "text-ink-600 hover:text-ink-900 hover:bg-ink-100"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
