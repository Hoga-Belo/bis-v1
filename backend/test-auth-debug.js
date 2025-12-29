const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function testLogin() {
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
    
    // 1. Get user with relations
    const userQuery = await client.query(`
      SELECT u.id, u.nik, u.password_hash, u.is_first_login, u.is_active
      FROM users u
      WHERE u.nik = 'ADMIN001' AND u.deleted_at IS NULL
    `);
    
    if (userQuery.rows.length === 0) {
      console.log('User not found');
      return;
    }
    
    const user = userQuery.rows[0];
    console.log('User found:', { id: user.id, nik: user.nik, is_active: user.is_active });
    
    // 2. Verify password
    const isPasswordValid = await bcrypt.compare('Admin@123', user.password_hash);
    console.log('Password valid:', isPasswordValid);
    
    // 3. Get user roles
    const rolesQuery = await client.query(`
      SELECT ur.role_id, r.code, r.name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1 AND ur.deleted_at IS NULL AND r.deleted_at IS NULL
    `, [user.id]);
    
    console.log('User roles:', rolesQuery.rows);
    
    // 4. Get role permissions
    if (rolesQuery.rows.length > 0) {
      const roleId = rolesQuery.rows[0].role_id;
      const permissionsQuery = await client.query(`
        SELECT p.code, p.module, p.feature, p.action
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = $1 AND rp.deleted_at IS NULL AND p.deleted_at IS NULL
        LIMIT 5
      `, [roleId]);
      
      console.log('Sample permissions:', permissionsQuery.rows);
    }
    
    // 5. Test the exact query from auth.service.ts
    console.log('\nTesting TypeORM-style query...');
    const fullQuery = await client.query(`
      SELECT 
        u.id as user_id,
        u.nik,
        u.password_hash,
        u.is_first_login,
        u.is_active,
        ur.id as user_role_id,
        r.id as role_id,
        r.code as role_code,
        r.name as role_name,
        rp.id as role_permission_id,
        p.id as permission_id,
        p.code as permission_code
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.deleted_at IS NULL
      LEFT JOIN roles r ON r.id = ur.role_id AND r.deleted_at IS NULL
      LEFT JOIN role_permissions rp ON rp.role_id = r.id AND rp.deleted_at IS NULL
      LEFT JOIN permissions p ON p.id = rp.permission_id AND p.deleted_at IS NULL
      WHERE u.nik = 'ADMIN001' AND u.deleted_at IS NULL
      LIMIT 3
    `);
    
    console.log('Full query result (first 3 rows):', fullQuery.rows);
    
    console.log('\nAll database queries successful!');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

testLogin();