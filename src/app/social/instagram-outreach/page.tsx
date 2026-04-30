"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { CrudClient, renderHelpers } from "@/components/CrudClient";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "sent", label: "Sent" },
  { value: "replied", label: "Replied" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "no_response", label: "No Response" },
];

export default function Page() {
  const { employees } = useEmployees();

  return (
    <AppShell>
      <PageHeader
        title="Instagram DMs"
        description="Direct messages and outreach on Instagram."
      >
        <DateRangeBar />
      </PageHeader>

      <CrudClient
        endpoint="/api/instagram-outreach"
        exportEntity="instagram-outreach"
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
          { key: "prospectHandle", label: "Handle" },
          { key: "prospectName", label: "Name" },
          { key: "status", label: "Status", render: (r) => renderHelpers.status(r.status) },
          {
            key: "notes",
            label: "Notes",
            render: (r) => renderHelpers.truncate(r.notes, 50),
          },
        ]}
        fields={[
          { name: "employeeId", label: "Designation", type: "select", required: true, options: [] },
          {
            name: "date",
            label: "Date",
            type: "datetime-local",
            required: true,
          },
          {
            name: "prospectHandle",
            label: "@handle",
            type: "text",
            required: true,
            placeholder: "@username",
          },
          { name: "prospectName", label: "Prospect Name", type: "text" },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: STATUS_OPTIONS,
            defaultValue: "sent",
            required: true,
          },
          { name: "notes", label: "Notes", type: "textarea", full: true },
        ]}
      />
    </AppShell>
  );
}
