import mongoose, { Schema, Document } from 'mongoose';
import { User as UserType, UserRole } from '@/types';

export interface IUser extends Omit<UserType, '_id'>, Document {}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
});

// Export the model. If it already exists, use the existing one.
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;