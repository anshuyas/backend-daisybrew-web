import { IUser, UserModel } from "../models/user.model";

export class UserRepository {
  
  async createUser(user: Partial<IUser>) {
    return UserModel.create(user);
  }

  async findUserByEmail(email: string) {
    return UserModel.findOne({ email }).select('+password'); // always select password
  }
}
