// Test NestJS login by calling the service directly
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function testLogin() {
  console.log('Creating NestJS application...');
  
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('NestJS application created');
    
    // Get AuthService
    const { AuthService } = require('./dist/modules/auth/auth.service');
    const authService = app.get(AuthService);
    console.log('AuthService obtained');
    
    // Test login
    console.log('\nTesting login...');
    const result = await authService.login({
      nik: 'ADMIN001',
      password: 'Admin@123'
    });
    
    console.log('\n=== LOGIN SUCCESSFUL ===');
    console.log('Access Token:', result.accessToken.substring(0, 50) + '...');
    console.log('Refresh Token:', result.refreshToken.substring(0, 30) + '...');
    console.log('User:', JSON.stringify(result.user, null, 2));
    
    await app.close();
  } catch (error) {
    console.error('\n=== LOGIN FAILED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLogin();