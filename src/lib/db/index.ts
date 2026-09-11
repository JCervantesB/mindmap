import "server-only";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { getEnv } from '@/env';
import * as schema from './schema';

const sql = neon(getEnv().DATABASE_URL!);

export const db = drizzle(sql, { schema });
