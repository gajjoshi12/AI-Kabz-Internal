"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { CrudClient, renderHelpers } from "@/components/CrudClient";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDateTime } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "no_show", label: "No Show" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rescheduled", label: "Rescheduled" },
];

const OUTCOME_OPTIONS = [
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "follow_up", label: "Follow Up" },
  { value: "closed_won", label: "Closed — Won" },
  { value: "closed_lost", label: "Closed — Lost" },
];

export default function Page() {
  const { employees } = useEmployees();

  return (
    <AppShell>
      <PageHeader
        title="Zoom Meetings"
        description="Scheduled and completed Zoom meetings — outcomes and notes."
      >
        <DateRangeBar />
      </PageHeader>

      <CrudClient
        endpoint="/api/zoom-meetings"
        exportEntity="zoom-meetings"
        employees={employees.map((e) => ({ id: e.id, name: e.name, role: e.role }))}
        defaultEmployeeRole="caller"
        filters={[{ name: "status", label: "Status", options: STATUS_OPTIONS }]}
        columns={[
          {
            key: "scheduledAt",
            label: "When",
            render: (r) => formatDateTime(r.scheduledAt as string),
          },
          {
            key: "employee",
            label: "Host",
            render: (r) => (r.employee as { name: string })?.name || "—",
          },
          { key: "attendeeName", label: "Attendee" },
          { key: "attendeeEmail", label: "Email" },
          {
            key: "duration",
            label: "Duration",
            render: (r) => `${r.duration ?? 0} min`,
          },
          { key: "status", label: "Status", render: (r) => renderHelpers.status(r.status) },
          { key: "outcome", label: "Outcome", render: (r) => renderHelpers.status(r.outcome) },
        ]}
        fields={[
          { name: "employeeId", label: "Host", type: "select", required: true, options: [] },
          {
            name: "scheduledAt",
            label: "Scheduled At",
            type: "datetime-local",
            required: true,
          },
          { name: "attendeeName", label: "Attendee Name", type: "text", required: true },
          { name: "attendeeEmail", label: "Attendee Email", type: "email" },
          { name: "duration", label: "Duration (min)", type: "number", defaultValue: 30 },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: STATUS_OPTIONS,
            defaultValue: "scheduled",
            required: true,
          },
          { name: "outcome", label: "Outcome", type: "select", options: OUTCOME_OPTIONS },
          { name: "meetingUrl", label: "Meeting URL", type: "url", full: true },
          { name: "notes", label: "Notes", type: "textarea", full: true },
        ]}
      />
    </AppShell>
  );
}
