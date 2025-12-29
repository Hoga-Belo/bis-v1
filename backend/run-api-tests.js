/**
 * Bebang BIS API Test Script
 * Tests all backend API endpoints
 */

const http = require('http');

// Configuration
const BASE_URL = 'localhost';
const PORT = 3000;
const API_PREFIX = '/api/v1';

// Test results storage
const results = {
  passed: [],
  failed: [],
  total: 0
};

// Store tokens and IDs for subsequent tests
let accessToken = '';
let refreshToken = '';
let testUserId = '';
let testRoleId = '';
let testDivisionId = '';
let testDepartmentId = '';
let testPositionId = '';
let testJobGradeId = '';
let testEmploymentStatusId = '';
let testWorkLocationId = '';
let testEmployeeId = '';

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: API_PREFIX + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

/**
 * Log test result
 */
function logResult(testName, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed.push(testName);
    console.log(`✅ PASS: ${testName}`);
  } else {
    results.failed.push({ name: testName, details });
    console.log(`❌ FAIL: ${testName} - ${details}`);
  }
}

/**
 * Test Auth Endpoints
 */
async function testAuthEndpoints() {
  console.log('\n========== AUTH ENDPOINTS ==========\n');

  // 1. Login
  try {
    const res = await makeRequest('POST', '/auth/login', {
      nik: 'ADMIN001',
      password: 'Admin@123'
    });
    
    if (res.data.success && res.data.data.accessToken) {
      accessToken = res.data.data.accessToken;
      refreshToken = res.data.data.refreshToken;
      logResult('POST /auth/login', true);
      console.log('   - Access token obtained');
      console.log('   - User roles:', res.data.data.user.roles);
      console.log('   - isFirstLogin:', res.data.data.user.isFirstLogin);
    } else {
      logResult('POST /auth/login', false, res.data.message || 'No token returned');
    }
  } catch (e) {
    logResult('POST /auth/login', false, e.message);
  }

  // 2. Get current user
  try {
    const res = await makeRequest('GET', '/auth/me', null, accessToken);
    if (res.data.success) {
      logResult('GET /auth/me', true);
      console.log('   - User NIK:', res.data.data.nik);
    } else {
      logResult('GET /auth/me', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /auth/me', false, e.message);
  }

  // 3. Refresh token
  try {
    const res = await makeRequest('POST', '/auth/refresh', {
      refreshToken: refreshToken
    });
    if (res.data.success && res.data.data.accessToken) {
      accessToken = res.data.data.accessToken;
      refreshToken = res.data.data.refreshToken;
      logResult('POST /auth/refresh', true);
    } else {
      logResult('POST /auth/refresh', false, res.data.message);
    }
  } catch (e) {
    logResult('POST /auth/refresh', false, e.message);
  }

  // 4. Test without token (should fail)
  try {
    const res = await makeRequest('GET', '/auth/me', null, null);
    if (!res.data.success && res.status === 401) {
      logResult('GET /auth/me (no token)', true);
    } else {
      logResult('GET /auth/me (no token)', false, 'Should return 401');
    }
  } catch (e) {
    logResult('GET /auth/me (no token)', false, e.message);
  }
}

/**
 * Test User Endpoints
 */
async function testUserEndpoints() {
  console.log('\n========== USER ENDPOINTS ==========\n');

  // 1. List users
  try {
    const res = await makeRequest('GET', '/users', null, accessToken);
    if (res.data.success) {
      logResult('GET /users', true);
      console.log('   - Total users:', res.data.data.length || res.data.meta?.total);
    } else {
      logResult('GET /users', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /users', false, e.message);
  }

  // 2. Create user
  try {
    const res = await makeRequest('POST', '/users', {
      nik: 'TEST001',
      password: 'Test@123',
      fullName: 'Test User',
      email: 'test@example.com'
    }, accessToken);
    
    if (res.data.success && res.data.data.id) {
      testUserId = res.data.data.id;
      logResult('POST /users', true);
      console.log('   - Created user ID:', testUserId);
    } else {
      logResult('POST /users', false, res.data.message);
    }
  } catch (e) {
    logResult('POST /users', false, e.message);
  }

  // 3. Get user by ID
  if (testUserId) {
    try {
      const res = await makeRequest('GET', `/users/${testUserId}`, null, accessToken);
      if (res.data.success) {
        logResult('GET /users/:id', true);
      } else {
        logResult('GET /users/:id', false, res.data.message);
      }
    } catch (e) {
      logResult('GET /users/:id', false, e.message);
    }
  }

  // 4. Update user
  if (testUserId) {
    try {
      const res = await makeRequest('PATCH', `/users/${testUserId}`, {
        fullName: 'Test User Updated'
      }, accessToken);
      if (res.data.success) {
        logResult('PATCH /users/:id', true);
      } else {
        logResult('PATCH /users/:id', false, res.data.message);
      }
    } catch (e) {
      logResult('PATCH /users/:id', false, e.message);
    }
  }
}

/**
 * Test Role Endpoints
 */
async function testRoleEndpoints() {
  console.log('\n========== ROLE ENDPOINTS ==========\n');

  // 1. List roles
  try {
    const res = await makeRequest('GET', '/roles', null, accessToken);
    if (res.data.success) {
      logResult('GET /roles', true);
      console.log('   - Total roles:', res.data.data.length || res.data.meta?.total);
    } else {
      logResult('GET /roles', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /roles', false, e.message);
  }

  // 2. List permissions
  try {
    const res = await makeRequest('GET', '/permissions', null, accessToken);
    if (res.data.success) {
      logResult('GET /permissions', true);
      console.log('   - Total permissions:', res.data.data.length);
    } else {
      logResult('GET /permissions', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /permissions', false, e.message);
  }

  // 3. Create role
  try {
    const res = await makeRequest('POST', '/roles', {
      name: 'TEST_ROLE',
      description: 'Test role for API testing'
    }, accessToken);
    
    if (res.data.success && res.data.data.id) {
      testRoleId = res.data.data.id;
      logResult('POST /roles', true);
      console.log('   - Created role ID:', testRoleId);
    } else {
      logResult('POST /roles', false, res.data.message);
    }
  } catch (e) {
    logResult('POST /roles', false, e.message);
  }
}

/**
 * Test HR Division Endpoints
 */
async function testHRDivisionEndpoints() {
  console.log('\n========== HR DIVISION ENDPOINTS ==========\n');

  // 1. List divisions
  try {
    const res = await makeRequest('GET', '/hr/divisions', null, accessToken);
    if (res.data.success) {
      logResult('GET /hr/divisions', true);
      console.log('   - Total divisions:', res.data.data.length || res.data.meta?.total);
    } else {
      logResult('GET /hr/divisions', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /hr/divisions', false, e.message);
  }

  // 2. Create division
  try {
    const res = await makeRequest('POST', '/hr/divisions', {
      code: 'TEST-DIV',
      name: 'Test Division',
      description: 'Test division for API testing'
    }, accessToken);
    
    if (res.data.success && res.data.data.id) {
      testDivisionId = res.data.data.id;
      logResult('POST /hr/divisions', true);
      console.log('   - Created division ID:', testDivisionId);
    } else {
      logResult('POST /hr/divisions', false, res.data.message);
    }
  } catch (e) {
    logResult('POST /hr/divisions', false, e.message);
  }

  // 3. Get division by ID
  if (testDivisionId) {
    try {
      const res = await makeRequest('GET', `/hr/divisions/${testDivisionId}`, null, accessToken);
      if (res.data.success) {
        logResult('GET /hr/divisions/:id', true);
      } else {
        logResult('GET /hr/divisions/:id', false, res.data.message);
      }
    } catch (e) {
      logResult('GET /hr/divisions/:id', false, e.message);
    }
  }

  // 4. Update division
  if (testDivisionId) {
    try {
      const res = await makeRequest('PATCH', `/hr/divisions/${testDivisionId}`, {
        name: 'Test Division Updated'
      }, accessToken);
      if (res.data.success) {
        logResult('PATCH /hr/divisions/:id', true);
      } else {
        logResult('PATCH /hr/divisions/:id', false, res.data.message);
      }
    } catch (e) {
      logResult('PATCH /hr/divisions/:id', false, e.message);
    }
  }
}

/**
 * Test HR Department Endpoints
 */
async function testHRDepartmentEndpoints() {
  console.log('\n========== HR DEPARTMENT ENDPOINTS ==========\n');

  // 1. List departments
  try {
    const res = await makeRequest('GET', '/hr/departments', null, accessToken);
    if (res.data.success) {
      logResult('GET /hr/departments', true);
      console.log('   - Total departments:', res.data.data.length || res.data.meta?.total);
    } else {
      logResult('GET /hr/departments', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /hr/departments', false, e.message);
  }

  // 2. Create department
  if (testDivisionId) {
    try {
      const res = await makeRequest('POST', '/hr/departments', {
        code: 'TEST-DEPT',
        name: 'Test Department',
        description: 'Test department for API testing',
        divisionId: testDivisionId
      }, accessToken);
      
      if (res.data.success && res.data.data.id) {
        testDepartmentId = res.data.data.id;
        logResult('POST /hr/departments', true);
        console.log('   - Created department ID:', testDepartmentId);
      } else {
        logResult('POST /hr/departments', false, res.data.message);
      }
    } catch (e) {
      logResult('POST /hr/departments', false, e.message);
    }
  }

  // 3. Get department by ID
  if (testDepartmentId) {
    try {
      const res = await makeRequest('GET', `/hr/departments/${testDepartmentId}`, null, accessToken);
      if (res.data.success) {
        logResult('GET /hr/departments/:id', true);
      } else {
        logResult('GET /hr/departments/:id', false, res.data.message);
      }
    } catch (e) {
      logResult('GET /hr/departments/:id', false, e.message);
    }
  }

  // 4. Update department
  if (testDepartmentId) {
    try {
      const res = await makeRequest('PATCH', `/hr/departments/${testDepartmentId}`, {
        name: 'Test Department Updated'
      }, accessToken);
      if (res.data.success) {
        logResult('PATCH /hr/departments/:id', true);
      } else {
        logResult('PATCH /hr/departments/:id', false, res.data.message);
      }
    } catch (e) {
      logResult('PATCH /hr/departments/:id', false, e.message);
    }
  }
}

/**
 * Test HR Position Endpoints
 */
async function testHRPositionEndpoints() {
  console.log('\n========== HR POSITION ENDPOINTS ==========\n');

  // 1. List positions
  try {
    const res = await makeRequest('GET', '/hr/positions', null, accessToken);
    if (res.data.success) {
      logResult('GET /hr/positions', true);
      console.log('   - Total positions:', res.data.data.length || res.data.meta?.total);
    } else {
      logResult('GET /hr/positions', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /hr/positions', false, e.message);
  }

  // 2. Create position
  try {
    const res = await makeRequest('POST', '/hr/positions', {
      code: 'TEST-POS',
      name: 'Test Position',
      level: 5,
      description: 'Test position for API testing'
    }, accessToken);
    
    if (res.data.success && res.data.data.id) {
      testPositionId = res.data.data.id;
      logResult('POST /hr/positions',