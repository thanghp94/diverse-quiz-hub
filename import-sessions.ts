
import { Pool } from 'pg';
import { db } from './server/db';
import { sql } from 'drizzle-orm';

// External database connection
const externalPool = new Pool({
  host: 'ep-rapid-dew-ad58cvd6.c-2.us-east-1.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_ONSLUx5f2pMo',
  database: 'neondb',
  ssl: { rejectUnauthorized: false }
});

async function importSessionsTables() {
  console.log('🔄 Starting sessions tables import...');
  
  try {
    // First check if sessions table exists in external database
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('sessions', 'sessions_activities')
      ORDER BY table_name;
    `;
    
    const availableTables = await externalPool.query(tablesQuery);
    console.log('📋 Available tables in external database:', availableTables.rows.map(r => r.table_name));
    
    // Create sessions table if it doesn't exist
    console.log('📝 Creating sessions table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
      WITH (OIDS=FALSE);
    `);
    
    await db.execute(sql`
      ALTER TABLE sessions 
      ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
    `);
    
    console.log('✅ Sessions table created successfully');
    
    // Check if sessions table exists in external database and import data
    const sessionsTableExists = availableTables.rows.some(row => row.table_name === 'sessions');
    
    if (sessionsTableExists) {
      console.log('📥 Importing sessions data...');
      const sessionsData = await externalPool.query('SELECT * FROM sessions LIMIT 1000');
      console.log(`Found ${sessionsData.rows.length} sessions to import`);
      
      let importedSessions = 0;
      for (const session of sessionsData.rows) {
        try {
          await db.execute(sql`
            INSERT INTO sessions (sid, sess, expire)
            VALUES (${session.sid}, ${JSON.stringify(session.sess)}, ${session.expire})
            ON CONFLICT (sid) DO UPDATE SET
            sess = EXCLUDED.sess,
            expire = EXCLUDED.expire
          `);
          importedSessions++;
        } catch (error) {
          console.log(`Error importing session ${session.sid}:`, error.message);
        }
      }
      console.log(`✅ Imported ${importedSessions} sessions`);
    } else {
      console.log('ℹ️ No sessions table found in external database, created empty table');
    }
    
    // Check if sessions_activities table exists and create/import it
    const sessionsActivitiesExists = availableTables.rows.some(row => row.table_name === 'sessions_activities');
    
    if (sessionsActivitiesExists) {
      console.log('📝 Creating sessions_activities table...');
      
      // Get the structure of sessions_activities table
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'sessions_activities'
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const structure = await externalPool.query(structureQuery);
      console.log('📋 Sessions activities table structure:', structure.rows);
      
      // Create a basic sessions_activities table structure
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS sessions_activities (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR,
          user_id VARCHAR,
          activity_type VARCHAR,
          activity_data JSONB,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('📥 Importing sessions_activities data...');
      const activitiesData = await externalPool.query('SELECT * FROM sessions_activities LIMIT 1000');
      console.log(`Found ${activitiesData.rows.length} session activities to import`);
      
      let importedActivities = 0;
      for (const activity of activitiesData.rows) {
        try {
          // Dynamically build insert based on available columns
          const columns = Object.keys(activity);
          const values = Object.values(activity);
          
          await db.execute(sql`
            INSERT INTO sessions_activities (${sql.raw(columns.join(', '))})
            VALUES (${sql.join(values.map(v => sql`${v}`), sql`, `)})
            ON CONFLICT DO NOTHING
          `);
          importedActivities++;
        } catch (error) {
          console.log(`Error importing session activity:`, error.message);
        }
      }
      console.log(`✅ Imported ${importedActivities} session activities`);
    } else {
      console.log('ℹ️ No sessions_activities table found in external database');
    }
    
    // Verify the import
    const sessionCount = await db.execute(sql`SELECT COUNT(*) as count FROM sessions`);
    console.log(`\n📊 Final verification:`);
    console.log(`Sessions in database: ${sessionCount.rows[0].count}`);
    
    console.log('🎉 Sessions tables import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing sessions tables:', error);
    throw error;
  } finally {
    await externalPool.end();
  }
}

// Run the import
importSessionsTables().catch(console.error);
