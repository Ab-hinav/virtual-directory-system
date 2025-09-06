import type { Knex } from 'knex';
import path from 'node:path';
import dotenv from 'dotenv';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const here = (...p: string[]) => path.resolve(__dirname, ...p);

const envDb = process.env.DATABASE_FILENAME ?? './data/app.db';
const databaseFilename = path.isAbsolute(envDb) ? envDb : here(envDb);

fs.mkdirSync(path.dirname(databaseFilename), { recursive: true });

const shared: Omit<Knex.Config, 'connection'> = {
  client: 'sqlite3',
  useNullAsDefault: true,
  migrations: {
    directory: here('migrations'),
    extension: 'ts',
    loadExtensions: ['.ts', '.js'],
  },
  seeds: {
    directory: here('seeds'),
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
