import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  DATABASE_CLIENT: z.literal('sqlite3').default('sqlite3'),
  DATABASE_FILENAME: z.string().default('./data/app.db'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment variables:\n${message}`);
}

export const env = parsed.data;


