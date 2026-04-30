"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { CrudClient, renderHelpers } from "@/components/CrudClient";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDateTime } from "@/lib/utils";

const OUTCOME_OPTIONS = [
  { value: "connected", label: "Connected" },
  { value: "no_answer", label: "No Answer" },
  { value: "busy", label: "Busy" },
  { value: "voicemail", label: "Voicemail" },
  { value: "callback", label: "Callback Requested" },
  { value: "meeting_scheduled", label: "Meeting Scheduled" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
];

export default function Page() {
  const { employees } = useEmployees();

  return (
    <AppShell>
      <PageHeader
        title="Cold Calls"
        description="Every cold call — duration, outcome, and follow-ups."
      >
        <DateRangeBar />
      </PageHeader>

      <CrudClient
        endpoint="/api/cold-calls"
        exportEntity="cold-calls"
        employees={employees.map((e) => ({ id: e.id, name: e.name, role: e.role }))}
        defaultEmployeeRole="caller"
        filters={[{ name: "outcome", label: "Outcome", options: OUTCOME_OPTIONS }]}
        columns={[
          { key: "date", label: "When", render: (r) => formatDateTime(r.date as string) },
          {
            key: "employee",
            label: "Caller",
            render: (r) => (r.employee as { name: string })?.name || "—",
          },
          { key: "prospectName", label: "Prospect" },
          { key: "prospectPhone", label: "Phone" },
          {
            key: "duration",
            label: "Duration",
            render: (r) => `${r.duration ?? 0} min`,
          },
          { key: "outcome", label: "Outcome", render: (r) => renderHelpers.status(r.outcome) },
          {
            key: "followUpDate",
            label: "Follow-up",
            render: (r) =>
              r.followUpDate
                ? formatDateTime(r.followUpDate as string)
                : <span className="text-gray-300">—</span>,
          },
        ]}
        fields={[
          { name: "employeeId", label: "Caller", type: "select", required: true, options: [] },
          {
            name: "date",
            label: "Call Time",
            type: "datetime-local",
            required: true,
          },
          { name: "prospectName", label: "Prospect Name", type: "text", required: true },
          { name: "prospectPhone", label: "Phone Number", type: "text" },
          { name: "duration", label: "Duration (minutes)", type: "number", defaultValue: 0 },
          {
            name: "outcome",
            label: "Outcome",
            type: "select",
            options: OUTCOME_OPTIONS,
            defaultValue: "no_answer",
            required: true,
          },
          { name: "followUpDate", label: "Follow-up Date", type: "datetime-local" },
          { name: "notes", label: "Notes", type: "textarea", full: true },
        ]}
      />
    </AppShell>
  );
}
