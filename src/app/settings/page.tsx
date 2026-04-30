import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Lock, Database, Info, Zap } from "lucide-react";

export default function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Settings"
        description="System configuration and tips."
        eyebrow="Admin"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SettingCard
          icon={Lock}
          gradient="from-brand-500 to-fuchsia-500"
          title="Authentication"
        >
          <p className="text-sm text-ink-600">
            Login credentials are stored in <code className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 font-mono text-xs">.env</code>.
            Edit <code className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 font-mono text-xs">ADMIN_USERNAME</code> and{" "}
            <code className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 font-mono text-xs">ADMIN_PASSWORD</code>, then restart the dev server.
          </p>
          <p className="text-xs text-ink-500 mt-3">
            Rotate <code className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 font-mono text-[11px]">JWT_SECRET</code> to a long random string for production.
          </p>
        </SettingCard>

        <SettingCard
          icon={Database}
          gradient="from-emerald-500 to-teal-500"
          title="Database"
        >
          <p className="text-sm text-ink-600">
            Using SQLite. Database file lives at{" "}
            <code className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 font-mono text-xs">prisma/dev.db</code>.
            Browse data with <code className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 font-mono text-xs">npm run db:studio</code>.
          </p>
          <p className="text-xs text-ink-500 mt-3">
            Daily backups: copy <code className="px-1.5 py-0.5 rounded bg-ink-100 text-ink-700 font-mono text-[11px]">prisma/dev.db</code> to safe storage.
          </p>
        </SettingCard>

        <SettingCard
          icon={Info}
          gradient="from-amber-500 to-orange-500"
          title="Quick Tips"
          full
        >
          <ul className="text-sm text-ink-600 space-y-2.5">
            <li className="flex gap-3">
              <span className="text-brand-500 font-bold mt-0.5">·</span>
              Add or edit designations on the <strong className="text-ink-900">Designations</strong> page.
            </li>
            <li className="flex gap-3">
              <span className="text-brand-500 font-bold mt-0.5">·</span>
              Set daily/weekly/monthly targets per designation on the <strong className="text-ink-900">Targets</strong> page — the dashboard then shows live progress.
            </li>
            <li className="flex gap-3">
              <span className="text-brand-500 font-bold mt-0.5">·</span>
              Each tracker page has CSV export and date filtering.
            </li>
            <li className="flex gap-3">
              <span className="text-brand-500 font-bold mt-0.5">·</span>
              The <strong className="text-ink-900">Leads</strong> page lets you link who provided a lead to who's working it — perfect for handoffs.
            </li>
            <li className="flex gap-3">
              <span className="text-brand-500 font-bold mt-0.5">·</span>
              Daily reports let each designation log a summary, highlights, blockers, and tomorrow's plan.
            </li>
          </ul>
        </SettingCard>

        <SettingCard
          icon={Zap}
          gradient="from-sky-500 to-blue-500"
          title="Auto-refresh"
          full
        >
          <p className="text-sm text-ink-600">
            The dashboard and analytics pages refresh automatically every 60 seconds and whenever you switch back to the tab. Click the <strong className="text-ink-900">Refresh</strong> button anytime to pull the latest data instantly.
          </p>
        </SettingCard>
      </div>
    </AppShell>
  );
}

function SettingCard({
  icon: Icon,
  gradient,
  title,
  children,
  full,
}: {
  icon: typeof Lock;
  gradient: string;
  title: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`card p-6 ${full ? "md:col-span-2" : ""}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-soft`}>
          <Icon size={18} strokeWidth={2.25} />
        </div>
        <h3 className="font-bold text-ink-900 tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}
