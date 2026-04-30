"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  onConfirm,
  label = "Delete",
}: {
  onConfirm: () => Promise<void> | void;
  label?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="text-gray-400 hover:text-red-600 p-1 rounded-md"
        title={label}
      >
        <Trash2 size={16} />
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => start(async () => onConfirm())}
        disabled={pending}
        className="text-xs px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "..." : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="text-xs px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100"
      >
        Cancel
      </button>
    </div>
  );
}
