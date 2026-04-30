import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const range = parseDateRange(sp);
  const employeeId = sp.get("employeeId");
  const status = sp.get("status");
  const where: Record<string, unknown> = {
    scheduledAt: { gte: range.from, lte: range.to },
  };
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  const items = await prisma.zoomMeeting.findMany({
    where,
    include: { employee: true, lead: true },
    orderBy: { scheduledAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.zoomMeeting.create({
    data: {
      employeeId: body.employeeId,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
      duration: Number(body.duration) || 0,
      attendeeName: body.attendeeName,
      attendeeEmail: body.attendeeEmail || null,
      status: body.status || "scheduled",
      outcome: body.outcome || null,
      meetingUrl: body.meetingUrl || null,
      leadId: body.leadId || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
