import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { User as UserType } from '@/types';

export async function GET() {
  await dbConnect();
  try {
    const users = await User.find({}).select('-password'); // Exclude password from results
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { name, email, password, role } = await request.json();

    // Check if user with same email or name already exists
    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    
    if (existingUser) {
      return NextResponse.json({ message: "User with this email or name already exists." }, { status: 409 });
    }

    const hashedPassword = hashPassword(password);
    const newUser = await User.create({ name, email, password: hashedPassword, role });

    const { password: _, ...userWithoutPassword } = newUser.toObject(); // Omit password from response
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ message: "Failed to add user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await dbConnect();
  try {
    const { _id, name, email, password, role } = await request.json();

    if (!_id) {
      return NextResponse.json({ message: "User ID is required for update." }, { status: 400 });
    }

    const existingUser = await User.findById(_id);
    if (!existingUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = hashPassword(password);
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { name, email, password: hashedPassword, role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found after update attempt." }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  try {
    const { _id } = await request.json();
    if (!_id) {
      return NextResponse.json({ message: "User ID is required for deletion." }, { status: 400 });
    }

    const result = await User.deleteOne({ _id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}