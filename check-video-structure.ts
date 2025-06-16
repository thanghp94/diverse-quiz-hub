import { Pool as PgPool } from 'pg';

const sourcePool = new PgPool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

async function checkVideoStructure() {
  try {
    // Look for video-related tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%video%' OR table_name ILIKE '%media%')
      ORDER BY table_name;
    `;
    
    const tables = await sourcePool.query(tablesQuery);
    console.log('Video/Media-related tables found:');
    
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
    
    // Also check if Content table has video-related columns
    console.log('\n--- Content table video columns ---');
    const contentVideoQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Content' 
      AND table_schema = 'public'
      AND column_name ILIKE '%video%'
      ORDER BY ordinal_position;
    `;
    
    const contentVideoColumns = await sourcePool.query(contentVideoQuery);
    if (contentVideoColumns.rows.length > 0) {
      console.log('Video columns in Content table:');
      for (const column of contentVideoColumns.rows) {
        console.log(`  - ${column.column_name}: ${column.data_type}`);
      }
      
      // Sample content with video data
      const contentVideoSample = await sourcePool.query(`
        SELECT id, title, videoid, videoid2 
        FROM "Content" 
        WHERE videoid IS NOT NULL OR videoid2 IS NOT NULL 
        LIMIT 3
      `);
      console.log('Sample content with video data:');
      for (const row of contentVideoSample.rows) {
        console.log('  ', row);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sourcePool.end();
  }
}

checkVideoStructure();