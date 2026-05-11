import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createServer } from '../../../src/infrastructure/web/server';

const app = createServer();

describe('API integration: health and root', () => {
  describe('GET /health', () => {
    it('returns 200 and { status: "ok" }', async () => {
      const res = await request(app).get('/health').expect(200);
      expect(res.body).toMatchObject({ status: 'ok' });
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /', () => {
    it('returns 200 and API info with endpoints', async () => {
      const res = await request(app).get('/').expect(200);
      expect(res.body).toMatchObject({ message: 'Product Optimizer API', version: '1.0.0' });
      expect(res.body.endpoints).toBeDefined();
      expect(res.body.endpoints.health).toBe('/health');
      expect(res.body.endpoints.providers).toBe('GET /api/providers');
    });
  });
});
