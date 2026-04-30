"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from "recharts";

const COLORS = [
  "#7c3aed", // brand
  "#ec4899", // pink
  "#10b981", // emerald
  "#f59e0b", // amber
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#ef4444", // red
];

type Series = { dataKey: string; name: string; color?: string };

const tooltipStyle = {
  background: "rgba(255,255,255,0.96)",
  border: "1px solid rgb(226 232 240)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 10px 24px -4px rgb(15 23 42 / 0.12)",
  padding: "10px 14px",
};

const axisStyle = { fontSize: 11, fill: "#94a3b8", fontWeight: 500 };

export function ActivityLineChart({
  data,
  series,
  height = 300,
}: {
  data: Record<string, unknown>[];
  series: Series[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <defs>
          {series.map((s, i) => {
            const color = s.color || COLORS[i % COLORS.length];
            return (
              <linearGradient key={s.dataKey} id={`grad-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#cbd5e1", strokeDasharray: 4 }} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          iconType="circle"
          iconSize={8}
        />
        {series.map((s, i) => {
          const color = s.color || COLORS[i % COLORS.length];
          return (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#grad-${s.dataKey})`}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ActivityBarChart({
  data,
  series,
  height = 300,
}: {
  data: Record<string, unknown>[];
  series: Series[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(124,58,237,0.04)" }} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          iconType="circle"
          iconSize={8}
        />
        {series.map((s, i) => (
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name}
            fill={s.color || COLORS[i % COLORS.length]}
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({
  data,
  height = 240,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-ink-400" style={{ height }}>
        No data yet
      </div>
    );
  }
  const total = filtered.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            stroke="none"
          >
            {filtered.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="circle"
            iconSize={7}
          />
        </PieChart>
      </ResponsiveContainer>
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
        style={{ top: height / 2 - 30 }}
      >
        <div className="text-2xl font-bold text-ink-900 tabular-nums">{total}</div>
        <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">Total</div>
      </div>
    </div>
  );
}
