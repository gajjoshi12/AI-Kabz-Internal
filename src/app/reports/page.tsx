"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { CrudClient } from "@/components/CrudClient";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDate } from "@/lib/utils";

export default function Page() {
  const { employees } = useEmployees();

  return (
    <AppShell>
      <PageHeader
        title="Daily Reports"
        description="End-of-day summaries from each team member."
      >
        <DateRangeBar />
      </PageHeader>

      <CrudClient
        endpoint="/api/daily-reports"
        employees={employees.map((e) => ({ id: e.id, name: e.name, role: e.role }))}
        columns={[
          { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
          {
            key: "employee",
            label: "Designation",
            render: (r) => (r.employee as { name: string })?.name || "—",
          },
          { key: "summary", label: "Summary" },
          { key: "highlights", label: "Highlights" },
          { key: "blockers", label: "Blockers" },
          { key: "tomorrowPlan", label: "Tomorrow's Plan" },
        ]}
        fields={[
          { name: "employeeId", label: "Designation", type: "select", required: true, options: [] },
          {
            name: "date",
            label: "Date",
            type: "date",
            required: true,
          },
          { name: "summary", label: "Summary", type: "textarea", required: true, full: true },
          { name: "highlights", label: "Highlights / Wins", type: "textarea", full: true },
          { name: "blockers", label: "Blockers", type: "textarea", full: true },
          { name: "tomorrowPlan", label: "Tomorrow's Plan", type: "textarea", full: true },
        ]}
      />
    </AppShell>
  );
}
