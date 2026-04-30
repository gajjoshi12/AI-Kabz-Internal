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
  Sparkles,
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

  // Build combined time series
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
        description={`Real-time overview of your team's output — ${range.label}`}
        eyebrow="Live"
      >
        <DateRangeBar />
        <AutoRefresh />
      </PageHeader>

      {!social && !caller ? (
        <EmptyState />
      ) : (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Leads"
              value={totalLeads}
              icon={Users}
              color="purple"
              hint={`${convertedLeads} converted`}
              accent
            />
            <StatCard
              label="LinkedIn Activity"
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
              color="fuchsia"
              hint={`${caller?.stats.zoomCompleted || 0} completed`}
            />
          </div>

          {/* Per-designation panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {social && (
              <DesignationPanel
                title={social.employee.name}
                role="Social Media · Lead Gen"
                gradient="from-sky-500 via-blue-500 to-indigo-500"
                stats={[
                  {
                    label: "LinkedIn Posts",
                    value: social.stats.linkedinPosts,
                    icon: Linkedin,
                    tone: "sky",
                  },
                  {
                    label: "LinkedIn Outreach",
                    value: social.stats.linkedinOutreach,
                    icon: Linkedin,
                    tone: "sky",
                    hint: `${social.stats.linkedinReplied} replied · ${social.stats.linkedinInterested} 🔥`,
                  },
                  {
                    label: "Instagram Posts",
                    value: social.stats.instagramPosts,
                    icon: Instagram,
                    tone: "rose",
                  },
                  {
                    label: "Instagram DMs",
                    value: social.stats.instagramOutreach,
                    icon: Instagram,
                    tone: "rose",
                    hint: `${social.stats.instagramInterested} interested`,
                  },
                  {
                    label: "Emails Sent",
                    value: social.stats.emails,
                    icon: Mail,
                    tone: "amber",
                    hint: `${social.stats.emailsReplied} replied · ${social.stats.emailsInterested} 🔥`,
                  },
                  {
                    label: "Leads Provided",
                    value: social.stats.leadsProvided,
                    icon: Users,
                    tone: "purple",
                  },
                ]}
                targets={socialTargets}
              />
            )}
            {caller && (
              <DesignationPanel
                title={caller.employee.name}
                role="Cold Caller · Closer"
                gradient="from-emerald-500 via-teal-500 to-cyan-500"
                stats={[
                  {
                    label: "Cold Calls",
                    value: caller.stats.coldCalls,
                    icon: Phone,
                    tone: "emerald",
                  },
                  {
                    label: "Connected",
                    value: caller.stats.coldCallsConnected,
                    icon: Phone,
                    tone: "emerald",
                  },
                  {
                    label: "Interested",
                    value: caller.stats.coldCallsInterested,
                    icon: TrendingUp,
                    tone: "purple",
                  },
                  {
                    label: "Zoom Meetings",
                    value: caller.stats.zoomMeetings,
                    icon: Video,
                    tone: "fuchsia",
                  },
                  {
                    label: "Completed",
                    value: caller.stats.zoomCompleted,
                    icon: Video,
                    tone: "fuchsia",
                  },
                ]}
                targets={callerTargets}
              />
            )}
          </div>

          {/* Activity Chart */}
          {series.length > 0 && (
            <div className="card p-6 md:p-7">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-ink-900 tracking-tight">
                    Activity Trend
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Daily output across all channels — {range.label.toLowerCase()}
                  </p>
                </div>
              </div>
              <ActivityLineChart
                data={series}
                series={[
                  { dataKey: "social_posts", name: "Social Posts", color: "#0ea5e9" },
                  { dataKey: "social_outreach", name: "Outreach + Emails", color: "#f59e0b" },
                  { dataKey: "cold_calls", name: "Cold Calls", color: "#10b981" },
                  { dataKey: "zoom_meetings", name: "Zoom Meetings", color: "#a855f7" },
                ]}
                height={320}
              />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center bg-gradient-to-br from-white via-brand-50/30 to-fuchsia-50/30">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-glow mb-5">
        <Sparkles size={28} strokeWidth={2.25} />
      </div>
      <h2 className="text-2xl font-bold text-ink-900 tracking-tight">Welcome to AI Kab</h2>
      <p className="mt-2 text-sm text-ink-500 max-w-md mx-auto">
        Add your first designations to start tracking activity. You can add a Social Media person and a Cold Caller — or any roles you want to monitor.
      </p>
      <Link href="/employees" className="btn-primary inline-flex mt-6">
        <Sparkles size={15} />
        Get Started
      </Link>
    </div>
  );
}

type Tone = "indigo" | "emerald" | "rose" | "amber" | "sky" | "purple" | "slate" | "fuchsia";
type Stat = {
  label: string;
  value: number;
  icon: typeof Linkedin;
  tone: Tone;
  hint?: string;
};

const TONE_BG: Record<Tone, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  purple: "bg-purple-50 text-purple-600",
  fuchsia: "bg-fuchsia-50 text-fuchsia-600",
  slate: "bg-slate-50 text-slate-600",
};

function DesignationPanel({
  title,
  role,
  gradient,
  stats,
  targets,
}: {
  title: string;
  role: string;
  gradient: string;
  stats: Stat[];
  targets: Array<{
    metric: string;
    actual: number;
    expectedGoal: number;
    percent: number;
    period: string;
  }>;
}) {
  const initial = title.charAt(0).toUpperCase();

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="relative p-6 border-b border-ink-100">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.04] pointer-events-none`}
        />
        <div className="relative flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-lg font-bold shadow-soft`}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-ink-900 tracking-tight truncate">
              {title}
            </h3>
            <p className="text-xs text-ink-500 font-medium">{role}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-xl border border-ink-100 p-3.5 hover:border-ink-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wider">
                    {s.label}
                  </span>
                  <div className={`p-1.5 rounded-md ${TONE_BG[s.tone]}`}>
                    <Icon size={11} strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-ink-900 tracking-tight tabular-nums">
                  {s.value.toLocaleString()}
                </p>
                {s.hint && (
                  <p className="text-[11px] text-ink-500 mt-0.5 truncate">{s.hint}</p>
                )}
              </div>
            );
          })}
        </div>

        {targets.length > 0 && (
          <div className="pt-5 border-t border-ink-100">
            <div className="flex items-center gap-1.5 mb-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider">
              <TargetIcon size={11} />
              Target Progress
            </div>
            <div className="space-y-3">
              {targets.map((t) => (
                <div key={t.metric}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-ink-700">{formatLabel(t.metric)}</span>
                    <span className="text-ink-500 tabular-nums">
                      <span className="font-bold text-ink-900">{t.actual}</span>
                      <span className="text-ink-300 mx-1">/</span>
                      {t.expectedGoal}
                      <span className="ml-1.5 text-[10px] font-semibold uppercase">
                        ({t.percent}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
