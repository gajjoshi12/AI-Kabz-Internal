"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { CrudClient, renderHelpers } from "@/components/CrudClient";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "sent", label: "Sent" },
  { value: "opened", label: "Opened" },
  { value: "replied", label: "Replied" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "bounced", label: "Bounced" },
];

export default function Page() {
  const { employees } = useEmployees();

  return (
    <AppShell>
      <PageHeader
        title="Emails Sent"
        description="Outbound emails to prospects with status tracking."
      >
        <DateRangeBar />
      </PageHeader>

      <CrudClient
        endpoint="/api/emails"
        exportEntity="emails"
        employees={employees.map((e) => ({ id: e.id, name: e.name, role: e.role }))}
        defaultEmployeeRole="social_media"
        filters={[{ name: "status", label: "Status", options: STATUS_OPTIONS }]}
        columns={[
          { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
          {
            key: "employee",
            label: "Designation",
            render: (r) => (r.employee as { name: string })?.name || "—",
          },
          { key: "recipientName", label: "Recipient" },
          { key: "recipientEmail", label: "Email" },
          {
            key: "subject",
            label: "Subject",
            render: (r) => renderHelpers.truncate(r.subject, 50),
          },
          { key: "status", label: "Status", render: (r) => renderHelpers.status(r.status) },
        ]}
        fields={[
          { name: "employeeId", label: "Designation", type: "select", required: true, options: [] },
          {
            name: "date",
            label: "Date",
            type: "datetime-local",
            required: true,
          },
          { name: "recipientName", label: "Recipient Name", type: "text", required: true },
          { name: "recipientEmail", label: "Recipient Email", type: "email", required: true },
          { name: "subject", label: "Subject", type: "text", required: true, full: true },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: STATUS_OPTIONS,
            defaultValue: "sent",
            required: true,
          },
          { name: "body", label: "Email Body", type: "textarea", full: true },
          { name: "notes", label: "Notes", type: "textarea", full: true },
        ]}
      />
    </AppShell>
  );
}
