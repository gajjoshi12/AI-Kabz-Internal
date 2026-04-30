import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Lock, Database, Info } from "lucide-react";

export default function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Settings"
        description="System configuration and tips."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <Lock size={18} />
            </div>
            <h3 className="font-semibold text-gray-900">Authentication</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Login credentials are stored in the <code>.env</code> file at the project root.
            Edit <code>ADMIN_USERNAME</code> and <code>ADMIN_PASSWORD</code> there, then
            restart the dev server.
          </p>
          <p className="text-xs text-gray-400">
            Also rotate <code>JWT_SECRET</code> to a long random string for production.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Database size={18} />
            </div>
            <h3 className="font-semibold text-gray-900">Database</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Using SQLite. The database file lives at <code>prisma/dev.db</code>. To browse
            the data run <code>npm run db:studio</code>.
          </p>
          <p className="text-xs text-gray-400">
            Daily backups: copy <code>prisma/dev.db</code> to safe storage.
          </p>
        </div>

        <div className="card p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Info size={18} />
            </div>
            <h3 className="font-semibold text-gray-900">Quick Tips</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Add or edit designations on the <strong>Designations</strong> page.</li>
            <li>
              Set daily/weekly/monthly targets per designation on the <strong>Targets</strong>{" "}
              page — the dashboard then shows live progress.
            </li>
            <li>
              Each tracker page (LinkedIn, Instagram, calls, etc.) has CSV export and date
              filtering.
            </li>
            <li>
              The <strong>Leads</strong> page lets you link who provided a lead to who's
              working it — perfect for handoffs.
            </li>
            <li>
              Daily reports let each designation log a summary, highlights, blockers, and
              tomorrow's plan.
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
