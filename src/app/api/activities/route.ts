import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/models/Activity';
import { Activity as ActivityType } from '@/types';

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json({ message: "User email is required." }, { status: 400 });
    }

    const activities = await Activity.find({ userEmail }).sort({ date: -1 }); // Sort by date descending
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ message: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { userEmail, date, type, duration } = await request.json();

    const newActivity = await Activity.create({ userEmail, date, type, duration });

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error("Error adding activity:", error);
    return NextResponse.json({ message: "Failed to add activity" }, { status: 500 });
  }
}