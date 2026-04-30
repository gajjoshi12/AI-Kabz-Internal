import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of [
    "name",
    "phone",
    "email",
    "company",
    "source",
    "providedById",
    "assignedToId",
    "status",
    "priority",
    "notes",
  ]) {
    if (k in body) data[k] = body[k] === "" ? null : body[k];
  }
  if ("value" in body) data.value = body.value ? Number(body.value) : null;
  if (body.date) data.date = new Date(body.date);
  const item = await prisma.lead.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
