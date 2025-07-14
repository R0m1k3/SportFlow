import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  await dbConnect();
  try {
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      const hashedPassword = hashPassword("admin");
      await User.create({
        name: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Default admin user created.");
      return NextResponse.json({ message: "Default admin user created successfully (username: admin, password: admin)." }, { status: 201 });
    } else {
      return NextResponse.json({ message: "Users already exist. No default admin user created." }, { status: 200 });
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json({ message: "Failed to seed database with default admin user." }, { status: 500 });
  }
}