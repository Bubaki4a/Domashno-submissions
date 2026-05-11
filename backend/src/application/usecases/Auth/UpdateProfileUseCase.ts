import bcrypt from 'bcrypt';
import type { IUserRepository } from '../../../infrastructure/users/interfaces/IUserRepository';
import type { User } from '../../../domain/entities/User/User';

export interface UpdateProfileInput {
  userId: number;
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateProfileInput): Promise<User> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new Error('User not found');
    const userWithPassword = await this.userRepository.findByEmail(user.email);
    if (!userWithPassword || userWithPassword.id !== input.userId) {
      throw new Error('User not found');
    }

    const updates: { name?: string; email?: string; passwordHash?: string } = {};

    if (input.name !== undefined) {
      updates.name = input.name.trim();
      if (!updates.name) throw new Error('Name cannot be empty');
    }

    if (input.email !== undefined) {
      const email = input.email.trim().toLowerCase();
      if (!email) throw new Error('Email cannot be empty');
      const existing = await this.userRepository.findByEmail(email);
      if (existing && existing.id !== input.userId) {
        throw new Error('Email is already in use');
      }
      updates.email = email;
    }

    if (input.newPassword !== undefined && input.newPassword !== '') {
      if (!input.currentPassword) {
        throw new Error('Current password is required to set a new password');
      }
      const valid = await bcrypt.compare(input.currentPassword, userWithPassword.passwordHash);
      if (!valid) throw new Error('Current password is incorrect');
      updates.passwordHash = await bcrypt.hash(input.newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      const user = await this.userRepository.findById(input.userId);
      if (!user) throw new Error('User not found');
      return user;
    }

    return this.userRepository.update(input.userId, updates);
  }
}
