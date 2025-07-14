export type ActivityType = "vélo" | "musculation" | "fitness" | "basket";

export interface Activity {
  _id?: string; // Re-added for frontend compatibility with API responses
  userEmail: string;
  date: string; // ISO String YYYY-MM-DD
  type: ActivityType;
  duration: number; // in minutes
}

export type UserRole = "admin" | "user";

export interface User {
  _id?: string; // Re-added for frontend compatibility with API responses
  email: string; // unique
  name: string;
  password: string; // In a real app, this would be a hash
  role: UserRole;
}