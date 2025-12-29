const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'root',
  password: '123456789',
  database: 'bebang_db',
});

async function main() {
  try {
    await client.connect();
    
    // Check users table
    const usersResult = await client.query('SELECT id, nik, is_active, deleted_at FROM users LIMIT 5');
    console.log('Users in database:');
    usersResult.rows.forEach(row => console.log('  -', row.id, row.nik, 'active:', row.is_active, 'deleted:', row.deleted_at));
    
    // Check user_roles
    const userRolesResult = await client.query(`
      SELECT ur.user_id, ur.role_id, r.code as role_code
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      LIMIT 10
    `);
    console.log('\nUser Roles:');
    userRolesResult.rows.forEach(row => console.log('  -', row.user_id, row.role_code));
    
    // Check role_permissions count
    const rpCountResult = await client.query('SELECT COUNT(*) as count FROM role_permissions');
    console.log('\nRole Permissions count:', rpCountResult.rows[0].count);
    
    // Check permissions count
    const permCountResult = await client.query('SELECT COUNT(*) as count FROM permissions');
    console.log('Permissions count:', permCountResult.rows[0].count);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

main();