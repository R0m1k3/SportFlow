import mongoose, { Schema, Document } from 'mongoose';
import { Activity as ActivityType } from '@/types';

export interface IActivity extends Omit<ActivityType, '_id'>, Document {}

const ActivitySchema: Schema = new Schema({
  userEmail: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  type: { type: String, enum: ['vélo', 'musculation', 'fitness', 'basket'], required: true },
  duration: { type: Number, required: true },
});

// Export the model. If it already exists, use the existing one.
const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;