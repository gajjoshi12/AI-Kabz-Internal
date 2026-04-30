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
  const items = await prisma.email.findMany({
    where,
    include: { employee: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.email.create({
    data: {
      employeeId: body.employeeId,
      date: body.date ? new Date(body.date) : new Date(),
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      subject: body.subject,
      body: body.body || null,
      status: body.status || "sent",
      notes: body.notes || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
