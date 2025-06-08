const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_mdSgtJp8b4Yl@ep-dark-term-a5n1nxn8-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function runMigration() {
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'migrations', '001_initial_schema.sql');
    const sql = await fs.readFile(migrationPath, 'utf-8');

    console.log('Starting migration...');
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('✅ Migration completed successfully!');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    // Verify tables were created
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('\nCreated tables:');
    rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration(); 