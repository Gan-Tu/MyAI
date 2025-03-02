import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function query(text: string, params?: any[]) {
  try {
    const res = await sql(text, params);
    return { rows: res };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
