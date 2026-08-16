import 'dotenv/config';

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-vitest';
}
