import { NextResponse } from 'next/server';
import db, { WrappedStatement } from '@/lib/sqlite'; // Removed mapRowToUser
import { hashPassword } from '@/lib/auth';
import { User } from '@/types';

export async function GET() {
  let stmt: WrappedStatement | undefined;
  try {
    stmt = db.prepare("SELECT id, email, name, role, password FROM users"); // No longer await
    const users: User[] = stmt.all().map(({ password, ...rest }) => rest); // better-sqlite3 returns objects directly
    console.log("API GET /api/users - Fetched users (excluding password):", users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let stmt: WrappedStatement | undefined;
  try {
    const { name, email, password, role } = await request.json();

    // Check if user with same email or name already exists
    stmt = db.prepare("SELECT id FROM users WHERE email = ? OR name = ?"); // No longer await
    const existingUser = stmt.get(email, name); // better-sqlite3 returns object or undefined
    
    if (existingUser) {
      console.warn("API POST /api/users - User with this email or name already exists:", email, name);
      return NextResponse.json({ message: "User with this email or name already exists." }, { status: 409 });
    }

    const hashedPassword = hashPassword(password);
    stmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"); // No longer await
    const info = stmt.run(name, email, hashedPassword, role);

    console.log("API POST /api/users - User added:", { id: info.lastInsertRowid, name, email, role });
    return NextResponse.json({ id: info.lastInsertRowid, name, email, role }, { status: 201 });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ message: "Failed to add user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let stmt: WrappedStatement | undefined;
  try {
    const { id, name, email, password, role } = await request.json();

    if (!id) {
      console.warn("API PUT /api/users - User ID is required for update.");
      return NextResponse.json({ message: "User ID is required for update." }, { status: 400 });
    }

    stmt = db.prepare("SELECT * FROM users WHERE id = ?"); // No longer await
    const existingUser: User | undefined = stmt.get(id); // better-sqlite3 returns object or undefined

    if (!existingUser) {
      console.warn("API PUT /api/users - User not found for ID:", id);
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    let hashedPassword = existingUser.password;
    if (password) {
      hashedPassword = hashPassword(password);
      console.log("API PUT /api/users - Password updated for user ID:", id);
    }

    stmt = db.prepare("UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?"); // No longer await
    stmt.run(name, email, hashedPassword, role, id);

    console.log("API PUT /api/users - User updated successfully for ID:", id);
    return NextResponse.json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  let stmt: WrappedStatement | undefined;
  try {
    const { id } = await request.json();
    if (!id) {
      console.warn("API DELETE /api/users - User ID is required for deletion.");
      return NextResponse.json({ message: "User ID is required for deletion." }, { status: 400 });
    }
    stmt = db.prepare("DELETE FROM users WHERE id = ?"); // No longer await
    stmt.run(id);

    console.log("API DELETE /api/users - User deleted successfully for ID:", id);
    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Failed to delete user" }, { status: 500 });
  }
}