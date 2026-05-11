import type { User, UserWithPassword } from '../../../domain/entities/User/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: { email: string; passwordHash: string; name: string; role: User['role'] }): Promise<User>;
  update(
    id: number,
    data: { name?: string; email?: string; passwordHash?: string },
  ): Promise<User>;
}
