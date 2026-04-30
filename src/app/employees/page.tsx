"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { CrudClient } from "@/components/CrudClient";
import { formatLabel } from "@/lib/utils";

const ROLE_OPTIONS = [
  { value: "social_media", label: "Social Media / Lead Gen" },
  { value: "caller", label: "Cold Caller / Closer" },
];

export default function Page() {
  return (
    <AppShell>
      <PageHeader
        title="Designations"
        description="Manage who you're tracking. Each designation can be assigned a role."
      />
      <CrudClient
        endpoint="/api/employees"
        columns={[
          { key: "name", label: "Name" },
          {
            key: "role",
            label: "Role",
            render: (r) => formatLabel(String(r.role)),
          },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          {
            key: "active",
            label: "Active",
            render: (r) =>
              r.active ? (
                <span className="badge bg-green-100 text-green-700 border-green-200">
                  Active
                </span>
              ) : (
                <span className="badge bg-gray-100 text-gray-700 border-gray-200">
                  Inactive
                </span>
              ),
          },
        ]}
        fields={[
          { name: "name", label: "Name", type: "text", required: true },
          {
            name: "role",
            label: "Role",
            type: "select",
            options: ROLE_OPTIONS,
            required: true,
          },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone", type: "text" },
          {
            name: "active",
            label: "Active",
            type: "select",
            options: [
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ],
            defaultValue: "true",
          },
        ]}
      />
    </AppShell>
  );
}
