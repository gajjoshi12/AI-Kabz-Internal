"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { formatLabel } from "@/lib/utils";

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
    await fetch("/api/targets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, metric, period, targetValue }),
    });
    fetchTargets();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/targets/${id}`, { method: "DELETE" });
    fetchTargets();
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Targets</h3>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
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
          Set Target
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-th">Designation</th>
              <th className="table-th">Metric</th>
              <th className="table-th">Period</th>
              <th className="table-th">Target</th>
              <th className="table-th text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {targets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">
                  No targets configured
                </td>
              </tr>
            )}
            {targets.map((t) => (
              <tr key={t.id} className="table-row">
                <td className="table-td">{t.employee?.name}</td>
                <td className="table-td">{formatLabel(t.metric)}</td>
                <td className="table-td capitalize">{t.period}</td>
                <td className="table-td font-semibold">{t.targetValue}</td>
                <td className="table-td text-right">
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
