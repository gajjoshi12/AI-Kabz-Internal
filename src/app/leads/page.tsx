"use client";

import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeBar } from "@/components/DateRangeBar";
import { CrudClient, renderHelpers } from "@/components/CrudClient";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDate } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "meeting_scheduled", label: "Meeting Scheduled" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const SOURCE_OPTIONS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function Page() {
  const { employees } = useEmployees();
  const employeeOptions = employees.map((e) => ({ value: e.id, label: e.name }));

  return (
    <AppShell>
      <PageHeader
        title="Leads Pipeline"
        description="All leads — who provided them, who's working them, and pipeline status."
      >
        <DateRangeBar />
      </PageHeader>

      <CrudClient
        endpoint="/api/leads"
        exportEntity="leads"
        filters={[
          { name: "status", label: "Status", options: STATUS_OPTIONS },
          { name: "providedById", label: "Provided By", options: employeeOptions },
          { name: "assignedToId", label: "Assigned To", options: employeeOptions },
        ]}
        columns={[
          { key: "date", label: "Date", render: (r) => formatDate(r.date as string) },
          { key: "name", label: "Name" },
          { key: "company", label: "Company" },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "source", label: "Source", render: (r) => renderHelpers.status(r.source) },
          {
            key: "providedBy",
            label: "Provided By",
            render: (r) => (r.providedBy as { name: string })?.name || "—",
          },
          {
            key: "assignedTo",
            label: "Assigned To",
            render: (r) => (r.assignedTo as { name: string })?.name || "—",
          },
          { key: "status", label: "Status", render: (r) => renderHelpers.status(r.status) },
          {
            key: "priority",
            label: "Priority",
            render: (r) => renderHelpers.status(r.priority),
          },
          {
            key: "value",
            label: "Value",
            render: (r) => (r.value ? `₹${(r.value as number).toLocaleString()}` : "—"),
          },
        ]}
        fields={[
          {
            name: "date",
            label: "Date",
            type: "datetime-local",
            required: true,
          },
          { name: "name", label: "Lead Name", type: "text", required: true },
          { name: "company", label: "Company", type: "text" },
          { name: "phone", label: "Phone", type: "text" },
          { name: "email", label: "Email", type: "email" },
          {
            name: "source",
            label: "Source",
            type: "select",
            options: SOURCE_OPTIONS,
            defaultValue: "other",
            required: true,
          },
          {
            name: "providedById",
            label: "Provided By",
            type: "select",
            options: employeeOptions,
          },
          {
            name: "assignedToId",
            label: "Assigned To",
            type: "select",
            options: employeeOptions,
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: STATUS_OPTIONS,
            defaultValue: "new",
            required: true,
          },
          {
            name: "priority",
            label: "Priority",
            type: "select",
            options: PRIORITY_OPTIONS,
            defaultValue: "medium",
            required: true,
          },
          { name: "value", label: "Value (₹)", type: "number" },
          { name: "notes", label: "Notes", type: "textarea", full: true },
        ]}
      />
    </AppShell>
  );
}
