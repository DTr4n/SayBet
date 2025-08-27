import { Activity } from "@/types";

export async function getActivities(): Promise<Activity[]> {
  // TODO: Implement database query
  return [];
}

export async function createActivity(
  activityData: Omit<Activity, "id" | "createdAt" | "updatedAt">
): Promise<Activity> {
  // TODO: Implement database insert
  throw new Error("Not implemented");
}

export async function updateActivity(
  id: string,
  updates: Partial<Activity>
): Promise<Activity> {
  // TODO: Implement database update
  throw new Error("Not implemented");
}

export async function deleteActivity(id: string): Promise<void> {
  // TODO: Implement database delete
  throw new Error("Not implemented");
}