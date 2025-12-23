import { verify } from "hono/jwt";
import { UserRepository } from "../repository/userRepository";
import { UserInput, UserPasswordInput, UserProfileInput } from "../schema/userSchema";
import { hashPassword, verifyPassword } from "../utils/bcrypt";
import { ApiException } from "../utils/apiException";
import { password } from "bun";

export class UserService {
  constructor(private userRepository: UserRepository) { }

  async getAllUsers(name: string) {
    return await this.userRepository.findAll2(name);
  }

  async getUserById(id: number) {
    return await this.userRepository.findById2(id);
  }

  async createUser(userData: UserInput, creator: number) {
    const createData = {
      ...userData,
      password: await hashPassword(userData.password),
      createdBy: creator
    };
    return await this.userRepository.create(createData);
  }

  async updateUser(id: number, userData: Partial<UserInput>, updater: number) {
    if (!!userData.password) {
      const hashedPassword = await hashPassword(userData.password);
      userData.password = hashedPassword;
    }
    const updateData = { ...userData, updatedBy: updater };
    return await this.userRepository.update(id, updateData);
  }

  async updateUserProfile(id: number, userData: Partial<UserProfileInput>, updater: number) {
    const updateData = { ...userData, updatedBy: updater };
    return await this.userRepository.update(id, updateData);
  }

  async updateUserPassword(id: number, userData: UserPasswordInput, updater: number) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new ApiException(401, "Invalid credentials");
    }

    const isValid = await verifyPassword(userData.currentPassword, user.password);
    if (!isValid) {
      throw new ApiException(400, "Invalid password");
    }

    const hashedPassword = await hashPassword(userData.newPassword);

    const updateData = { password: hashedPassword, updatedBy: updater };

    return await this.userRepository.update(id, updateData);
  }

  async inactiveUserAccount(id: number, updater: number) {
    const updateData = { active: false, updatedBy: updater };

    return await this.userRepository.update(id, updateData);
  }

  async deleteUser(id: number) {
    return await this.userRepository.delete(id);
  }

  async deleteUsers(ids: number[]) {
    return await this.userRepository.deleteAll(ids);
  }
}
