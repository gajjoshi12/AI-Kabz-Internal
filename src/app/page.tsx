import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { StatCard } from "@/components/StatCard";
import { prisma } from "@/lib/db";
import { getDateRange, formatLabel } from "@/lib/utils";
import {
  getOverviewStats,
  getDailyTimeSeries,
  getTargetProgress,
} from "@/lib/stats";
import {
  Linkedin,
  Instagram,
  Mail,
  Phone,
  Video,
  Users,
  Target as TargetIcon,
  TrendingUp,
} from "lucide-react";
import { ActivityLineChart } from "@/components/Charts";
import { AutoRefresh } from "@/components/AutoRefresh";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = getDateRange(sp.range || "last7");
  const overview = await getOverviewStats(range);

  const social = overview.find((o) => o.employee.role === "social_media");
  const caller = overview.find((o) => o.employee.role === "caller");

  // build combined time series for both
  const series: Record<string, unknown>[] = [];
  if (social) {
    const socialTs = await getDailyTimeSeries(social.employee.id, range);
    socialTs.forEach((d, i) => {
      series[i] = {
        date: d.date,
        social_posts: d.linkedin_posts + d.instagram_posts,
        social_outreach: d.linkedin_outreach + d.instagram_outreach + d.emails,
      };
    });
  }
  if (caller) {
    const callerTs = await getDailyTimeSeries(caller.employee.id, range);
    callerTs.forEach((d, i) => {
      series[i] = {
        ...(series[i] || { date: d.date, social_posts: 0, social_outreach: 0 }),
        cold_calls: d.cold_calls,
        zoom_meetings: d.zoom_meetings,
      };
    });
  }

  const totalLeads = await prisma.lead.count({
    where: { date: { gte: range.from, lte: range.to } },
  });
  const convertedLeads = await prisma.lead.count({
    where: { date: { gte: range.from, lte: range.to }, status: "converted" },
  });

  const socialTargets = social ? await getTargetProgress(social.employee.id, range) : [];
  const callerTargets = caller ? await getTargetProgress(caller.employee.id, range) : [];

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description={`Overview of team activity — ${range.label}`}
      >
        <DateRangeBar />
        <AutoRefresh />
      </PageHeader>

      {!social && !caller ? (
        <div className="card p-8 text-center">
          <p className="text-gray-600 mb-4">
            Welcome! Add your first designations to begin tracking.
          </p>
          <Link href="/employees" className="btn-primary inline-flex">
            Add Designations
          </Link>
        </div>
      ) : (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Leads Generated"
              value={totalLeads}
              icon={Users}
              color="indigo"
              hint={`${convertedLeads} converted`}
            />
            <StatCard
              label="LinkedIn Reach"
              value={(social?.stats.linkedinPosts || 0) + (social?.stats.linkedinOutreach || 0)}
              icon={Linkedin}
              color="sky"
              hint={`${social?.stats.linkedinPosts || 0} posts · ${
                social?.stats.linkedinOutreach || 0
              } outreach`}
            />
            <StatCard
              label="Cold Calls"
              value={caller?.stats.coldCalls || 0}
              icon={Phone}
              color="emerald"
              hint={`${caller?.stats.coldCallsConnected || 0} connected · ${
                caller?.stats.coldCallsInterested || 0
              } interested`}
            />
            <StatCard
              label="Zoom Meetings"
              value={caller?.stats.zoomMeetings || 0}
              icon={Video}
              color="purple"
              hint={`${caller?.stats.zoomCompleted || 0} completed`}
            />
          </div>

          {/* Per-employee panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {social && (
              <EmployeePanel
                title={social.employee.name}
                role="Social Media · Lead Gen"
                stats={[
                  {
                    label: "LinkedIn Posts",
                    value: social.stats.linkedinPosts,
                    icon: Linkedin,
                    color: "sky" as const,
                  },
                  {
                    label: "LinkedIn Outreach",
                    value: social.stats.linkedinOutreach,
                    icon: Linkedin,
                    color: "sky" as const,
                    hint: `${social.stats.linkedinReplied} replied · ${social.stats.linkedinInterested} interested`,
                  },
                  {
                    label: "Instagram Posts",
                    value: social.stats.instagramPosts,
                    icon: Instagram,
                    color: "rose" as const,
                  },
                  {
                    label: "Instagram DMs",
                    value: social.stats.instagramOutreach,
                    icon: Instagram,
                    color: "rose" as const,
                    hint: `${social.stats.instagramInterested} interested`,
                  },
                  {
                    label: "Emails Sent",
                    value: social.stats.emails,
                    icon: Mail,
                    color: "amber" as const,
                    hint: `${social.stats.emailsReplied} replied · ${social.stats.emailsInterested} interested`,
                  },
                  {
                    label: "Leads Provided",
                    value: social.stats.leadsProvided,
                    icon: Users,
                    color: "indigo" as const,
                  },
                ]}
                targets={socialTargets}
              />
            )}
            {caller && (
              <EmployeePanel
                title={caller.employee.name}
                role="Cold Caller · Closer"
                stats={[
                  {
                    label: "Cold Calls",
                    value: caller.stats.coldCalls,
                    icon: Phone,
                    color: "emerald" as const,
                  },
                  {
                    label: "Connected",
                    value: caller.stats.coldCallsConnected,
                    icon: Phone,
                    color: "emerald" as const,
                  },
                  {
                    label: "Interested Leads",
                    value: caller.stats.coldCallsInterested,
                    icon: TrendingUp,
                    color: "indigo" as const,
                  },
                  {
                    label: "Zoom Meetings",
                    value: caller.stats.zoomMeetings,
                    icon: Video,
                    color: "purple" as const,
                  },
                  {
                    label: "Meetings Completed",
                    value: caller.stats.zoomCompleted,
                    icon: Video,
                    color: "purple" as const,
                  },
                ]}
                targets={callerTargets}
              />
            )}
          </div>

          {/* Activity Chart */}
          {series.length > 0 && (
            <div className="card p-6 mb-8">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Daily Activity Trend
              </h3>
              <ActivityLineChart
                data={series}
                series={[
                  { dataKey: "social_posts", name: "Social Posts" },
                  { dataKey: "social_outreach", name: "Outreach + Emails" },
                  { dataKey: "cold_calls", name: "Cold Calls" },
                  { dataKey: "zoom_meetings", name: "Zoom Meetings" },
                ]}
              />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

type Stat = {
  label: string;
  value: number;
  icon: typeof Linkedin;
  color: "indigo" | "emerald" | "rose" | "amber" | "sky" | "purple" | "slate";
  hint?: string;
};

function EmployeePanel({
  title,
  role,
  stats,
  targets,
}: {
  title: string;
  role: string;
  stats: Stat[];
  targets: Array<{ metric: string; actual: number; expectedGoal: number; percent: number; period: string }>;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Icon size={14} />
                {s.label}
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
              {s.hint && <p className="text-[11px] text-gray-400 mt-0.5">{s.hint}</p>}
            </div>
          );
        })}
      </div>

      {targets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <TargetIcon size={12} />
            Target Progress
          </div>
          <div className="space-y-2">
            {targets.map((t) => (
              <div key={t.metric}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-700">{formatLabel(t.metric)}</span>
                  <span className="text-gray-500">
                    {t.actual} / {t.expectedGoal}
                    <span className="ml-1 text-gray-400">({t.period})</span>
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
