import { Pool as PgPool } from 'pg';

const sourcePool = new PgPool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

async function checkContentColumns() {
  try {
    const result = await sourcePool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Content' 
      ORDER BY ordinal_position
    `);
    
    console.log('Content table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sourcePool.end();
  }
}

checkContentColumns().catch(console.error);