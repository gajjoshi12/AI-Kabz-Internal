import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["prospectName", "prospectPhone", "outcome", "notes", "leadId"]) {
    if (k in body) data[k] = body[k] === "" ? null : body[k];
  }
  if ("duration" in body) data.duration = Number(body.duration) || 0;
  if (body.date) data.date = new Date(body.date);
  if ("followUpDate" in body) data.followUpDate = body.followUpDate ? new Date(body.followUpDate) : null;
  const item = await prisma.coldCall.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await prisma.coldCall.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
