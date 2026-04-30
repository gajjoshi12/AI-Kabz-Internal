import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/utils";
import { startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const range = parseDateRange(sp);
  const employeeId = sp.get("employeeId");
  const where: Record<string, unknown> = { date: { gte: range.from, lte: range.to } };
  if (employeeId) where.employeeId = employeeId;
  const items = await prisma.dailyReport.findMany({
    where,
    include: { employee: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const date = startOfDay(body.date ? new Date(body.date) : new Date());
  const existing = await prisma.dailyReport.findUnique({
    where: { employeeId_date: { employeeId: body.employeeId, date } },
  });
  let item;
  if (existing) {
    item = await prisma.dailyReport.update({
      where: { id: existing.id },
      data: {
        summary: body.summary,
        highlights: body.highlights || null,
        blockers: body.blockers || null,
        tomorrowPlan: body.tomorrowPlan || null,
      },
    });
  } else {
    item = await prisma.dailyReport.create({
      data: {
        employeeId: body.employeeId,
        date,
        summary: body.summary,
        highlights: body.highlights || null,
        blockers: body.blockers || null,
        tomorrowPlan: body.tomorrowPlan || null,
      },
    });
  }
  return NextResponse.json(item, { status: 201 });
}
