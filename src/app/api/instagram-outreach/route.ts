import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const range = parseDateRange(sp);
  const employeeId = sp.get("employeeId");
  const status = sp.get("status");
  const where: Record<string, unknown> = { date: { gte: range.from, lte: range.to } };
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  const items = await prisma.instagramOutreach.findMany({
    where,
    include: { employee: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.instagramOutreach.create({
    data: {
      employeeId: body.employeeId,
      date: body.date ? new Date(body.date) : new Date(),
      prospectHandle: body.prospectHandle,
      prospectName: body.prospectName || null,
      status: body.status || "sent",
      notes: body.notes || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
