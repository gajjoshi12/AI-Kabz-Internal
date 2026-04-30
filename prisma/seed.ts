import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const social = await prisma.employee.upsert({
    where: { id: "seed-social" },
    update: {},
    create: {
      id: "seed-social",
      name: "Social Media Manager",
      role: "social_media",
      email: "social@example.com",
      active: true,
    },
  });

  const caller = await prisma.employee.upsert({
    where: { id: "seed-caller" },
    update: {},
    create: {
      id: "seed-caller",
      name: "Cold Caller",
      role: "caller",
      email: "caller@example.com",
      active: true,
    },
  });

  // Default targets (daily)
  const defaultTargets = [
    { employeeId: social.id, metric: "linkedin_posts", period: "daily", targetValue: 1 },
    { employeeId: social.id, metric: "linkedin_outreach", period: "daily", targetValue: 20 },
    { employeeId: social.id, metric: "instagram_posts", period: "daily", targetValue: 1 },
    { employeeId: social.id, metric: "instagram_outreach", period: "daily", targetValue: 15 },
    { employeeId: social.id, metric: "emails", period: "daily", targetValue: 10 },
    { employeeId: social.id, metric: "leads_provided", period: "daily", targetValue: 3 },
    { employeeId: caller.id, metric: "cold_calls", period: "daily", targetValue: 30 },
    { employeeId: caller.id, metric: "zoom_meetings", period: "daily", targetValue: 2 },
  ];

  for (const t of defaultTargets) {
    const existing = await prisma.target.findFirst({
      where: { employeeId: t.employeeId, metric: t.metric, period: t.period, active: true },
    });
    if (!existing) {
      await prisma.target.create({ data: t });
    }
  }

  console.log("Seed complete:", { social: social.id, caller: caller.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
