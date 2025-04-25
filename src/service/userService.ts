import { UserRepository } from "../repository/userRepository";
import { UserInput } from "../schema/userSchema";
import { hashPassword } from "../utils/bcrypt";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(name: string) {
    return await this.userRepository.findAll(name);
  }

  async getUserById(id: number) {
    return await this.userRepository.findById(id);
  }

  async createUser(userData: UserInput) {
    const createData = {
      ...userData,
      password: await hashPassword(userData.password),
    };
    return await this.userRepository.create(createData);
  }

  async updateUser(id: number, userData: Partial<UserInput>) {
    return await this.userRepository.update(id, userData);
  }

  async deleteUser(id: number) {
    return await this.userRepository.delete(id);
  }
}
