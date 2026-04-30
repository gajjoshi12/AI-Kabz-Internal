import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { AutoRefresh } from "@/components/AutoRefresh";
import { prisma } from "@/lib/db";
import { getDateRange, formatLabel } from "@/lib/utils";
import { getTargetProgress } from "@/lib/stats";
import { TargetsManager } from "./TargetsManager";

export const dynamic = "force-dynamic";

const METRIC_OPTIONS = [
  { value: "linkedin_posts", label: "LinkedIn Posts" },
  { value: "linkedin_outreach", label: "LinkedIn Outreach" },
  { value: "instagram_posts", label: "Instagram Posts" },
  { value: "instagram_outreach", label: "Instagram DMs" },
  { value: "emails", label: "Emails" },
  { value: "leads_provided", label: "Leads Provided" },
  { value: "cold_calls", label: "Cold Calls" },
  { value: "zoom_meetings", label: "Zoom Meetings" },
];

const PERIOD_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = getDateRange(sp.range || "last7");
  const employees = await prisma.employee.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const progress = await Promise.all(
    employees.map(async (e) => ({
      employee: e,
      targets: await getTargetProgress(e.id, range),
    }))
  );

  return (
    <AppShell>
      <PageHeader
        title="Targets & Goals"
        description={`Set targets per metric and watch progress fill up — ${range.label}.`}
        eyebrow="Goals"
      >
        <DateRangeBar />
        <AutoRefresh />
      </PageHeader>

      {/* Progress overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {progress.map(({ employee, targets }) => {
          const initial = employee.name.charAt(0).toUpperCase();
          const gradient =
            employee.role === "social_media"
              ? "from-sky-500 via-blue-500 to-indigo-500"
              : "from-emerald-500 via-teal-500 to-cyan-500";
          return (
            <div key={employee.id} className="card overflow-hidden">
              <div className="relative p-5 border-b border-ink-100">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.04] pointer-events-none`}
                />
                <div className="relative flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold shadow-soft`}
                  >
                    {initial}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink-900 tracking-tight">{employee.name}</h3>
                    <p className="text-xs text-ink-500">{formatLabel(employee.role)}</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {targets.length === 0 ? (
                  <p className="text-sm text-ink-400 text-center py-6">
                    No targets set yet — add some below.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {targets.map((t) => (
                      <div key={t.id}>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-ink-700">
                            {formatLabel(t.metric)}
                          </span>
                          <span className="text-ink-500 tabular-nums">
                            <span className="font-bold text-ink-900">{t.actual}</span>
                            <span className="text-ink-300 mx-1">/</span>
                            {t.expectedGoal}
                            <span className="ml-1.5 text-[10px] font-bold uppercase">
                              {t.percent}%
                            </span>
                          </span>
                        </div>
                        <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              t.percent >= 100
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                : t.percent >= 60
                                ? "bg-gradient-to-r from-brand-500 to-fuchsia-500"
                                : t.percent >= 30
                                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                : "bg-gradient-to-r from-rose-500 to-red-500"
                            }`}
                            style={{ width: `${Math.max(2, t.percent)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-ink-400 mt-1 font-medium uppercase tracking-wider">
                          {t.targetValue} per {t.period}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TargetsManager
        employees={employees.map((e) => ({ id: e.id, name: e.name, role: e.role }))}
        metricOptions={METRIC_OPTIONS}
        periodOptions={PERIOD_OPTIONS}
      />
    </AppShell>
  );
}
