import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
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

  // Status breakdowns
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
      >
        <DateRangeBar />
      </PageHeader>

      {/* Comparison chart */}
      <div className="card p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Daily Activity (All)</h3>
        {comparisonData.length > 0 ? (
          <ActivityLineChart
            data={comparisonData}
            series={Object.keys(comparisonData[0])
              .filter((k) => k !== "date")
              .map((k) => ({
                dataKey: k,
                name: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              }))}
            height={320}
          />
        ) : (
          <p className="text-sm text-gray-400">No data in range</p>
        )}
      </div>

      {/* Status breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <BreakdownCard
          title="LinkedIn Outreach Status"
          data={linkedinByStatus.map((b) => ({ name: formatLabel(b.status), value: b._count }))}
        />
        <BreakdownCard
          title="Instagram DM Status"
          data={igByStatus.map((b) => ({ name: formatLabel(b.status), value: b._count }))}
        />
        <BreakdownCard
          title="Email Status"
          data={emailByStatus.map((b) => ({ name: formatLabel(b.status), value: b._count }))}
        />
        <BreakdownCard
          title="Cold Call Outcomes"
          data={callByOutcome.map((b) => ({ name: formatLabel(b.outcome), value: b._count }))}
        />
        <BreakdownCard
          title="Zoom Meeting Status"
          data={zoomByStatus.map((b) => ({ name: formatLabel(b.status), value: b._count }))}
        />
        <BreakdownCard
          title="Leads by Status"
          data={leadByStatus.map((b) => ({ name: formatLabel(b.status), value: b._count }))}
        />
      </div>

      {/* Per-employee detailed */}
      {employeeStats.map(({ employee, timeseries }) => (
        <div key={employee.id} className="card p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">{employee.name}</h3>
          <p className="text-xs text-gray-500 mb-4">{formatLabel(employee.role)}</p>
          {employee.role === "social_media" ? (
            <ActivityBarChart
              data={timeseries}
              series={[
                { dataKey: "linkedin_posts", name: "LinkedIn Posts" },
                { dataKey: "linkedin_outreach", name: "LinkedIn Outreach" },
                { dataKey: "instagram_posts", name: "IG Posts" },
                { dataKey: "instagram_outreach", name: "IG DMs" },
                { dataKey: "emails", name: "Emails" },
              ]}
            />
          ) : (
            <ActivityBarChart
              data={timeseries}
              series={[
                { dataKey: "cold_calls", name: "Cold Calls" },
                { dataKey: "zoom_meetings", name: "Zoom Meetings" },
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
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  return (
    <div className="card p-5">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      <StatusPieChart data={data} />
    </div>
  );
}
