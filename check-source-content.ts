import { Pool as PgPool } from 'pg';

// Setup for source database using provided connection details
const sourcePool = new PgPool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

async function checkSourceContent() {
  console.log('Checking source database content count...');
  
  try {
    // First check what tables exist
    const tablesResult = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name ILIKE '%content%'
    `);
    
    console.log('Available content-related tables:');
    tablesResult.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    // Check the Content table specifically
    const countResult = await sourcePool.query(`SELECT COUNT(*) as total FROM "Content"`);
    console.log(`Content table has ${countResult.rows[0].total} records`);
    
    // Check first few records to see structure
    const sampleResult = await sourcePool.query(`SELECT "ID", "Title" FROM "Content" LIMIT 5`);
    console.log('Sample content records:');
    sampleResult.rows.forEach(row => {
      console.log(`- ${row.ID}: ${row.Title?.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('Error checking source:', error);
  } finally {
    await sourcePool.end();
  }
}

checkSourceContent().catch(console.error);