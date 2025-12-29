// Test NestJS login with full debugging
const { NestFactory } = require('@nestjs/core');
const bcrypt = require('bcrypt');

async function testLogin() {
  console.log('Creating NestJS application with full AppModule...');
  
  // Import AppModule dynamically
  const { AppModule } = require('./dist/app.module');
  
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  
  console.log('NestJS application created with full AppModule');
  
  // Get AuthService
  const { AuthService } = require('./dist/modules/auth/auth.service');
  const authService = app.get(AuthService);
  
  console.log('\nAuthService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(authService)));
  
  // Check if validateCredentials exists
  console.log('\nvalidateCredentials exists:', typeof authService.validateCredentials === 'function');
  console.log('login exists:', typeof authService.login === 'function');
  
  // Test validateCredentials directly
  console.log('\n--- Testing validateCredentials directly ---');
  try {
    const user = await authService.validateCredentials('ADMIN001', 'Admin@123');
    console.log('validateCredentials SUCCESS!');
    console.log('User ID:', user.id);
    console.log('User NIK:', user.nik);
    console.log('User roles count:', user.userRoles?.length);
  } catch (error) {
    console.log('validateCredentials FAILED:', error.message);
  }
  
  // Test login method
  console.log('\n--- Testing login method ---');
  try {
    const result = await authService.login({ nik: 'ADMIN001', password: 'Admin@123' });
    console.log('Login SUCCESS!');
    console.log('Access token length:', result.accessToken?.length);
    console.log('Refresh token:', result.refreshToken?.substring(0, 20) + '...');
    console.log('User:', result.user);
  } catch (error) {
    console.log('Login FAILED:', error.message);
    console.log('Error stack:', error.stack);
  }
  
  await app.close();
  process.exit(0);
}

testLogin().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});