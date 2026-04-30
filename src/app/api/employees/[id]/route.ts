import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const employee = await prisma.employee.update({
    where: { id },
    data: {
      name: body.name,
      role: body.role,
      email: body.email,
      phone: body.phone,
      active:
        body.active === undefined
          ? undefined
          : body.active === false || body.active === "false"
          ? false
          : true,
    },
  });
  return NextResponse.json(employee);
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
