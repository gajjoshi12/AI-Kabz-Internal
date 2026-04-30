import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseDateRange, toCSV, formatDateTime } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const entity = sp.get("entity");
  const range = parseDateRange(sp);
  const employeeId = sp.get("employeeId");

  let rows: Record<string, unknown>[] = [];
  let filename = "export.csv";

  const where: Record<string, unknown> = {};
  if (employeeId) where.employeeId = employeeId;

  if (entity === "linkedin-posts") {
    where.date = { gte: range.from, lte: range.to };
    const items = await prisma.linkedInPost.findMany({ where, include: { employee: true } });
    rows = items.map((i) => ({
      date: formatDateTime(i.date),
      employee: i.employee.name,
      title: i.title,
      content: i.content,
      postUrl: i.postUrl,
      likes: i.likes,
      comments: i.comments,
      shares: i.shares,
      impressions: i.impressions,
      notes: i.notes,
    }));
    filename = "linkedin-posts.csv";
  } else if (entity === "linkedin-outreach") {
    where.date = { gte: range.from, lte: range.to };
    const items = await prisma.linkedInOutreach.findMany({ where, include: { employee: true } });
    rows = items.map((i) => ({
      date: formatDateTime(i.date),
      employee: i.employee.name,
      prospectName: i.prospectName,
      prospectTitle: i.prospectTitle,
      company: i.company,
      profileUrl: i.profileUrl,
      messageType: i.messageType,
      status: i.status,
      notes: i.notes,
    }));
    filename = "linkedin-outreach.csv";
  } else if (entity === "instagram-posts") {
    where.date = { gte: range.from, lte: range.to };
    const items = await prisma.instagramPost.findMany({ where, include: { employee: true } });
    rows = items.map((i) => ({
      date: formatDateTime(i.date),
      employee: i.employee.name,
      postType: i.postType,
      caption: i.caption,
      postUrl: i.postUrl,
      likes: i.likes,
      comments: i.comments,
      saves: i.saves,
      reach: i.reach,
      notes: i.notes,
    }));
    filename = "instagram-posts.csv";
  } else if (entity === "instagram-outreach") {
    where.date = { gte: range.from, lte: range.to };
    const items = await prisma.instagramOutreach.findMany({ where, include: { employee: true } });
    rows = items.map((i) => ({
      date: formatDateTime(i.date),
      employee: i.employee.name,
      prospectHandle: i.prospectHandle,
      prospectName: i.prospectName,
      status: i.status,
      notes: i.notes,
    }));
    filename = "instagram-outreach.csv";
  } else if (entity === "emails") {
    where.date = { gte: range.from, lte: range.to };
    const items = await prisma.email.findMany({ where, include: { employee: true } });
    rows = items.map((i) => ({
      date: formatDateTime(i.date),
      employee: i.employee.name,
      recipientName: i.recipientName,
      recipientEmail: i.recipientEmail,
      subject: i.subject,
      status: i.status,
      notes: i.notes,
    }));
    filename = "emails.csv";
  } else if (entity === "cold-calls") {
    where.date = { gte: range.from, lte: range.to };
    const items = await prisma.coldCall.findMany({
      where,
      include: { employee: true, lead: true },
    });
    rows = items.map((i) => ({
      date: formatDateTime(i.date),
      employee: i.employee.name,
      prospectName: i.prospectName,
      prospectPhone: i.prospectPhone,
      duration: i.duration,
      outcome: i.outcome,
      followUpDate: i.followUpDate ? formatDateTime(i.followUpDate) : "",
      lead: i.lead?.name,
      notes: i.notes,
    }));
    filename = "cold-calls.csv";
  } else if (entity === "zoom-meetings") {
    where.scheduledAt = { gte: range.from, lte: range.to };
    const items = await prisma.zoomMeeting.findMany({
      where,
      include: { employee: true, lead: true },
    });
    rows = items.map((i) => ({
      scheduledAt: formatDateTime(i.scheduledAt),
      employee: i.employee.name,
      attendeeName: i.attendeeName,
      attendeeEmail: i.attendeeEmail,
      duration: i.duration,
      status: i.status,
      outcome: i.outcome,
      meetingUrl: i.meetingUrl,
      lead: i.lead?.name,
      notes: i.notes,
    }));
    filename = "zoom-meetings.csv";
  } else if (entity === "leads") {
    where.date = { gte: range.from, lte: range.to };
    const items = await prisma.lead.findMany({
      where,
      include: { providedBy: true, assignedTo: true },
    });
    rows = items.map((i) => ({
      date: formatDateTime(i.date),
      name: i.name,
      phone: i.phone,
      email: i.email,
      company: i.company,
      source: i.source,
      providedBy: i.providedBy?.name,
      assignedTo: i.assignedTo?.name,
      status: i.status,
      priority: i.priority,
      value: i.value,
      notes: i.notes,
    }));
    filename = "leads.csv";
  } else {
    return NextResponse.json({ error: "Unknown entity" }, { status: 400 });
  }

  const csv = toCSV(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
