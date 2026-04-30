import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const range = parseDateRange(sp);
  const status = sp.get("status");
  const providedById = sp.get("providedById");
  const assignedToId = sp.get("assignedToId");
  const where: Record<string, unknown> = { date: { gte: range.from, lte: range.to } };
  if (status) where.status = status;
  if (providedById) where.providedById = providedById;
  if (assignedToId) where.assignedToId = assignedToId;
  const items = await prisma.lead.findMany({
    where,
    include: {
      providedBy: true,
      assignedTo: true,
      coldCalls: { orderBy: { date: "desc" }, take: 1 },
      zoomMeetings: { orderBy: { scheduledAt: "desc" }, take: 1 },
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.lead.create({
    data: {
      date: body.date ? new Date(body.date) : new Date(),
      name: body.name,
      phone: body.phone || null,
      email: body.email || null,
      company: body.company || null,
      source: body.source || "other",
      providedById: body.providedById || null,
      assignedToId: body.assignedToId || null,
      status: body.status || "new",
      priority: body.priority || "medium",
      value: body.value ? Number(body.value) : null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
