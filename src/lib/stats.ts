import { prisma } from "./db";
import { eachDayOfInterval, format, startOfDay, endOfDay } from "date-fns";

export type StatsRange = { from: Date; to: Date };

export async function getEmployeeStats(employeeId: string, range: StatsRange) {
  const where = { employeeId, date: { gte: range.from, lte: range.to } };

  const [
    linkedinPosts,
    linkedinOutreach,
    linkedinReplied,
    linkedinInterested,
    instagramPosts,
    instagramOutreach,
    instagramInterested,
    emails,
    emailsReplied,
    emailsInterested,
    coldCalls,
    coldCallsConnected,
    coldCallsInterested,
    zoomMeetings,
    zoomCompleted,
    leadsProvided,
  ] = await Promise.all([
    prisma.linkedInPost.count({ where }),
    prisma.linkedInOutreach.count({ where }),
    prisma.linkedInOutreach.count({ where: { ...where, status: "replied" } }),
    prisma.linkedInOutreach.count({ where: { ...where, status: "interested" } }),
    prisma.instagramPost.count({ where }),
    prisma.instagramOutreach.count({ where }),
    prisma.instagramOutreach.count({ where: { ...where, status: "interested" } }),
    prisma.email.count({ where }),
    prisma.email.count({ where: { ...where, status: "replied" } }),
    prisma.email.count({ where: { ...where, status: "interested" } }),
    prisma.coldCall.count({ where }),
    prisma.coldCall.count({ where: { ...where, outcome: "connected" } }),
    prisma.coldCall.count({ where: { ...where, outcome: "interested" } }),
    prisma.zoomMeeting.count({
      where: { employeeId, scheduledAt: { gte: range.from, lte: range.to } },
    }),
    prisma.zoomMeeting.count({
      where: { employeeId, scheduledAt: { gte: range.from, lte: range.to }, status: "completed" },
    }),
    prisma.lead.count({
      where: { providedById: employeeId, date: { gte: range.from, lte: range.to } },
    }),
  ]);

  return {
    linkedinPosts,
    linkedinOutreach,
    linkedinReplied,
    linkedinInterested,
    instagramPosts,
    instagramOutreach,
    instagramInterested,
    emails,
    emailsReplied,
    emailsInterested,
    coldCalls,
    coldCallsConnected,
    coldCallsInterested,
    zoomMeetings,
    zoomCompleted,
    leadsProvided,
  };
}

export async function getDailyTimeSeries(employeeId: string, range: StatsRange) {
  const days = eachDayOfInterval({ start: range.from, end: range.to });
  const result = [];
  for (const day of days) {
    const from = startOfDay(day);
    const to = endOfDay(day);
    const where = { employeeId, date: { gte: from, lte: to } };

    const [posts, outreach, igPosts, igOutreach, emails, coldCalls, zoom] = await Promise.all([
      prisma.linkedInPost.count({ where }),
      prisma.linkedInOutreach.count({ where }),
      prisma.instagramPost.count({ where }),
      prisma.instagramOutreach.count({ where }),
      prisma.email.count({ where }),
      prisma.coldCall.count({ where }),
      prisma.zoomMeeting.count({
        where: { employeeId, scheduledAt: { gte: from, lte: to } },
      }),
    ]);

    result.push({
      date: format(day, "MMM d"),
      linkedin_posts: posts,
      linkedin_outreach: outreach,
      instagram_posts: igPosts,
      instagram_outreach: igOutreach,
      emails,
      cold_calls: coldCalls,
      zoom_meetings: zoom,
    });
  }
  return result;
}

export async function getOverviewStats(range: StatsRange) {
  const employees = await prisma.employee.findMany({ where: { active: true } });
  const stats = await Promise.all(
    employees.map(async (e) => ({
      employee: e,
      stats: await getEmployeeStats(e.id, range),
    }))
  );
  return stats;
}

export async function getTargetProgress(employeeId: string, range: StatsRange) {
  const targets = await prisma.target.findMany({
    where: { employeeId, active: true },
  });
  const stats = await getEmployeeStats(employeeId, range);

  const metricMap: Record<string, number> = {
    linkedin_posts: stats.linkedinPosts,
    linkedin_outreach: stats.linkedinOutreach,
    instagram_posts: stats.instagramPosts,
    instagram_outreach: stats.instagramOutreach,
    emails: stats.emails,
    cold_calls: stats.coldCalls,
    zoom_meetings: stats.zoomMeetings,
    leads_provided: stats.leadsProvided,
  };

  const days = Math.max(
    1,
    Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
  );

  return targets.map((t) => {
    const actual = metricMap[t.metric] ?? 0;
    let goal = t.targetValue;
    if (t.period === "daily") goal = t.targetValue * days;
    else if (t.period === "weekly") goal = Math.ceil((t.targetValue * days) / 7);
    else if (t.period === "monthly") goal = Math.ceil((t.targetValue * days) / 30);
    const pct = goal > 0 ? Math.min(100, Math.round((actual / goal) * 100)) : 0;
    return { ...t, actual, expectedGoal: goal, percent: pct };
  });
}
