import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if ("targetValue" in body) data.targetValue = Number(body.targetValue) || 0;
  if ("active" in body) data.active = !!body.active;
  if ("metric" in body) data.metric = body.metric;
  if ("period" in body) data.period = body.period;
  const item = await prisma.target.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await prisma.target.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
