"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { CrudClient, renderHelpers } from "@/components/CrudClient";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDate } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "post", label: "Post" },
  { value: "reel", label: "Reel" },
  { value: "story", label: "Story" },
];

export default function Page() {
  const { employees } = useEmployees();

  return (
    <AppShell>
      <PageHeader
        title="Instagram Posts"
        description="Posts, reels, and stories with engagement metrics."
      >
        <DateRangeBar />
      </PageHeader>

      <CrudClient
        endpoint="/api/instagram-posts"
        exportEntity="instagram-posts"
        employees={employees.map((e) => ({ id: e.id, name: e.name, role: e.role }))}
        defaultEmployeeRole="social_media"
        columns={[
          { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
          {
            key: "employee",
            label: "Designation",
            render: (r) => (r.employee as { name: string })?.name || "—",
          },
          { key: "postType", label: "Type" },
          {
            key: "caption",
            label: "Caption",
            render: (r) => renderHelpers.truncate(r.caption, 50),
          },
          { key: "postUrl", label: "URL", render: (r) => renderHelpers.link(r.postUrl) },
          { key: "likes", label: "👍" },
          { key: "comments", label: "💬" },
          { key: "saves", label: "🔖" },
          { key: "reach", label: "🌐" },
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
            name: "postType",
            label: "Type",
            type: "select",
            options: TYPE_OPTIONS,
            defaultValue: "post",
            required: true,
          },
          { name: "caption", label: "Caption", type: "textarea", full: true },
          { name: "postUrl", label: "Post URL", type: "url", full: true },
          { name: "likes", label: "Likes", type: "number" },
          { name: "comments", label: "Comments", type: "number" },
          { name: "saves", label: "Saves", type: "number" },
          { name: "reach", label: "Reach", type: "number" },
          { name: "notes", label: "Notes", type: "textarea", full: true },
        ]}
      />
    </AppShell>
  );
}
