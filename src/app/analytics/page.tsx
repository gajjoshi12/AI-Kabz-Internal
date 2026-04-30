import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { AutoRefresh } from "@/components/AutoRefresh";
import { prisma } from "@/lib/db";
import { getDateRange, formatLabel } from "@/lib/utils";
import { getEmployeeStats, getDailyTimeSeries } from "@/lib/stats";
import {
  ActivityLineChart,
  ActivityBarChart,
  StatusPieChart,
} from "@/components/Charts";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = getDateRange(sp.range || "last30");
  const employees = await prisma.employee.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const linkedinByStatus = await prisma.linkedInOutreach.groupBy({
    by: ["status"],
    _count: true,
    where: { date: { gte: range.from, lte: range.to } },
  });
  const igByStatus = await prisma.instagramOutreach.groupBy({
    by: ["status"],
    _count: true,
    where: { date: { gte: range.from, lte: range.to } },
  });
  const emailByStatus = await prisma.email.groupBy({
    by: ["status"],
    _count: true,
    where: { date: { gte: range.from, lte: range.to } },
  });
  const callByOutcome = await prisma.coldCall.groupBy({
    by: ["outcome"],
    _count: true,
    where: { date: { gte: range.from, lte: range.to } },
  });
  const zoomByStatus = await prisma.zoomMeeting.groupBy({
    by: ["status"],
    _count: true,
    where: { scheduledAt: { gte: range.from, lte: range.to } },
  });
  const leadByStatus = await prisma.lead.groupBy({
    by: ["status"],
    _count: true,
    where: { date: { gte: range.from, lte: range.to } },
  });

  const employeeStats = await Promise.all(
    employees.map(async (e) => ({
      employee: e,
      stats: await getEmployeeStats(e.id, range),
      timeseries: await getDailyTimeSeries(e.id, range),
    }))
  );

  const comparisonData = employeeStats.length
    ? employeeStats[0].timeseries.map((_, i) => {
        const row: Record<string, unknown> = { date: employeeStats[0].timeseries[i].date };
        for (const e of employeeStats) {
          const ts = e.timeseries[i];
          if (e.employee.role === "social_media") {
            row[`${e.employee.name}_outreach`] =
              ts.linkedin_outreach + ts.instagram_outreach + ts.emails;
            row[`${e.employee.name}_posts`] = ts.linkedin_posts + ts.instagram_posts;
          } else {
            row[`${e.employee.name}_calls`] = ts.cold_calls;
            row[`${e.employee.name}_meetings`] = ts.zoom_meetings;
          }
        }
        return row;
      })
    : [];

  return (
    <AppShell>
      <PageHeader
        title="Analytics"
        description={`Deep dive into team performance — ${range.label}`}
        eyebrow="Insights"
      >
        <DateRangeBar />
        <AutoRefresh />
      </PageHeader>

      {/* Comparison */}
      <div className="card p-6 md:p-7 mb-6">
        <div className="mb-5">
          <h3 className="text-base font-bold text-ink-900 tracking-tight">
            Daily Activity — All Designations
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Side-by-side comparison of every channel
          </p>
        </div>
        {comparisonData.length > 0 ? (
          <ActivityLineChart
            data={comparisonData}
            series={Object.keys(comparisonData[0])
              .filter((k) => k !== "date")
              .map((k) => ({
                dataKey: k,
                name: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              }))}
            height={340}
          />
        ) : (
          <p className="text-sm text-ink-400 text-center py-12">No data in range</p>
        )}
      </div>

      {/* Status breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <BreakdownCard
          title="LinkedIn Outreach"
          subtitle="Status breakdown"
          data={linkedinByStatus.map((b) => ({ name: formatLabel(b.status), value: b._count }))}
        />
        <BreakdownCard
          title="Instagram DMs"
          subtitle="Reply status"
          data={igByStatus.map((b) => ({ name: formatLabel(b.status), value: b._count }))}
        />
        <BreakdownCard
          title="Emails"
          subtitle="Status breakdown"
          data={emailByStatus.map((b) => ({ name: formatLabel(b.status), value: b._count }))}
        />
        <BreakdownCard
          title="Cold Calls"
          subtitle="Outcomes"
          data={callByOutcome.map((b) => ({ name: formatLabel(b.outcome), value: b._count }))}
        />
        <BreakdownCard
          title="Zoom Meetings"
          subtitle="Status"
          data={zoomByStatus.map((b) => ({ name: formatLabel(b.status), value: b._count }))}
        />
        <BreakdownCard
          title="Leads"
          subtitle="Pipeline status"
          data={leadByStatus.map((b) => ({ name: formatLabel(b.status), value: b._count }))}
        />
      </div>

      {/* Per-designation detailed */}
      {employeeStats.map(({ employee, timeseries }) => (
        <div key={employee.id} className="card p-6 md:p-7 mb-6">
          <div className="mb-5">
            <h3 className="text-base font-bold text-ink-900 tracking-tight">{employee.name}</h3>
            <p className="text-xs text-ink-500 mt-0.5">{formatLabel(employee.role)}</p>
          </div>
          {employee.role === "social_media" ? (
            <ActivityBarChart
              data={timeseries}
              series={[
                { dataKey: "linkedin_posts", name: "LinkedIn Posts", color: "#0ea5e9" },
                { dataKey: "linkedin_outreach", name: "LinkedIn Outreach", color: "#3b82f6" },
                { dataKey: "instagram_posts", name: "IG Posts", color: "#ec4899" },
                { dataKey: "instagram_outreach", name: "IG DMs", color: "#f43f5e" },
                { dataKey: "emails", name: "Emails", color: "#f59e0b" },
              ]}
            />
          ) : (
            <ActivityBarChart
              data={timeseries}
              series={[
                { dataKey: "cold_calls", name: "Cold Calls", color: "#10b981" },
                { dataKey: "zoom_meetings", name: "Zoom Meetings", color: "#a855f7" },
              ]}
            />
          )}
        </div>
      ))}
    </AppShell>
  );
}

function BreakdownCard({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: { name: string; value: number }[];
}) {
  return (
    <div className="card p-5">
      <div className="mb-1">
        <h4 className="text-sm font-bold text-ink-900 tracking-tight">{title}</h4>
        <p className="text-[11px] text-ink-500">{subtitle}</p>
      </div>
      <StatusPieChart data={data} />
    </div>
  );
}
