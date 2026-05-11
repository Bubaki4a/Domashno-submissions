import type { Express } from 'express';
import request from 'supertest';

/** Default admin credentials used by seed (seedAdmin.ts). */
export const TEST_ADMIN_EMAIL = 'k@k.com';
export const TEST_ADMIN_PASSWORD = '1';

export interface LoginResult {
  token: string;
  user: { id: number; email: string; name: string; role: string };
}

/**
 * Log in with seeded admin user and return token and user.
 * Use the returned token in Authorization: Bearer <token> for protected routes.
 */
export async function loginAsAdmin(app: Express): Promise<LoginResult> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
    .expect(200);

  const body = res.body as { success: boolean; data: { user: LoginResult['user']; token: string } };
  if (!body.success || !body.data?.token || !body.data?.user) {
    throw new Error('Login failed: expected success, token and user in response');
  }
  return {
    token: body.data.token,
    user: body.data.user,
  };
}

