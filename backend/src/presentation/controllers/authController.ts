import { Router, Response } from 'express';
import { LoginUseCase } from '../../application/usecases/Auth/LoginUseCase';
import { GetMeUseCase } from '../../application/usecases/Auth/GetMeUseCase';
import { UpdateProfileUseCase } from '../../application/usecases/Auth/UpdateProfileUseCase';
import { DatabaseUserRepository } from '../../infrastructure/users/database/DatabaseUserRepository';
import { authMiddleware, type AuthRequest } from '../../infrastructure/web/authMiddleware';

const router = Router();
const userRepository = new DatabaseUserRepository();
const loginUseCase = new LoginUseCase(userRepository);
const getMeUseCase = new GetMeUseCase(userRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);

router.post('/auth/login', async (req: { body: { email?: string; password?: string } }, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || typeof email !== 'string' || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }
    const result = await loginUseCase.execute({ email, password });
    res.status(200).json({
      success: true,
      data: { user: result.user, token: result.token },
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(401).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const user = await getMeUseCase.execute(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.put('/auth/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const { name, email, currentPassword, newPassword } = req.body || {};
    const user = await updateProfileUseCase.execute({
      userId: req.user.id,
      name: typeof name === 'string' ? name : undefined,
      email: typeof email === 'string' ? email : undefined,
      currentPassword: typeof currentPassword === 'string' ? currentPassword : undefined,
      newPassword: typeof newPassword === 'string' ? newPassword : undefined,
    });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export { router as authRouter };
