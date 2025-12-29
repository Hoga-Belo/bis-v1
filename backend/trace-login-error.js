/**
 * Script untuk trace error login secara detail
 * Jalankan dengan: node trace-login-error.js
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'bebang_db',
  user: 'root',
  password: '123456789',
};

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

async function traceLoginError() {
  const client = new Client(dbConfig);
  
  try {
    console.log('=== TRACE LOGIN ERROR ===\n');
    
    // Step 1: Connect to database
    console.log('Step 1: Connecting to database...');
    await client.connect();
    console.log('✓ Database connected\n');
    
    // Step 2: Query user with all relations (same as auth.service.ts)
    console.log('Step 2: Querying user with relations...');
    const userQuery = `
      SELECT 
        u.id,
        u.nik,
        u.email,
        u.password,
        u.full_name,
        u.is_active,
        u.is_first_login,
        u.created_at,
        u.updated_at
      FROM users u
      WHERE u.nik = 'ADMIN001' AND u.deleted_at IS NULL
    `;
    
    const userResult = await client.query(userQuery);
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    const user = userResult.rows[0];
    console.log('✓ User found:', user.id);
    console.log('  - NIK:', user.nik);
    console.log('  - Email:', user.email);
    console.log('  - Active:', user.is_active);
    console.log('  - First Login:', user.is_first_login);
    console.log('');
    
    // Step 3: Validate password
    console.log('Step 3: Validating password...');
    const isPasswordValid = await bcrypt.compare('Admin@123', user.password);
    console.log('✓ Password valid:', isPasswordValid);
    console.log('');
    
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    
    // Step 4: Get user roles
    console.log('Step 4: Getting user roles...');
    const rolesQuery = `
      SELECT r.id, r.name, r.code
      FROM roles r
      INNER JOIN user_roles ur ON ur.role_id = r.id
      WHERE ur.user_id = $1 AND r.deleted_at IS NULL
    `;
    const rolesResult = await client.query(rolesQuery, [user.id]);
    const roles = rolesResult.rows;
    console.log('✓ Roles found:', roles.length);
    roles.forEach(r => console.log('  -', r.name, '(' + r.code + ')'));
    console.log('');
    
    // Step 5: Get permissions
    console.log('Step 5: Getting permissions...');
    const permissionsQuery = `
      SELECT DISTINCT p.code
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      INNER JOIN user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = $1 AND p.deleted_at IS NULL
    `;
    const permissionsResult = await client.query(permissionsQuery, [user.id]);
    const permissions = permissionsResult.rows.map(p => p.code);
    console.log('✓ Permissions found:', permissions.length);
    console.log('');
    
    // Step 6: Build JWT payload (same as auth.service.ts)
    console.log('Step 6: Building JWT payload...');
    const payload = {
      sub: user.id,
      nik: user.nik,
      email: user.email,
      roles: roles.map(r => r.code),
      permissions: permissions,
    };
    console.log('✓ Payload built');
    console.log('  - sub:', payload.sub);
    console.log('  - nik:', payload.nik);
    console.log('  - roles:', payload.roles.length);
    console.log('  - permissions:', payload.permissions.length);
    console.log('');
    
    // Step 7: Sign JWT token
    console.log('Step 7: Signing JWT token...');
    try {
      // Test with different expiresIn formats
      console.log('  Testing expiresIn formats:');
      
      // Format 1: String '1d'
      try {
        const token1 = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
        console.log('  ✓ Format "1d" works');
      } catch (e) {
        console.log('  ✗ Format "1d" failed:', e.message);
      }
      
      // Format 2: String '3600s'
      try {
        const token2 = jwt.sign(payload, JWT_SECRET, { expiresIn: '3600s' });
        console.log('  ✓ Format "3600s" works');
      } catch (e) {
        console.log('  ✗ Format "3600s" failed:', e.message);
      }
      
      // Format 3: Number 3600
      try {
        const token3 = jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 });
        console.log('  ✓ Format 3600 (number) works');
      } catch (e) {
        console.log('  ✗ Format 3600 (number) failed:', e.message);
      }
      
      // Use the working format
      const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
      console.log('✓ Access token generated');
      console.log('  Token length:', accessToken.length);
      console.log('');
      
      // Step 8: Generate refresh token
      console.log('Step 8: Generating refresh token...');
      const refreshToken = crypto.randomBytes(32).toString('hex');
      console.log('✓ Refresh token generated');
      console.log('  Token length:', refreshToken.length);
      console.log('');
      
      // Step 9: Calculate expiry date
      console.log('Step 9: Calculating expiry date...');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      console.log('✓ Expiry date:', expiresAt.toISOString());
      console.log('');
      
      // Step 10: Insert refresh token
      console.log('Step 10: Inserting refresh token...');
      const insertQuery = `
        INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
        VALUES (gen_random_uuid(), $1, $2, $3, NOW())
        RETURNING id
      `;
      const insertResult = await client.query(insertQuery, [user.id, refreshToken, expiresAt]);
      console.log('✓ Refresh token inserted:', insertResult.rows[0].id);
      console.log('');
      
      // Step 11: Update user last_login
      console.log('Step 11: Updating user last_login...');
      const updateQuery = `
        UPDATE users SET last_login_at = NOW() WHERE id = $1
      `;
      await client.query(updateQuery, [user.id]);
      console.log('✓ User last_login updated');
      console.log('');
      
      // Step 12: Build response
      console.log('Step 12: Building response...');
      const response = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 86400,
        user: {
          id: user.id,
          nik: user.nik,
          email: user.email,
          full_name: user.full_name,
          is_first_login: user.is_first_login,
          roles: roles.map(r => ({ id: r.id, name: r.name, code: r.code })),
        },
      };
      console.log('✓ Response built successfully');
      console.log('');
      
      console.log('=== ALL STEPS PASSED ===');
      console.log('\nThe login flow should work. The error might be in:');
      console.log('1. NestJS dependency injection');
      console.log('2. TypeORM entity mapping');
      console.log('3. DTO validation');
      console.log('4. Interceptor/Guard issues');
      
    } catch (jwtError) {
      console.log('✗ JWT signing failed:', jwtError.message);
      console.log('  Stack:', jwtError.stack);
    }
    
  } catch (error) {
    console.error('\n=== ERROR OCCURRED ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

traceLoginError();