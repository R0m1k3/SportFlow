import { NextResponse } from 'next/server';
import db from '@/lib/sqlite';
import { hashPassword, comparePassword } from '@/lib/auth';
import { User } from '@/types';

export async function GET() {
  try {
    const users = db.prepare("SELECT id, email, name, role FROM users").all() as User[];
    console.log("API GET /api/users - Fetched users (excluding password):", users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // Check if user with same email or name already exists
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ? OR name = ?").get(email, name);
    if (existingUser) {
      console.warn("API POST /api/users - User with this email or name already exists:", email, name);
      return NextResponse.json({ message: "User with this email or name already exists." }, { status: 409 });
    }

    const hashedPassword = hashPassword(password);
    const info = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(name, email, hashedPassword, role);
    console.log("API POST /api/users - User added:", { id: info.lastInsertRowid, name, email, role });
    return NextResponse.json({ id: info.lastInsertRowid, name, email, role }, { status: 201 });
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

    const existingUser = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User;
    if (!existingUser) {
      console.warn("API PUT /api/users - User not found for ID:", id);
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = hashPassword(password);
      console.log("API PUT /api/users - Password updated for user ID:", id);
    }

    db.prepare("UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?").run(name, email, hashedPassword, role, id);
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
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    console.log("API DELETE /api/users - User deleted successfully for ID:", id);
    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}