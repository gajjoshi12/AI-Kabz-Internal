import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseDateRange } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const range = parseDateRange(sp);
  const employeeId = sp.get("employeeId");
  const where: Record<string, unknown> = { date: { gte: range.from, lte: range.to } };
  if (employeeId) where.employeeId = employeeId;
  const items = await prisma.linkedInPost.findMany({
    where,
    include: { employee: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await prisma.linkedInPost.create({
    data: {
      employeeId: body.employeeId,
      date: body.date ? new Date(body.date) : new Date(),
      title: body.title,
      content: body.content || null,
      postUrl: body.postUrl || null,
      likes: Number(body.likes) || 0,
      comments: Number(body.comments) || 0,
      shares: Number(body.shares) || 0,
      impressions: Number(body.impressions) || 0,
      notes: body.notes || null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
