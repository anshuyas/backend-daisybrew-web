import mongoose, { Schema, Document } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true, enum: ["Coffee", "Matcha", "Smoothies", "Bubble Tea", "Tea"] },
    isAvailable: {type: Boolean, default: true},
},
  { timestamps: true }
);

export default mongoose.model<IMenuItem>("MenuItem", MenuSchema);
