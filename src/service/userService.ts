import { UserRepository } from "../repository/userRepository";
import { UserInput } from "../schema/userSchema";
import { hashPassword } from "../utils/bcrypt";

export class UserService {
  constructor(private userRepository: UserRepository) { }

  async getAllUsers(name: string) {
    return await this.userRepository.findAll2(name);
  }

  async getUserById(id: number) {
    return await this.userRepository.findById(id);
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

  async deleteUser(id: number) {
    return await this.userRepository.delete(id);
  }
}
