import { IUser, UserModel } from "../models/user.model";

export interface IUserRepository {
    getUserByUsername(username: string): Promise<IUser | null>;
    getUserByEmail(email: string): Promise<IUser | null>;
    // additional 
    createUser(data: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>; // get one
    getAllUsers(): Promise<IUser[]>; // get all 
    updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null>; // update one
    deleteOneUser(id: string): Promise<boolean | null>; // delete one 
}
// UserModel -> db.users collection
export class UserRepository implements IUserRepository {
    async createUser(data: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(data); // MongoDb Model
        return await user.save();
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "email": email });
        return user;
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "username": username });
        return user;
    }

    async getUserById(id: string): Promise<IUser | null> {
        // UserModel.findOne({"_id": id})
        const user = await UserModel.findById(id);
        return user;
    }
    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }
    async updateOneUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        // UserModel.updateOne({"_id": id}, {$set: data})
        const updatedUser = await UserModel.findByIdAndUpdate(id, data, { new: true });
        return updatedUser;
    }
    async deleteOneUser(id: string): Promise<boolean | null> {
        // UserModel.deleteOne({"_id": id})
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : null;
    }
}