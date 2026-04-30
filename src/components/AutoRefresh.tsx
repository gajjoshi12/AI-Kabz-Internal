"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);
    const interval = setInterval(() => router.refresh(), 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="btn-secondary"
      title="Refresh data"
    >
      <RefreshCw size={14} />
      Refresh
    </button>
  );
}
