import { NextResponse } from 'next/server';
import db, { WrappedStatement } from '@/lib/sqlite'; // Removed mapRowToActivity
import { Activity } from '@/types';

export async function GET(request: Request) {
  let stmt: WrappedStatement | undefined;
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ message: "User email is required." }, { status: 400 });
    }

    stmt = db.prepare("SELECT * FROM activities WHERE userEmail = ? ORDER BY date DESC"); // No longer await
    const activities: Activity[] = stmt.all(userEmail); // better-sqlite3 returns objects directly
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ message: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let stmt: WrappedStatement | undefined;
  try {
    const { userEmail, date, type, duration } = await request.json();
    stmt = db.prepare("INSERT INTO activities (userEmail, date, type, duration) VALUES (?, ?, ?, ?)"); // No longer await
    const info = stmt.run(userEmail, date, type, duration);
    return NextResponse.json({ id: info.lastInsertRowid, userEmail, date, type, duration }, { status: 201 });
  } catch (error) {
    console.error("Error adding activity:", error);
    return NextResponse.json({ message: "Failed to add activity" }, { status: 500 });
  }
}