import { Router, Request, Response } from 'express';
import { GetAllUsersUseCase } from '../../application/usecases/User/GetAllUsersUseCase';
import { CreateUserUseCase } from '../../application/usecases/User/CreateUserUseCase';
import { DatabaseUserRepository } from '../../infrastructure/users/database/DatabaseUserRepository';
import { authMiddleware, requireRole } from '../../infrastructure/web/authMiddleware';
import type { UserRole } from '../../domain/entities/User/User';

const router = Router();
const userRepository = new DatabaseUserRepository();
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const createUserUseCase = new CreateUserUseCase(userRepository);

const adminOnly = [authMiddleware, requireRole('administrator')];

router.get('/users', adminOnly, async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsersUseCase.execute();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/users', adminOnly, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body || {};
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const validRoles: UserRole[] = ['administrator', 'manager', 'operator'];
    const userRole = validRoles.includes(role) ? role : 'operator';
    const user = await createUserUseCase.execute({
      email,
      password,
      name: typeof name === 'string' ? name : email,
      role: userRole,
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export { router as userRouter };
