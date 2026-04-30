import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const employeeId = sp.get("employeeId");
  const where: Record<string, unknown> = { active: true };
  if (employeeId) where.employeeId = employeeId;
  const items = await prisma.target.findMany({
    where,
    include: { employee: true },
    orderBy: [{ employeeId: "asc" }, { metric: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // upsert by employee+metric+period
  const existing = await prisma.target.findFirst({
    where: {
      employeeId: body.employeeId,
      metric: body.metric,
      period: body.period,
      active: true,
    },
  });
  let item;
  if (existing) {
    item = await prisma.target.update({
      where: { id: existing.id },
      data: { targetValue: Number(body.targetValue) || 0 },
    });
  } else {
    item = await prisma.target.create({
      data: {
        employeeId: body.employeeId,
        metric: body.metric,
        period: body.period,
        targetValue: Number(body.targetValue) || 0,
        active: true,
      },
    });
  }
  return NextResponse.json(item, { status: 201 });
}
