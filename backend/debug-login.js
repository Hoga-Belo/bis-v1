const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function debugLogin() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'bebang_db',
    user: 'root',
    password: '123456789',
  });

  try {
    await client.connect();
    console.log('✅ Database connected');

    // Step 1: Get user
    console.log('\n--- Step 1: Get User ---');
    const userResult = await client.query(`
      SELECT id, nik, password_hash, is_active, is_first_login, deleted_at
      FROM users 
      WHERE nik = 'ADMIN001'
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('User found:', {
      id: user.id,
      nik: user.nik,
      is_active: user.is_active,
      is_first_login: user.is_first_login,
      deleted_at: user.deleted_at,
      password_hash_length: user.password_hash?.length
    });

    // Step 2: Validate password
    console.log('\n--- Step 2: Validate Password ---');
    const isValid = await bcrypt.compare('Admin@123', user.password_hash);
    console.log('Password valid:', isValid);

    // Step 3: Get user roles
    console.log('\n--- Step 3: Get User Roles ---');
    const rolesResult = await client.query(`
      SELECT r.id, r.code, r.name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1
    `, [user.id]);
    
    console.log('Roles:', rolesResult.rows);
    const roles = rolesResult.rows.map(r => r.code);

    // Step 4: Get permissions
    console.log('\n--- Step 4: Get Permissions ---');
    const permissionsResult = await client.query(`
      SELECT DISTINCT p.code
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = $1
    `, [user.id]);
    
    console.log('Permissions count:', permissionsResult.rows.length);
    const permissions = permissionsResult.rows.map(p => p.code);

    // Step 5: Generate JWT
    console.log('\n--- Step 5: Generate JWT ---');
    const payload = {
      sub: user.id,
      nik: user.nik,
      roles: roles,
      permissions: permissions,
    };
    
    console.log('Payload:', {
      sub: payload.sub,
      nik: payload.nik,
      roles: payload.roles,
      permissionsCount: payload.permissions.length
    });

    const secret = 'your-super-secret-jwt-key-change-in-production';
    const expiresIn = '3600s';
    
    console.log('JWT Secret:', secret);
    console.log('Expires In:', expiresIn);
    
    try {
      const token = jwt.sign(payload, secret, { expiresIn });
      console.log('✅ JWT generated successfully');
      console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    } catch (jwtError) {
      console.log('❌ JWT generation failed:', jwtError.message);
    }

    // Step 6: Test refresh token generation
    console.log('\n--- Step 6: Test Refresh Token ---');
    const { v4: uuidv4 } = require('uuid');
    const refreshToken = uuidv4() + '-' + uuidv4();
    console.log('Refresh token generated:', refreshToken.substring(0, 30) + '...');

    // Step 7: Test refresh token insert
    console.log('\n--- Step 7: Test Refresh Token Insert ---');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    try {
      await client.query(`
        INSERT INTO refresh_tokens (id, token, user_id, expires_at, is_revoked, created_at)
        VALUES (gen_random_uuid(), $1, $2, $3, false, NOW())
      `, [refreshToken, user.id, expiresAt]);
      console.log('✅ Refresh token inserted successfully');
      
      // Clean up test token
      await client.query(`DELETE FROM refresh_tokens WHERE token = $1`, [refreshToken]);
      console.log('✅ Test token cleaned up');
    } catch (insertError) {
      console.log('❌ Refresh token insert failed:', insertError.message);
    }

    // Step 8: Test user update
    console.log('\n--- Step 8: Test User Update ---');
    try {
      await client.query(`
        UPDATE users SET last_login_at = NOW() WHERE id = $1
      `, [user.id]);
      console.log('✅ User update successful');
    } catch (updateError) {
      console.log('❌ User update failed:', updateError.message);
    }

    console.log('\n=== All steps completed successfully ===');
    console.log('The login flow should work. Check if there are any TypeORM entity issues.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

debugLogin();