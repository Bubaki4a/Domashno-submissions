import bcrypt from 'bcrypt';
import type { IUserRepository } from '../../../infrastructure/users/interfaces/IUserRepository';
import type { User, UserRole } from '../../../domain/entities/User/User';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('User with this email already exists');
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    return this.userRepository.create({
      email,
      passwordHash,
      name: input.name.trim(),
      role: input.role,
    });
  }
}
