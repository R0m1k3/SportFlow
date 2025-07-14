import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/json-db'; // Ensure correct import path
import { Activity } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ message: "User email is required." }, { status: 400 });
    }

    const db = await readDb();
    const activities: Activity[] = db.activities.filter((act: Activity) => act.userEmail === userEmail);
    
    return NextResponse.json(activities.sort((a: Activity, b: Activity) => b.date.localeCompare(a.date)));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ message: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userEmail, date, type, duration } = await request.json();

    const db = await readDb();
    const newActivity: Activity = {
      id: db.activities.length > 0 ? Math.max(...db.activities.map((a: Activity) => a.id || 0)) + 1 : 1,
      userEmail,
      date,
      type,
      duration,
    };
    db.activities.push(newActivity);
    await writeDb(db);

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error("Error adding activity:", error);
    return NextResponse.json({ message: "Failed to add activity" }, { status: 500 });
  }
}