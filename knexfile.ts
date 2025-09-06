import type { Knex } from 'knex';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const databaseFilename = process.env.DATABASE_FILENAME || './data/app.db';

const shared: Omit<Knex.Config, 'connection'> = {
  client: 'sqlite3',
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(process.cwd(), 'migrations'),
    extension: 'ts',
    loadExtensions: ['.ts', '.js'],
  },
  seeds: {
    directory: path.resolve(process.cwd(), 'seeds'),
    extension: 'ts',
    loadExtensions: ['.ts', '.js'],
  },
};

const config: { [key: string]: Knex.Config } = {
  development: {
    ...shared,
    connection: { filename: databaseFilename },
  },
  test: {
    ...shared,
    connection: { filename: ':memory:' },
  },
  production: {
    ...shared,
    connection: { filename: databaseFilename },
  },
};

export default config;
