import { Pool as PgPool } from 'pg';

const sourcePool = new PgPool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

async function checkTopicTables() {
  try {
    // Look for topic-related tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%topic%' OR table_name ILIKE '%subject%')
      ORDER BY table_name;
    `;
    
    const tables = await sourcePool.query(tablesQuery);
    console.log('Topic-related tables found:');
    for (const table of tables.rows) {
      console.log(`- ${table.table_name}`);
      
      // Get sample data and structure
      const countResult = await sourcePool.query(`SELECT COUNT(*) FROM "${table.table_name}"`);
      console.log(`  Records: ${countResult.rows[0].count}`);
      
      if (countResult.rows[0].count > 0) {
        const sampleQuery = `SELECT * FROM "${table.table_name}" LIMIT 3`;
        const sample = await sourcePool.query(sampleQuery);
        console.log('  Sample data:', sample.rows[0]);
      }
    }

    // Also check Content table for topic information
    console.log('\nChecking Content table for topic data...');
    const topicContentQuery = `
      SELECT DISTINCT "TopicID" 
      FROM "Content" 
      WHERE "TopicID" IS NOT NULL 
      ORDER BY "TopicID" 
      LIMIT 10
    `;
    
    const topicIds = await sourcePool.query(topicContentQuery);
    console.log('Unique TopicIDs in Content table:');
    for (const row of topicIds.rows) {
      console.log(`- ${row.TopicID}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sourcePool.end();
  }
}

checkTopicTables();