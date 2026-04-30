import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const range = parseDateRange(sp);
  const employeeId = sp.get("employeeId");
  const outcome = sp.get("outcome");
  const where: Record<string, unknown> = { date: { gte: range.from, lte: range.to } };
  if (employeeId) where.employeeId = employeeId;
  if (outcome) where.outcome = outcome;
  const items = await prisma.coldCall.findMany({
    where,
    include: { employee: true, lead: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.coldCall.create({
    data: {
      employeeId: body.employeeId,
      date: body.date ? new Date(body.date) : new Date(),
      prospectName: body.prospectName,
      prospectPhone: body.prospectPhone || null,
      duration: Number(body.duration) || 0,
      outcome: body.outcome || "no_answer",
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      leadId: body.leadId || null,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
