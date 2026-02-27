import { connectDatabaseTest } from "../database/mongodb";
import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

jest.setTimeout(20000);

beforeAll(async () => {
    await connectDatabaseTest();
});

afterAll(async () => {
    await mongoose.connection.close();
});
