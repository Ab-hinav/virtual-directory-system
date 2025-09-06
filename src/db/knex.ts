import knex, { Knex } from 'knex';
import { env } from '../config/env';
import path from 'node:path';
import fs from 'node:fs';

const databaseFilePath = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.resolve(process.cwd(), env.DATABASE_FILENAME);

const databaseDirPath = path.dirname(databaseFilePath);

if (process.env.NODE_ENV !== 'test' && !fs.existsSync(databaseDirPath)) {
  fs.mkdirSync(databaseDirPath, { recursive: true });
}


const knexConfig: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: {
    filename: databaseFilePath,
    timezone: 'IST'
  },
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
  pool: { min: 1, max: 5 },
};

export const db = knex(knexConfig);
export type Database = typeof db;




