const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function testLogin() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'root',
    password: '123456789',
    database: 'bebang_db',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Get user with password hash
    const userResult = await client.query(`
      SELECT id, nik, password_hash, is_active, is_first_login, deleted_at
      FROM users 
      WHERE nik = 'ADMIN001'
    `);

    if (userResult.rows.length === 0) {
      console.log('User ADMIN001 not found');
      return;
    }

    const user = userResult.rows[0];
    console.log('\nUser found:');
    console.log('  ID:', user.id);
    console.log('  NIK:', user.nik);
    console.log('  is_active:', user.is_active);
    console.log('  is_first_login:', user.is_first_login);
    console.log('  deleted_at:', user.deleted_at);
    console.log('  password_hash length:', user.password_hash?.length);
    console.log('  password_hash starts with $2:', user.password_hash?.startsWith('$2'));

    // Test password comparison
    const testPassword = 'Admin@123';
    console.log('\nTesting password:', testPassword);
    
    try {
      const isValid = await bcrypt.compare(testPassword, user.password_hash);
      console.log('Password valid:', isValid);
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError.message);
    }

    // Check user roles
    const rolesResult = await client.query(`
      SELECT ur.id, ur.user_id, ur.role_id, r.code as role_code, r.name as role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1
    `, [user.id]);

    console.log('\nUser roles:', rolesResult.rows.length);
    rolesResult.rows.forEach(role => {
      console.log('  -', role.role_code, ':', role.role_name);
    });

    // Check if role has permissions
    if (rolesResult.rows.length > 0) {
      const roleId = rolesResult.rows[0].role_id;
      const permCount = await client.query(`
        SELECT COUNT(*) as count FROM role_permissions WHERE role_id = $1
      `, [roleId]);
      console.log('\nPermissions for role:', permCount.rows[0].count);
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

testLogin();