import { Pool } from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_mdSgtJp8b4Yl@ep-dark-term-a5n1nxn8-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Create a connection pool
const pool = new Pool({
  connectionString,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl: {
    rejectUnauthorized: false // Required for Neon's SSL connection
  }
});

// Event handlers for the pool
pool.on('connect', () => {
  console.log('Database pool connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Function to execute queries with automatic retries
export async function query(text: string, params?: any[], retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`Database query attempt ${i + 1} failed:`, error);
      lastError = error;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
    }
  }
  throw lastError;
}

// Function to execute a transaction
export async function transaction<T>(callback: (client: any) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Function to check database health
export async function checkDatabaseHealth() {
  try {
    const result = await query('SELECT NOW() as current_time');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      poolSize: pool.totalCount,
      waitingCount: pool.waitingCount,
      idleCount: pool.idleCount
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

// Function to close the pool (useful for testing and graceful shutdown)
export async function closePool() {
  await pool.end();
}

// Export the pool for direct access if needed
export { pool }; 