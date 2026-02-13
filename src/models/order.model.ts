import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: {
    name: string;
    quantity: number;
    price: number;
    size?: string;
    temperature?: string;
  }[];
  total: number;
  status: "confirmed" | "ready" | "out" | "delivered" | "cancelled";
  deliveryOption: "delivery" | "pickup";
  timeOption: "asap" | "later";
  scheduledTime?: Date | null;
  paymentMethod: "cod" | "online";
  customerDetails: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        size: { type: String },
        temperature: { type: String },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "ready", "out", "delivered", "cancelled"],
      default: "confirmed",
    },
    deliveryOption: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    timeOption: {
      type: String,
      enum: ["asap", "later"],
      required: true,
    },
    scheduledTime: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    customerDetails: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
    },
  },
  { timestamps: true } 
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
