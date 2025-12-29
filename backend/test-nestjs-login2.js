// Test NestJS login with more debugging
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function testLogin() {
  console.log('Creating NestJS application...');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('NestJS application created');
    
    // Get DataSource to query directly
    const { DataSource } = require('typeorm');
    const dataSource = app.get(DataSource);
    console.log('DataSource obtained, connected:', dataSource.isInitialized);
    
    // Query user directly
    console.log('\nQuerying user ADMIN001 directly...');
    const users = await dataSource.query(`
      SELECT id, nik, is_active, deleted_at, password_hash 
      FROM users 
      WHERE nik = 'ADMIN001'
    `);
    console.log('Users found:', users.length);
    if (users.length > 0) {
      console.log('User:', {
        id: users[0].id,
        nik: users[0].nik,
        is_active: users[0].is_active,
        deleted_at: users[0].deleted_at,
        password_hash_length: users[0].password_hash?.length
      });
    }
    
    // Get AuthService
    const { AuthService } = require('./dist/modules/auth/auth.service');
    const authService = app.get(AuthService);
    console.log('\nAuthService obtained');
    
    // Test validateCredentials directly
    console.log('\nTesting validateCredentials...');
    try {
      const user = await authService.validateCredentials('ADMIN001', 'Admin@123');
      console.log('validateCredentials SUCCESS:', user.id);
    } catch (e) {
      console.log('validateCredentials FAILED:', e.message);
    }
    
    await app.close();
  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLogin();