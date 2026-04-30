"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar } from "lucide-react";

const PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7", label: "Last 7" },
  { value: "last30", label: "Last 30" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
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
    <div className="flex items-center gap-2 flex-wrap">
      <Calendar size={16} className="text-gray-500" />
      <span className="text-sm text-gray-500">Range:</span>
      <div className="flex flex-wrap gap-1.5 bg-gray-100 rounded-lg p-1">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => setRange(p.value)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              current === p.value
                ? "bg-white text-brand-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
