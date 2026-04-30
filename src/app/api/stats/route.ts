import { NextRequest, NextResponse } from "next/server";
import { parseDateRange } from "@/lib/utils";
import {
  getEmployeeStats,
  getDailyTimeSeries,
  getOverviewStats,
  getTargetProgress,
} from "@/lib/stats";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const range = parseDateRange(sp);
  const employeeId = sp.get("employeeId");
  const include = sp.get("include")?.split(",") || ["overview"];

  const result: Record<string, unknown> = {
    range: { from: range.from.toISOString(), to: range.to.toISOString(), label: range.label },
  };

  if (include.includes("overview")) {
    result.overview = await getOverviewStats(range);
  }
  if (employeeId) {
    if (include.includes("stats")) result.stats = await getEmployeeStats(employeeId, range);
    if (include.includes("timeseries"))
      result.timeseries = await getDailyTimeSeries(employeeId, range);
    if (include.includes("targets"))
      result.targets = await getTargetProgress(employeeId, range);
  }

  return NextResponse.json(result);
}
