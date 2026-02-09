import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'user' | 'admin';
  image?: string; 
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  image: { type: String },

  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, 
{ timestamps: true });

export const UserModel = mongoose.model<IUser>('User', userSchema);
