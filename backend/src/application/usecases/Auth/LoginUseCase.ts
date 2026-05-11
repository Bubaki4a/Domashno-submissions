import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { IUserRepository } from '../../../infrastructure/users/interfaces/IUserRepository';
import type { User } from '../../../domain/entities/User/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const userWithPassword = await this.userRepository.findByEmail(input.email.trim());
    if (!userWithPassword) {
      throw new Error('Invalid email or password');
    }
    const valid = await bcrypt.compare(input.password, userWithPassword.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }
    const user: User = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.name,
      role: userWithPassword.role,
      createdAt: userWithPassword.createdAt,
    };
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
    return { user, token };
  }
}
