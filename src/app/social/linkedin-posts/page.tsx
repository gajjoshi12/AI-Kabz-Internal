"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { CrudClient, renderHelpers } from "@/components/CrudClient";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDate } from "@/lib/utils";

export default function Page() {
  const { employees } = useEmployees();

  return (
    <AppShell>
      <PageHeader
        title="LinkedIn Posts"
        description="Track every LinkedIn post — content, engagement, and reach."
      >
        <DateRangeBar />
      </PageHeader>

      <CrudClient
        endpoint="/api/linkedin-posts"
        exportEntity="linkedin-posts"
        employees={employees.map((e) => ({ id: e.id, name: e.name, role: e.role }))}
        defaultEmployeeRole="social_media"
        columns={[
          { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
          {
            key: "employee",
            label: "Designation",
            render: (r) => (r.employee as { name: string })?.name || "—",
          },
          { key: "title", label: "Title" },
          { key: "postUrl", label: "Post URL", render: (r) => renderHelpers.link(r.postUrl) },
          { key: "likes", label: "👍" },
          { key: "comments", label: "💬" },
          { key: "shares", label: "🔁" },
          { key: "impressions", label: "👁" },
        ]}
        fields={[
          { name: "employeeId", label: "Designation", type: "select", required: true, options: [] },
          {
            name: "date",
            label: "Date",
            type: "datetime-local",
            required: true,
          },
          { name: "title", label: "Post Title", type: "text", required: true, full: true },
          {
            name: "content",
            label: "Content / Summary",
            type: "textarea",
            full: true,
            placeholder: "What was the post about?",
          },
          { name: "postUrl", label: "Post URL", type: "url", full: true },
          { name: "likes", label: "Likes", type: "number" },
          { name: "comments", label: "Comments", type: "number" },
          { name: "shares", label: "Shares", type: "number" },
          { name: "impressions", label: "Impressions", type: "number" },
          { name: "notes", label: "Notes", type: "textarea", full: true },
        ]}
      />
    </AppShell>
  );
}
