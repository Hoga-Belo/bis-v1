const { Client } = require('pg');

async function fixAuditTable() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'root',
    password: '123456789',
    database: 'bebang_db'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Add missing columns
    const alterQueries = [
      'ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS module varchar(50)',
      'ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type varchar(100)',
      'ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS description text'
    ];

    for (const query of alterQueries) {
      try {
        await client.query(query);
        console.log('Executed:', query);
      } catch (error) {
        console.log('Error executing query:', error.message);
      }
    }

    // Create index if not exists
    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_audit_module_date ON audit_logs (module, created_at)');
      console.log('Index created or already exists');
    } catch (error) {
      console.log('Index error:', error.message);
    }

    // Verify final structure
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'audit_logs' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nFinal audit_logs table structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await client.end();
    console.log('\nDone');
  }
}

fixAuditTable();