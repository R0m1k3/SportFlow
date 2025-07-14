import { NextResponse } from 'next/server';
import db, { WrappedStatement } from '@/lib/sqlite'; // Removed mapRowToUser
import { comparePassword } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: Request) {
  console.log("API: /api/auth/login POST request received.");
  let stmt: WrappedStatement | undefined;

  try {
    console.log("API: Parsing request body...");
    const { username, password } = await request.json();
    console.log("API: Request body parsed. Username:", username);

    if (!username || !password) {
      console.warn("API: Missing username or password.");
      return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
    }

    console.log("API: Attempting to find user in DB...");
    stmt = db.prepare("SELECT * FROM users WHERE email = ? OR name = ?"); // No longer await
    const user: User | undefined = stmt.get(username, username); // better-sqlite3 returns object or undefined
    console.log("API: User lookup complete. User found:", !!user);

    if (!user) {
      console.warn("API: User not found for username:", username);
      return NextResponse.json({ message: "Nom d'utilisateur ou mot de passe incorrect." }, { status: 401 });
    }

    console.log("API: Comparing password...");
    const isPasswordValid = comparePassword(password, user.password);
    console.log("API: Password comparison result:", isPasswordValid);

    if (isPasswordValid) {
      const { password: _, ...userWithoutPassword } = user;
      console.log("API: Login successful for user:", user.email);
      return NextResponse.json({ message: "Login successful", user: userWithoutPassword });
    } else {
      console.warn("API: Invalid password for user:", user.email);
      return NextResponse.json({ message: "Nom d'utilisateur ou mot de passe incorrect." }, { status: 401 });
    }
  } catch (error) {
    console.error("API: Error during login process:", error);
    return NextResponse.json({ message: "Une erreur est survenue lors de la connexion." }, { status: 500 });
  }
}