import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
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
        description={`Set targets per metric, per period — track progress over ${range.label}.`}
      >
        <DateRangeBar />
      </PageHeader>

      {/* Progress overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {progress.map(({ employee, targets }) => (
          <div key={employee.id} className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{employee.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{formatLabel(employee.role)}</p>
            {targets.length === 0 ? (
              <p className="text-sm text-gray-400">
                No targets set yet. Add some below.
              </p>
            ) : (
              <div className="space-y-3">
                {targets.map((t) => (
                  <div key={t.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {formatLabel(t.metric)}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {t.actual} / {t.expectedGoal}
                        <span className="ml-1 text-gray-400">({t.percent}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          t.percent >= 100
                            ? "bg-emerald-500"
                            : t.percent >= 60
                            ? "bg-brand-500"
                            : t.percent >= 30
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${t.percent}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {t.targetValue} per {t.period}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <TargetsManager
        employees={employees.map((e) => ({ id: e.id, name: e.name, role: e.role }))}
        metricOptions={METRIC_OPTIONS}
        periodOptions={PERIOD_OPTIONS}
      />
    </AppShell>
  );
}
