import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const employees = await prisma.employee.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const employee = await prisma.employee.create({
    data: {
      name: body.name,
      role: body.role,
      email: body.email || null,
      phone: body.phone || null,
      active: body.active === false || body.active === "false" ? false : true,
    },
  });
  return NextResponse.json(employee, { status: 201 });
}
