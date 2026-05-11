import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../../../src/infrastructure/web/server';
import { loginAsAdmin, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from '../helpers/integrationTestHelpers';

const app = createServer();

describe('API integration: auth', () => {
  describe('POST /api/auth/login', () => {
    it('returns 400 when email or password missing', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
      await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_ADMIN_EMAIL })
        .expect(400);
    });

    it('returns 401 for wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@x.com', password: 'wrong' })
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 200 with token and user for seeded admin', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(TEST_ADMIN_EMAIL);
      expect(res.body.data.user.role).toBe('administrator');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without token', async () => {
      await request(app).get('/api/auth/me').expect(401);
    });

    it('returns 200 with user when valid token', async () => {
      const { token } = await loginAsAdmin(app);
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(TEST_ADMIN_EMAIL);
    });
  });
});
