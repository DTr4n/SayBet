export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  availabilityStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  timeframe: string;
  location: string;
  hostId: string;
  host: User;
  type: "spontaneous" | "planned" | "completed";
  vibe: "active" | "casual" | "social" | "chill" | "foodie" | "competitive";
  visibility: "friends" | "previous" | "open";
  interested: string[];
  joinRequests: Record<string, "interested" | "maybe" | "not_interested">;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: "pending" | "accepted" | "blocked";
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityResponse {
  id: string;
  activityId: string;
  userId: string;
  response: "interested" | "maybe" | "not_interested";
  createdAt: Date;
  updatedAt: Date;
}

export interface PreviousConnection {
  id: string;
  userId: string;
  connectedUserId: string;
  lastActivityId: string;
  activityCount: number;
  lastInteraction: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AvailabilityStatus =
  | "Free right now"
  | "Free this evening"
  | "Free this weekend"
  | "Down for coffee this week"
  | "Looking for weekend plans"
  | "Free for spontaneous hangouts"
  | "Busy until Friday";

export interface AIActivitySuggestion {
  id: number;
  title: string;
  description: string;
  type: string;
  timeframe: string;
  location: string;
  vibe: Activity["vibe"];
}