import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ["postType", "caption", "postUrl", "notes"]) {
    if (k in body) data[k] = body[k];
  }
  for (const k of ["likes", "comments", "saves", "reach"]) {
    if (k in body) data[k] = Number(body[k]) || 0;
  }
  if (body.date) data.date = new Date(body.date);
  const item = await prisma.instagramPost.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await prisma.instagramPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
