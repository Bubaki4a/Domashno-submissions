import type { IUserRepository } from '../../../infrastructure/users/interfaces/IUserRepository';
import type { User } from '../../../domain/entities/User/User';

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
