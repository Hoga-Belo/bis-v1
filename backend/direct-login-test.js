const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

async function testLogin() {
  console.log('=== Direct Login Test ===\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: '123456789',
    database: 'bebang_db',
    synchronize: false,
    logging: true,
  });

  try {
    console.log('Step 1: Connecting to database...');
    await dataSource.initialize();
    console.log('Connected!\n');

    const nik = 'ADMIN001';
    const password = 'Admin@123';

    // Step 2: Find user with relations
    console.log('Step 2: Finding user with relations...');
    const userQuery = `
      SELECT 
        u.id, u.nik, u.password_hash, u.is_first_login, u.is_active, u.last_login_at,
        ur.role_id,
        r.code as role_code, r.name as role_name,
        rp.permission_id,
        p.code as permission_code
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.nik = $1 AND u.is_active = true AND u.deleted_at IS NULL
    `;
    
    const userRows = await dataSource.query(userQuery, [nik]);
    console.log(`Found ${userRows.length} rows\n`);

    if (userRows.length === 0) {
      throw new Error('User not found');
    }

    const user = userRows[0];
    console.log('User:', {
      id: user.id,
      nik: user.nik,
      is_first_login: user.is_first_login,
      is_active: user.is_active,
    });

    // Step 3: Validate password
    console.log('\nStep 3: Validating password...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Step 4: Extract roles
    console.log('\nStep 4: Extracting roles...');
    const rolesSet = new Set();
    userRows.forEach(row => {
      if (row.role_code) rolesSet.add(row.role_code);
    });
    const roles = Array.from(rolesSet);
    console.log('Roles:', roles);

    // Step 5: Extract permissions
    console.log('\nStep 5: Extracting permissions...');
    const permissionsSet = new Set();
    userRows.forEach(row => {
      if (row.permission_code) permissionsSet.add(row.permission_code);
    });
    const permissions = Array.from(permissionsSet);
    console.log('Permissions count:', permissions.length);
    console.log('First 5 permissions:', permissions.slice(0, 5));

    // Step 6: Build JWT payload
    console.log('\nStep 6: Building JWT payload...');
    const payload = {
      sub: user.id,
      nik: user.nik,
      roles,
      permissions,
    };
    console.log('Payload:', { ...payload, permissions: `[${permissions.length} items]` });

    // Step 7: Sign JWT
    console.log('\nStep 7: Signing JWT...');
    const jwtSecret = 'your-super-secret-jwt-key-change-in-production';
    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });
    console.log('Access token generated:', accessToken.substring(0, 50) + '...');

    // Step 8: Generate refresh token
    console.log('\nStep 8: Generating refresh token...');
    const refreshTokenValue = uuidv4() + '-' + uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log('Refresh token value:', refreshTokenValue.substring(0, 20) + '...');
    console.log('Expires at:', expiresAt.toISOString());

    // Step 9: Save refresh token to database
    console.log('\nStep 9: Saving refresh token to database...');
    const insertQuery = `
      INSERT INTO refresh_tokens (id, token, user_id, expires_at, is_revoked, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const refreshTokenId = uuidv4();
    const result = await dataSource.query(insertQuery, [
      refreshTokenId,
      refreshTokenValue,
      user.id,
      expiresAt,
      false,
      new Date(),
    ]);
    console.log('Refresh token saved with ID:', result[0].id);

    // Step 10: Update lastLoginAt
    console.log('\nStep 10: Updating lastLoginAt...');
    await dataSource.query('UPDATE users SET last_login_at = $1 WHERE id = $2', [new Date(), user.id]);
    console.log('lastLoginAt updated');

    // Final result
    console.log('\n=== LOGIN SUCCESSFUL ===');
    console.log({
      accessToken: accessToken.substring(0, 50) + '...',
      refreshToken: refreshTokenValue.substring(0, 20) + '...',
      user: {
        id: user.id,
        nik: user.nik,
        roles,
        permissions: `[${permissions.length} items]`,
        isFirstLogin: user.is_first_login,
      },
    });

    // Cleanup: Delete the test refresh token
    console.log('\nCleaning up test refresh token...');
    await dataSource.query('DELETE FROM refresh_tokens WHERE id = $1', [refreshTokenId]);
    console.log('Test refresh token deleted');

  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    await dataSource.destroy();
    console.log('\nDatabase connection closed');
  }
}

testLogin();