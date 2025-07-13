export type ActivityType = "vélo" | "musculation" | "fitness" | "basket";

export interface Activity {
  id?: number;
  userEmail: string;
  date: string; // ISO String YYYY-MM-DD
  type: ActivityType;
  duration: number; // in minutes
}

export interface User {
  id?: number; // auto-incrementing primary key
  email: string; // unique
  name: string;
  password: string; // In a real app, this would be a hash
}