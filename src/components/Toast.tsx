"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastKind = "success" | "error" | "warning" | "info";
type Toast = { id: string; kind: ToastKind; title: string; description?: string };
type Ctx = { push: (kind: ToastKind, title: string, description?: string) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const c = useContext(ToastCtx);
  if (!c) {
    return {
      push: (_k: ToastKind, _t: string) => {},
    };
  }
  return c;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, kind, title, description }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  const remove = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  const config: Record<ToastKind, { icon: typeof CheckCircle2; color: string; bg: string }> = {
    success: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    error: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
    warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  };

  const { icon: Icon, color, bg } = config[toast.kind];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${bg} p-4 shadow-card-hover backdrop-blur-sm transition-all duration-300 ${
        show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
      }`}
    >
      <Icon size={18} className={`${color} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs text-ink-600">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-ink-400 hover:text-ink-700 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
