"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export function AutoRefresh() {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);
    const interval = setInterval(() => router.refresh(), 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [router]);

  const refresh = () => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 700);
  };

  return (
    <button
      type="button"
      onClick={refresh}
      className="btn-secondary"
      title="Refresh data"
    >
      <RefreshCw size={14} className={spinning ? "animate-spin" : ""} />
      Refresh
    </button>
  );
}
