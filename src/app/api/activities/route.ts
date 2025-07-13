import { NextResponse } from 'next/server';
import db from '@/lib/sqlite'; // Import the new dbWrapper
import { Activity } from '@/types';

export async function GET(request: Request) {
  let stmt;
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ message: "User email is required." }, { status: 400 });
    }

    stmt = await db.prepare("SELECT * FROM activities WHERE userEmail = ? ORDER BY date DESC");
    const activities = stmt.all(userEmail) as Activity[];
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ message: "Failed to fetch activities" }, { status: 500 });
  } finally {
    if (stmt) stmt.finalize();
  }
}

export async function POST(request: Request) {
  let stmt;
  try {
    const { userEmail, date, type, duration } = await request.json();
    stmt = await db.prepare("INSERT INTO activities (userEmail, date, type, duration) VALUES (?, ?, ?, ?)");
    const info = stmt.run(userEmail, date, type, duration);
    stmt.finalize(); // Finalize after use
    return NextResponse.json({ id: info.lastInsertRowid, userEmail, date, type, duration }, { status: 201 });
  } catch (error) {
    console.error("Error adding activity:", error);
    return NextResponse.json({ message: "Failed to add activity" }, { status: 500 });
  } finally {
    if (stmt) stmt.finalize();
  }
}