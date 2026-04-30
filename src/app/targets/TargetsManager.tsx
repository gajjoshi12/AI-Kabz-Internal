"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Target as TargetIcon } from "lucide-react";
import { formatLabel } from "@/lib/utils";
import { useToast } from "@/components/Toast";

type Employee = { id: string; name: string; role: string };
type Target = {
  id: string;
  employeeId: string;
  metric: string;
  period: string;
  targetValue: number;
  employee?: Employee;
};

type Props = {
  employees: Employee[];
  metricOptions: { value: string; label: string }[];
  periodOptions: { value: string; label: string }[];
};

export function TargetsManager({ employees, metricOptions, periodOptions }: Props) {
  const toast = useToast();
  const [targets, setTargets] = useState<Target[]>([]);
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || "");
  const [metric, setMetric] = useState(metricOptions[0]?.value || "");
  const [period, setPeriod] = useState("daily");
  const [targetValue, setTargetValue] = useState(10);

  const fetchTargets = async () => {
    const res = await fetch("/api/targets");
    if (res.ok) setTargets(await res.json());
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, metric, period, targetValue }),
    });
    if (res.ok) {
      fetchTargets();
      toast.push("success", "Target saved");
    } else {
      toast.push("error", "Couldn't save target");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this target?")) return;
    const res = await fetch(`/api/targets/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchTargets();
      toast.push("success", "Target deleted");
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-5 border-b border-ink-100 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
          <TargetIcon size={16} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-base font-bold text-ink-900 tracking-tight">Manage Targets</h3>
          <p className="text-xs text-ink-500">Set how much each designation should hit per metric and period.</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="p-5 grid grid-cols-1 md:grid-cols-5 gap-3 bg-ink-50/30">
        <select
          className="input"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          required
        >
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          required
        >
          {metricOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          required
        >
          {periodOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="input"
          value={targetValue}
          onChange={(e) => setTargetValue(Number(e.target.value))}
          min={0}
          required
          placeholder="Target value"
        />
        <button type="submit" className="btn-primary">
          <Plus size={14} />
          Set Target
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">Designation</th>
              <th className="table-th">Metric</th>
              <th className="table-th">Period</th>
              <th className="table-th">Target</th>
              <th className="table-th text-right pr-5"></th>
            </tr>
          </thead>
          <tbody>
            {targets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-ink-400">
                  No targets configured yet
                </td>
              </tr>
            ) : (
              targets.map((t) => (
                <tr key={t.id} className="table-row group">
                  <td className="table-td font-semibold text-ink-900">{t.employee?.name}</td>
                  <td className="table-td">{formatLabel(t.metric)}</td>
                  <td className="table-td">
                    <span className="badge bg-ink-50 text-ink-700 border-ink-200 capitalize">
                      {t.period}
                    </span>
                  </td>
                  <td className="table-td font-bold text-ink-900 tabular-nums">{t.targetValue}</td>
                  <td className="table-td text-right pr-5">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 rounded-md text-ink-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
