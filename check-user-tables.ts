import { Pool as PgPool } from 'pg';

const sourcePool = new PgPool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

async function checkUserTables() {
  try {
    // Look for user-related tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%user%' OR table_name ILIKE '%hocsinh%' OR table_name ILIKE '%nhanvien%')
      ORDER BY table_name;
    `;
    
    const tables = await sourcePool.query(tablesQuery);
    console.log('User-related tables found:');
    
    for (const table of tables.rows) {
      console.log(`\n--- ${table.table_name} ---`);
      
      // Get count
      const countResult = await sourcePool.query(`SELECT COUNT(*) FROM "${table.table_name}"`);
      console.log(`Records: ${countResult.rows[0].count}`);
      
      // Get structure
      const columnsQuery = `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table.table_name}' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const columns = await sourcePool.query(columnsQuery);
      console.log('Columns:');
      for (const column of columns.rows) {
        console.log(`  - ${column.column_name}: ${column.data_type}`);
      }
      
      // Get sample data if table has records
      if (countResult.rows[0].count > 0) {
        const sampleQuery = `SELECT * FROM "${table.table_name}" LIMIT 2`;
        const sample = await sourcePool.query(sampleQuery);
        console.log('Sample data:');
        for (const row of sample.rows) {
          console.log('  ', row);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sourcePool.end();
  }
}

checkUserTables();