import { db } from "./db";
import { freeSlots, activities, userActivities } from "./db/schema";
import { eq, and, gte } from "drizzle-orm";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(freeStart: string, freeEnd: string, actStart: string, actEnd: string): boolean {
  return timeToMinutes(actStart) >= timeToMinutes(freeStart) &&
    timeToMinutes(actEnd) <= timeToMinutes(freeEnd);
}

export async function getRecommendations(userId: string) {
  const slots = await db.select().from(freeSlots).where(eq(freeSlots.userId, userId));
  const saved = await db.select({ activityId: userActivities.activityId })
    .from(userActivities).where(eq(userActivities.userId, userId));
  const savedIds = saved.map((s) => s.activityId);
  const today = new Date().toISOString().split("T")[0];
  const allActivities = await db.query.activities.findMany({
    where: and(eq(activities.isActive, true), gte(activities.validUntil, today)),
    with: { slots: true, category: true },
  });
  const results = [];
  for (const activity of allActivities) {
    if (savedIds.includes(activity.id)) continue;
    for (const slot of activity.slots) {
      const matching = slots.find((fs) =>
        fs.dayOfWeek === slot.dayOfWeek &&
        overlaps(fs.startTime, fs.endTime, slot.startTime, slot.endTime)
      );
      if (matching) {
        results.push({ activity, matchedSlot: matching });
        break;
      }
    }
  }
  return results;
}
