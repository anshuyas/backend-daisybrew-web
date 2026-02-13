import mongoose, { Schema, Document } from 'mongoose';
import { required } from 'zod/v4/core/util.cjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  image?: string; 
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>({
  fullName: {type: String, required: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  image: { type: String },

  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date },

}, 
{ timestamps: true });

export const UserModel = mongoose.model<IUser>('User', userSchema);
