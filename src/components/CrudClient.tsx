"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Download, Edit2, Trash2, Inbox, Search } from "lucide-react";
import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";
import { TableSkeleton } from "./Skeleton";
import { useToast } from "./Toast";
import { formatDateTime, formatDate } from "@/lib/utils";

export type Field = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "datetime-local"
    | "date"
    | "select"
    | "url"
    | "email";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
  full?: boolean;
};

export type Column = {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
  width?: string;
};

type Props = {
  endpoint: string;
  exportEntity?: string;
  columns: Column[];
  fields: Field[];
  title?: string;
  description?: string;
  filters?: { name: string; label: string; options: { value: string; label: string }[] }[];
  employees?: { id: string; name: string; role: string }[];
  defaultEmployeeRole?: string;
  initial?: Record<string, unknown>[];
  searchKeys?: string[];
};

export function CrudClient({
  endpoint,
  exportEntity,
  columns,
  fields,
  filters = [],
  employees,
  defaultEmployeeRole,
  initial = [],
  searchKeys = [],
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const toast = useToast();

  const [items, setItems] = useState<Record<string, unknown>[]>(initial);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const range = sp.get("range") || "last7";
  const employeeFilter = sp.get("employeeId") || "";
  const statusFilter = sp.get("status") || "";

  const enhancedFields = fields.map((f) => {
    if (f.name === "employeeId" && employees) {
      const filtered = defaultEmployeeRole
        ? employees.filter((e) => e.role === defaultEmployeeRole)
        : employees;
      return {
        ...f,
        options: filtered.map((e) => ({ value: e.id, label: e.name })),
      };
    }
    return f;
  });

  const fetchItems = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("range", range);
    if (employeeFilter) params.set("employeeId", employeeFilter);
    if (statusFilter) params.set("status", statusFilter);
    try {
      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (res.ok) setItems(await res.json());
    } catch {
      toast.push("error", "Failed to load", "Check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, employeeFilter, statusFilter]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    const url = editing ? `${endpoint}/${editing.id}` : endpoint;
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setModalOpen(false);
      setEditing(null);
      fetchItems();
      toast.push("success", editing ? "Entry updated" : "Entry added", "Changes saved successfully.");
    } else {
      const err = await res.json().catch(() => ({}));
      toast.push("error", "Couldn't save", err.error || "Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchItems();
      toast.push("success", "Entry deleted");
    } else {
      toast.push("error", "Couldn't delete");
    }
  };

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const handleExport = () => {
    if (!exportEntity) return;
    const params = new URLSearchParams();
    params.set("entity", exportEntity);
    params.set("range", range);
    if (employeeFilter) params.set("employeeId", employeeFilter);
    window.location.href = `/api/export?${params.toString()}`;
  };

  // Client-side text search filter
  const visible = items.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const keys = searchKeys.length ? searchKeys : Object.keys(row);
    return keys.some((k) => {
      const v = row[k];
      if (v === null || v === undefined) return false;
      return String(v).toLowerCase().includes(q);
    });
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm pl-9 w-56"
          />
        </div>

        {employees && employees.length > 0 && (
          <select
            className="input input-sm w-auto"
            value={employeeFilter}
            onChange={(e) => setFilter("employeeId", e.target.value)}
          >
            <option value="">All designations</option>
            {(defaultEmployeeRole
              ? employees.filter((e) => e.role === defaultEmployeeRole)
              : employees
            ).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        )}
        {filters.map((f) => (
          <select
            key={f.name}
            className="input input-sm w-auto"
            value={sp.get(f.name) || ""}
            onChange={(e) => setFilter(f.name, e.target.value)}
          >
            <option value="">All {f.label.toLowerCase()}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}

        <div className="ml-auto flex gap-2">
          {exportEntity && (
            <button onClick={handleExport} className="btn-secondary btn-sm">
              <Download size={14} />
              Export
            </button>
          )}
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="btn-primary btn-sm"
          >
            <Plus size={14} />
            New entry
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading && items.length === 0 ? (
            <TableSkeleton rows={6} cols={Math.min(columns.length + 1, 7)} />
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="table-th first:rounded-tl-2xl" style={c.width ? { width: c.width } : undefined}>
                      {c.label}
                    </th>
                  ))}
                  <th className="table-th text-right pr-5 last:rounded-tr-2xl">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-fuchsia-50 flex items-center justify-center">
                          <Inbox size={22} className="text-brand-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-900">
                            {search || employeeFilter || statusFilter
                              ? "No matches"
                              : "No entries yet"}
                          </p>
                          <p className="text-xs text-ink-500 mt-0.5">
                            {search || employeeFilter || statusFilter
                              ? "Try changing your filters."
                              : "Click \"New entry\" to add your first."}
                          </p>
                        </div>
                        {!search && !employeeFilter && !statusFilter && (
                          <button
                            onClick={() => {
                              setEditing(null);
                              setModalOpen(true);
                            }}
                            className="btn-primary btn-sm mt-1"
                          >
                            <Plus size={14} />
                            New entry
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  visible.map((row) => (
                    <tr key={String(row.id)} className="table-row group">
                      {columns.map((c) => (
                        <td key={c.key} className="table-td">
                          {c.render ? c.render(row) : renderCell(row[c.key])}
                        </td>
                      ))}
                      <td className="table-td text-right whitespace-nowrap pr-5">
                        <div className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditing(row);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-md text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(String(row.id))}
                            className="p-1.5 rounded-md text-ink-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {visible.length > 0 && (
          <div className="px-5 py-3 text-xs font-medium text-ink-500 border-t border-ink-100 bg-ink-50/40 flex items-center justify-between">
            <span>
              Showing <span className="font-semibold text-ink-700">{visible.length}</span>{" "}
              {visible.length === 1 ? "entry" : "entries"}
            </span>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Entry" : "New Entry"}
        description={editing ? "Update the details below." : "Fill in the details and click Save."}
        maxWidth="max-w-2xl"
      >
        <CrudForm
          fields={enhancedFields}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}

function renderCell(value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "")
    return <span className="text-ink-300">—</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return formatDateTime(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value))
    return formatDateTime(value);
  return String(value);
}

function CrudForm({
  fields,
  initial,
  onSubmit,
  onCancel,
}: {
  fields: Field[];
  initial: Record<string, unknown> | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}) {
  const [data, setData] = useState<Record<string, unknown>>(() => {
    const d: Record<string, unknown> = {};
    const localNow = () => {
      const dt = new Date();
      return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    };
    for (const f of fields) {
      if (initial && f.name in initial) {
        const v = initial[f.name];
        if ((f.type === "datetime-local" || f.type === "date") && v) {
          const dt = new Date(v as string);
          d[f.name] =
            f.type === "date"
              ? dt.toISOString().slice(0, 10)
              : new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
                  .toISOString()
                  .slice(0, 16);
        } else {
          d[f.name] = v ?? "";
        }
      } else if (f.type === "datetime-local" && !f.defaultValue) {
        d[f.name] = localNow();
      } else if (f.type === "date" && !f.defaultValue) {
        d[f.name] = new Date().toISOString().slice(0, 10);
      } else {
        d[f.name] = f.defaultValue ?? "";
      }
    }
    return d;
  });
  const [saving, setSaving] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
            <label className="label">
              {f.label}
              {f.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                className="input min-h-[88px]"
                value={String(data[f.name] ?? "")}
                onChange={(e) => setData({ ...data, [f.name]: e.target.value })}
                required={f.required}
                placeholder={f.placeholder}
              />
            ) : f.type === "select" ? (
              <select
                className="input"
                value={String(data[f.name] ?? "")}
                onChange={(e) => setData({ ...data, [f.name]: e.target.value })}
                required={f.required}
              >
                <option value="">— select —</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type}
                className="input"
                value={String(data[f.name] ?? "")}
                onChange={(e) => setData({ ...data, [f.name]: e.target.value })}
                required={f.required}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-ink-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save Entry"}
        </button>
      </div>
    </form>
  );
}

export const renderHelpers = {
  date: (v: unknown) => (v ? formatDate(v as string | Date) : <span className="text-ink-300">—</span>),
  datetime: (v: unknown) =>
    v ? formatDateTime(v as string | Date) : <span className="text-ink-300">—</span>,
  status: (v: unknown) => <StatusBadge status={v as string} />,
  link: (v: unknown) =>
    v ? (
      <a
        href={v as string}
        target="_blank"
        rel="noreferrer"
        className="text-brand-600 hover:text-brand-700 hover:underline truncate inline-block max-w-[180px] font-medium"
      >
        {(v as string).replace(/^https?:\/\//, "")}
      </a>
    ) : (
      <span className="text-ink-300">—</span>
    ),
  truncate: (v: unknown, max = 60) => {
    const s = String(v ?? "");
    if (!s) return <span className="text-ink-300">—</span>;
    return s.length > max ? <span title={s}>{s.slice(0, max)}…</span> : <>{s}</>;
  },
};
