import { NextResponse } from 'next/server';
import db from '@/lib/sqlite';
import { comparePassword } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
    }

    // Find user by email or name
    const user = db.prepare("SELECT * FROM users WHERE email = ? OR name = ?").get(username, username) as User;

    if (!user) {
      console.warn("API POST /api/auth/login - User not found for username:", username);
      return NextResponse.json({ message: "Nom d'utilisateur ou mot de passe incorrect." }, { status: 401 });
    }

    // Compare password securely on the server
    const isPasswordValid = comparePassword(password, user.password);

    if (isPasswordValid) {
      // Exclude password from the response for security
      const { password: _, ...userWithoutPassword } = user;
      console.log("API POST /api/auth/login - Login successful for user:", user.email);
      return NextResponse.json({ message: "Login successful", user: userWithoutPassword });
    } else {
      console.warn("API POST /api/auth/login - Invalid password for user:", user.email);
      return NextResponse.json({ message: "Nom d'utilisateur ou mot de passe incorrect." }, { status: 401 });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ message: "Une erreur est survenue lors de la connexion." }, { status: 500 });
  }
}