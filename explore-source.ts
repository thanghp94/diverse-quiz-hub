import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exploreDatabase() {
  console.log('Exploring source database structure...');

  try {
    // List all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) throw tablesError;

    console.log('\nAvailable tables:');
    for (const table of tables) {
      console.log(`- ${table.table_name}`);

      // Get row count for each table
      try {
        const { data: countResult, error: countError } = await supabase
          .rpc('count_rows', { table_name: table.table_name });
        if (countError) throw countError;
        console.log(`  Records: ${countResult?.count ?? 'unknown'}`);
      } catch (error) {
        console.log(`  Error counting records: ${error.message}`);
      }
    }

    // If there are tables, show structure of first few
    if (tables.length > 0) {
      console.log('\nTable structures:');
      for (const table of tables.slice(0, 3)) {
        console.log(`\n--- ${table.table_name} ---`);
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_name', table.table_name)
          .eq('table_schema', 'public')
          .order('ordinal_position');

        if (columnsError) throw columnsError;

        for (const column of columns) {
          console.log(`  ${column.column_name}: ${column.data_type} ${column.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        }
      }
    }

  } catch (error) {
    console.error('Error exploring database:', error);
  }
}

exploreDatabase().catch(console.error);
