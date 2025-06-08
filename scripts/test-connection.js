const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_mdSgtJp8b4Yl@ep-dark-term-a5n1nxn8-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function testConnection() {
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Attempting to connect to database...');
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    
    console.log('✅ Successfully connected to database!');
    console.log('Current database time:', result.rows[0].current_time);
    
    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\nExisting tables in database:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    client.release();
  } catch (err) {
    console.error('❌ Error connecting to database:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection(); 