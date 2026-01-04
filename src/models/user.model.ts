import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    firstName: { type: String },
    lastName: { type: String },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, {
    timestamps: true, // createdAt and updatedAt (auto fields)
});

export interface IUser extends UserType, Document { // mongodb related fields
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);