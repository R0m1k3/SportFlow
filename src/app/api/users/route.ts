import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/json-db'; // Ensure correct import path
import { hashPassword } from '@/lib/auth';
import { User } from '@/types';

export async function GET() {
  try {
    const db = await readDb();
    // Explicitly type the parameter for destructuring
    const users: Omit<User, 'password'>[] = db.users.map(({ password, ...rest }: User) => rest);
    console.log("API GET /api/users - Fetched users (excluding password):", db.users.map((u: User) => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    const db = await readDb();

    // Check if user with same email or name already exists
    const existingUser = db.users.find((u: User) => u.email === email || u.name === name);
    
    if (existingUser) {
      console.warn("API POST /api/users - User with this email or name already exists:", email, name);
      return NextResponse.json({ message: "User with this email or name already exists." }, { status: 409 });
    }

    const hashedPassword = hashPassword(password);
    const newUser: User = {
      id: db.users.length > 0 ? Math.max(...db.users.map((u: User) => u.id || 0)) + 1 : 1,
      name,
      email,
      password: hashedPassword,
      role,
    };
    db.users.push(newUser);
    await writeDb(db);

    console.log("API POST /api/users - User added:", { id: newUser.id, name, email, role });
    const { password: _, ...userWithoutPassword } = newUser; // Omit password from response
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ message: "Failed to add user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, email, password, role } = await request.json();

    if (!id) {
      console.warn("API PUT /api/users - User ID is required for update.");
      return NextResponse.json({ message: "User ID is required for update." }, { status: 400 });
    }

    const db = await readDb();
    const userIndex = db.users.findIndex((u: User) => u.id === id);

    if (userIndex === -1) {
      console.warn("API PUT /api/users - User not found for ID:", id);
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const existingUser = db.users[userIndex];
    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = hashPassword(password);
      console.log("API PUT /api/users - Password updated for user ID:", id);
    }

    const updatedUser: User = {
      ...existingUser,
      name,
      email,
      password: hashedPassword,
      role,
    };
    db.users[userIndex] = updatedUser;
    await writeDb(db);

    console.log("API PUT /api/users - User updated successfully for ID:", id);
    return NextResponse.json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      console.warn("API DELETE /api/users - User ID is required for deletion.");
      return NextResponse.json({ message: "User ID is required for deletion." }, { status: 400 });
    }

    const db = await readDb();
    const initialLength = db.users.length;
    db.users = db.users.filter((u: User) => u.id !== id);

    if (db.users.length === initialLength) {
      console.warn("API DELETE /api/users - User not found for deletion with ID:", id);
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    await writeDb(db);

    console.log("API DELETE /api/users - User deleted successfully for ID:", id);
    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}