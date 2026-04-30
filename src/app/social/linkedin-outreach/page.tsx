"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { CrudClient, renderHelpers } from "@/components/CrudClient";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "replied", label: "Replied" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "no_response", label: "No Response" },
];

const TYPE_OPTIONS = [
  { value: "connection_request", label: "Connection Request" },
  { value: "message", label: "Message" },
  { value: "follow_up", label: "Follow Up" },
];

export default function Page() {
  const { employees } = useEmployees();

  return (
    <AppShell>
      <PageHeader
        title="LinkedIn Outreach"
        description="Every prospect approached on LinkedIn — message type, status, replies."
      >
        <DateRangeBar />
      </PageHeader>

      <CrudClient
        endpoint="/api/linkedin-outreach"
        exportEntity="linkedin-outreach"
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
          { key: "prospectName", label: "Prospect" },
          { key: "company", label: "Company" },
          { key: "messageType", label: "Type" },
          { key: "status", label: "Status", render: (r) => renderHelpers.status(r.status) },
          {
            key: "profileUrl",
            label: "Profile",
            render: (r) => renderHelpers.link(r.profileUrl),
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
          { name: "prospectName", label: "Prospect Name", type: "text", required: true },
          { name: "prospectTitle", label: "Title / Role", type: "text" },
          { name: "company", label: "Company", type: "text" },
          { name: "profileUrl", label: "LinkedIn URL", type: "url", full: true },
          {
            name: "messageType",
            label: "Message Type",
            type: "select",
            options: TYPE_OPTIONS,
            defaultValue: "message",
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: STATUS_OPTIONS,
            defaultValue: "sent",
          },
          { name: "notes", label: "Notes", type: "textarea", full: true },
        ]}
      />
    </AppShell>
  );
}
