const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { AuthService } = require('./dist/modules/auth/auth.service');

async function testLogin() {
  console.log('Creating NestJS application...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  console.log('Getting AuthService...');
  const authService = app.get(AuthService);
  
  console.log('AuthService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(authService)));
  
  try {
    console.log('\nTesting login with ADMIN001...');
    const result = await authService.login(
      { nik: 'ADMIN001', password: 'Admin@123' },
      'test-agent',
      '127.0.0.1'
    );
    console.log('Login successful!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Login failed:', error.message);
    console.error('Stack:', error.stack);
  }
  
  await app.close();
}

testLogin().catch(console.error);