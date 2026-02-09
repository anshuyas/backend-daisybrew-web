import { IUser, UserModel } from "../models/user.model";

export class UserRepository {
  getUserById(id: any) {
      throw new Error('Method not implemented.');
  }
  
  async createUser(user: Partial<IUser>) {
    return UserModel.create(user);
  }

  async findUserByEmail(email: string) {
    return UserModel.findOne({ email }).select('+password'); // always select password
  }
  
  async findByResetPasswordToken(token: string) {
  return UserModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password');
}
}
