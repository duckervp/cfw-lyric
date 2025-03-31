import { UserRepository } from '../repository/userRepository';
import { UserInput } from '../schema/userSchema';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers() {
    return await this.userRepository.findAll()
  }

  async getUserById(id: number) {
    return await this.userRepository.findById(id)
  }
  
  async createUser(userData: UserInput) {
    return await this.userRepository.create(userData)
  }

  async updateUser(id: number, userData: Partial<UserInput>) {
    return await this.userRepository.update(id, userData)
  }

  async deleteUser(id: number) {
    return await this.userRepository.delete(id)
  }
} 