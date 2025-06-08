const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_mdSgtJp8b4Yl@ep-dark-term-a5n1nxn8-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function migrate() {
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Starting database migration...');

    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Read migration files
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    // Get executed migrations
    const { rows: executedMigrations } = await pool.query(
      'SELECT name FROM migrations'
    );
    const executedNames = executedMigrations.map(row => row.name);

    for (const file of sqlFiles) {
      if (executedNames.includes(file)) {
        console.log(`Migration ${file} already executed, skipping...`);
        continue;
      }

      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf-8');

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`✅ Successfully executed migration: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    console.log('✅ All migrations completed successfully!');
  } catch (err) {
    console.error('❌ Error during migration:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate(); 