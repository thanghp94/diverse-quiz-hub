import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import * as schema from './shared/schema';
import ws from 'ws';

// Configure neon for WebSocket
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

// Setup for source database
const sourcePool = new PgPool({
  host: '193.42.244.152',
  port: 2345,
  user: 'postgres',
  password: 'psql@2025',
  database: 'postgres'
});

// Setup for destination database
const destPool = new Pool({ connectionString: process.env.DATABASE_URL });
const destDb = drizzle({ client: destPool, schema });

async function importUsers() {
  console.log('Importing users from HocSinh and NhanVien tables...');
  
  try {
    let totalImported = 0;

    // Import students from HocSinh table
    console.log('Importing students (HocSinh)...');
    const studentQuery = `SELECT 
      "ID" as id,
      "ten_hoc_sinh" as username,
      "userID" as email,
      "Password" as password_hash
      FROM "HocSinh" 
      WHERE "userID" IS NOT NULL AND "userID" != ''
      ORDER BY "ID"`;
    
    const students = await sourcePool.query(studentQuery);
    
    if (students.rows.length > 0) {
      for (const student of students.rows) {
        const userData = {
          id: parseInt(student.id.replace(/\D/g, '') || '0') || Math.floor(Math.random() * 1000000),
          username: student.email || student.username || student.id,
          password_hash: student.password_hash || 'temp_password_hash'
        };
        
        await destDb.insert(schema.users).values(userData).onConflictDoNothing();
      }
      console.log(`Imported ${students.rows.length} students`);
      totalImported += students.rows.length;
    }

    // Import staff from NhanVien table
    console.log('Importing staff (NhanVien)...');
    const staffQuery = `SELECT 
      "id" as id,
      "ten_nhan_su" as username,
      "email" as email
      FROM "NhanVien" 
      WHERE "email" IS NOT NULL AND "email" != ''
      ORDER BY "id"`;
    
    const staff = await sourcePool.query(staffQuery);
    
    if (staff.rows.length > 0) {
      for (const staffMember of staff.rows) {
        const userData = {
          id: parseInt(staffMember.id.replace(/\D/g, '') || '0') + 10000 || Math.floor(Math.random() * 1000000),
          username: staffMember.email || staffMember.username || staffMember.id,
          password_hash: 'temp_password_hash'
        };
        
        await destDb.insert(schema.users).values(userData).onConflictDoNothing();
      }
      console.log(`Imported ${staff.rows.length} staff members`);
      totalImported += staff.rows.length;
    }

    // Import from Users table if it exists
    console.log('Checking for Users table...');
    try {
      const usersQuery = `SELECT 
        "ID" as id,
        "Full_Name" as username,
        "Email" as email,
        "MerakiEmail" as meraki_email
        FROM "Users" 
        WHERE ("Email" IS NOT NULL AND "Email" != '') OR ("MerakiEmail" IS NOT NULL AND "MerakiEmail" != '')
        ORDER BY "ID"`;
      
      const users = await sourcePool.query(usersQuery);
      
      if (users.rows.length > 0) {
        for (const user of users.rows) {
          const userData = {
            id: parseInt(user.id.replace(/\D/g, '') || '0') + 20000 || Math.floor(Math.random() * 1000000),
            username: user.email || user.meraki_email || user.username || user.id,
            password_hash: 'temp_password_hash'
          };
          
          await destDb.insert(schema.users).values(userData).onConflictDoNothing();
        }
        console.log(`Imported ${users.rows.length} users from Users table`);
        totalImported += users.rows.length;
      }
    } catch (error) {
      console.log('No Users table found or accessible');
    }

    console.log(`\nUsers import completed successfully! Total: ${totalImported} users`);
    
    // Verify import
    const importedUsers = await destDb.select().from(schema.users);
    console.log(`Verification: ${importedUsers.length} users now in database`);
    
    // Show sample of imported users
    console.log('\nSample imported users:');
    for (const user of importedUsers.slice(0, 5)) {
      console.log(`- ID: ${user.id}, Username: ${user.username}`);
    }
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await sourcePool.end();
    await destPool.end();
  }
}

importUsers().catch(console.error);