import type { IUserRepository } from '../../../infrastructure/users/interfaces/IUserRepository';
import type { User } from '../../../domain/entities/User/User';

export class GetMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: number): Promise<User | null> {
    return this.userRepository.findById(userId);
  }
}
