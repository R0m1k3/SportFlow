import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword } from '@/lib/auth';
import { User as UserType } from '@/types';
import { IUser } from '@/models/User'; // Import IUser

export async function POST(request: Request) {
  await dbConnect(); // Ensure connection to MongoDB
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required." }, { status: 400 });
    }

    const user: IUser | null = await User.findOne({ $or: [{ email: username }, { name: username }] });

    if (!user) {
      return NextResponse.json({ message: "Nom d'utilisateur ou mot de passe incorrect." }, { status: 401 });
    }

    const isPasswordValid = comparePassword(password, user.password);

    if (isPasswordValid) {
      const { password: _, ...userWithoutPassword } = user.toObject(); // Convert Mongoose document to plain object and omit password
      return NextResponse.json({ message: "Login successful", user: userWithoutPassword });
    } else {
      return NextResponse.json({ message: "Nom d'utilisateur ou mot de passe incorrect." }, { status: 401 });
    }
  } catch (error) {
    console.error("API: Error during login process:", error);
    return NextResponse.json({ message: "Une erreur est survenue lors de la connexion." }, { status: 500 });
  }
}