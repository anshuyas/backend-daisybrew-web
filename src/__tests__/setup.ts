import { connectDatabaseTest } from "../database/mongodb";
import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

jest.setTimeout(20000);

jest.mock("multer", () => {
  const mMulter = () => ({
    single: jest.fn(() => (req: any, res: any, next: any) => next()),
  });
  mMulter.diskStorage = jest.fn(() => ({})); 
  return mMulter;
});

beforeAll(async () => {
    await connectDatabaseTest();
});

afterAll(async () => {
    await mongoose.connection.close();
});
