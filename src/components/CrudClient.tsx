"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, Download, Edit2, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";
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
  endpoint: string; // e.g. /api/linkedin-posts
  exportEntity?: string; // for /api/export?entity=
  columns: Column[];
  fields: Field[];
  title: string;
  description?: string;
  filters?: { name: string; label: string; options: { value: string; label: string }[] }[];
  employees?: { id: string; name: string; role: string }[];
  defaultEmployeeRole?: string;
  initial?: Record<string, unknown>[];
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
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const [items, setItems] = useState<Record<string, unknown>[]>(initial);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [, startTransition] = useTransition();

  const range = sp.get("range") || "last7";
  const employeeFilter = sp.get("employeeId") || "";
  const statusFilter = sp.get("status") || "";

  // Build employee field options if needed
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
    const res = await fetch(`${endpoint}?${params.toString()}`);
    if (res.ok) setItems(await res.json());
    setLoading(false);
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
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) fetchItems();
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

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {employees && employees.length > 0 && (
          <select
            className="input w-auto text-sm"
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
            className="input w-auto text-sm"
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
            <button onClick={handleExport} className="btn-secondary">
              <Download size={16} />
              Export CSV
            </button>
          )}
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={16} />
            Add Entry
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="table-th" style={c.width ? { width: c.width } : undefined}>
                    {c.label}
                  </th>
                ))}
                <th className="table-th text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-400">
                    No entries yet. Click <span className="font-medium">Add Entry</span> to get started.
                  </td>
                </tr>
              )}
              {items.map((row) => (
                <tr key={String(row.id)} className="table-row">
                  {columns.map((c) => (
                    <td key={c.key} className="table-td">
                      {c.render ? c.render(row) : (renderCell(row[c.key]))}
                    </td>
                  ))}
                  <td className="table-td text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditing(row);
                        setModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-brand-600 p-1"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(String(row.id))}
                      className="text-gray-400 hover:text-red-600 p-1 ml-1"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length > 0 && (
          <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
            {items.length} entries
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
  if (value === null || value === undefined || value === "") return <span className="text-gray-300">—</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return formatDateTime(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatDateTime(value);
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
    <form onSubmit={handle} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.name} className={f.full ? "sm:col-span-2" : ""}>
            <label className="label">
              {f.label}
              {f.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                className="input min-h-[80px]"
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
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

export const renderHelpers = {
  date: (v: unknown) => (v ? formatDate(v as string | Date) : "—"),
  datetime: (v: unknown) => (v ? formatDateTime(v as string | Date) : "—"),
  status: (v: unknown) => <StatusBadge status={v as string} />,
  link: (v: unknown) =>
    v ? (
      <a
        href={v as string}
        target="_blank"
        rel="noreferrer"
        className="text-brand-600 hover:underline truncate block max-w-[200px]"
      >
        {v as string}
      </a>
    ) : (
      <span className="text-gray-300">—</span>
    ),
  truncate: (v: unknown, max = 60) => {
    const s = String(v ?? "");
    return s.length > max ? <span title={s}>{s.slice(0, max)}…</span> : <>{s || "—"}</>;
  },
};
