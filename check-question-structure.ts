import { Pool as PgPool } from 'pg';

const sourcePool = new PgPool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

async function checkQuestionStructure() {
  try {
    const columnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Question' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const columns = await sourcePool.query(columnsQuery);
    console.log('Question table columns:');
    for (const column of columns.rows) {
      console.log(`- ${column.column_name}: ${column.data_type}`);
    }

    const sampleQuery = 'SELECT * FROM "Question" LIMIT 2';
    const sample = await sourcePool.query(sampleQuery);
    console.log('\nSample question data:');
    console.log(sample.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sourcePool.end();
  }
}

checkQuestionStructure();