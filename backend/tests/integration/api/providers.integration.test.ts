import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../../../src/infrastructure/web/server';
import { loginAsAdmin } from '../helpers/integrationTestHelpers';

const app = createServer();

describe('API integration: providers', () => {
  describe('GET /api/providers', () => {
    it('returns 401 without token', async () => {
      await request(app).get('/api/providers').expect(401);
    });

    it('returns 200 with list when authenticated', async () => {
      const { token } = await loginAsAdmin(app);
      const res = await request(app)
        .get('/api/providers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body).toBeDefined();
      expect(Array.isArray(res.body.providers)).toBe(true);
    });
  });
});
