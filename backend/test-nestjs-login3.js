// Test NestJS login with correct service retrieval
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const bcrypt = require('bcrypt');

async function testLogin() {
  console.log('Creating NestJS application...');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('NestJS application created');
    
    // Get DataSource to query directly
    const { DataSource } = require('typeorm');
    const dataSource = app.get(DataSource);
    console.log('DataSource obtained, connected:', dataSource.isInitialized);
    
    // Query user directly with password
    console.log('\nQuerying user ADMIN001 directly...');
    const users = await dataSource.query(`
      SELECT id, nik, is_active, deleted_at, password_hash 
      FROM users 
      WHERE nik = 'ADMIN001'
    `);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('User found:', {
        id: user.id,
        nik: user.nik,
        is_active: user.is_active,
        deleted_at: user.deleted_at
      });
      
      // Test bcrypt compare
      console.log('\nTesting bcrypt.compare...');
      const password = 'Admin@123';
      const isValid = await bcrypt.compare(password, user.password_hash);
      console.log('Password valid:', isValid);
      
      if (!isValid) {
        console.log('\nPassword hash:', user.password_hash);
        
        // Generate new hash for comparison
        const newHash = await bcrypt.hash(password, 10);
        console.log('New hash for Admin@123:', newHash);
        
        // Test with new hash
        const isNewValid = await bcrypt.compare(password, newHash);
        console.log('New hash valid:', isNewValid);
      }
    }
    
    // Get AuthService using class directly from app
    console.log('\nGetting AuthService from app...');
    const authServiceModule = require('./dist/modules/auth/auth.service');
    console.log('AuthService module exports:', Object.keys(authServiceModule));
    
    const AuthService = authServiceModule.AuthService;
    const authService = app.get(AuthService);
    console.log('AuthService type:', typeof authService);
    console.log('AuthService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(authService)));
    
    // Test login method
    console.log('\nTesting login method...');
    try {
      const result = await authService.login({ nik: 'ADMIN001', password: 'Admin@123' });
      console.log('\n=== LOGIN SUCCESS ===');
      console.log('Access Token:', result.accessToken.substring(0, 50) + '...');
    } catch (e) {
      console.log('Login failed:', e.message);
    }
    
    await app.close();
  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLogin();