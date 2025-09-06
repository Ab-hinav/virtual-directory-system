// Jest setup file for database initialization
import { db } from '../db/knex';

beforeAll(async () => {
  // Run migrations for test database
  await db.migrate.latest();
});

afterAll(async () => {
  // Clean up database connection
  await db.destroy();
});
