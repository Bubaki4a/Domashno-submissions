import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/integration/**/*.integration.test.ts'],
    environment: 'node',
    globalSetup: [path.resolve(__dirname, 'tests/integration/helpers/globalSetup.integration.ts')],
  },
});
