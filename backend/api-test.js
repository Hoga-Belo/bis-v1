
const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;
const API_PREFIX = '/api/v1';

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

const results = {
  passed: [],
  failed: []
};

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

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
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

function logResult(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (details) console.log(`   ${details}`);
  
  if (passed) {
    results.passed.push(testName);
  } else {
    results.failed.push({ name: testName, details });
  }
}

async function testAuthEndpoints() {
  console.log('\n========== AUTH ENDPOINTS ==========\n');

  // 1. Login
  try {
    const res = await makeRequest('POST', '/auth/login', { nik: 'ADMIN001', password: 'Admin@123' });
    if (res.status === 200 || res.status === 201) {
      accessToken = res.data.data.accessToken;
      refreshToken = res.data.data.refreshToken;
      logResult('POST /auth/login', true, `Token received, isFirstLogin: ${res.data.data.user.isFirstLogin}`);
    } else {
      logResult('POST /auth/login', false, res.data.message);
    }
  } catch (e) {
    logResult('POST /auth/login', false, e.message);
  }

  // 2. Get current user
  try {
    const res = await makeRequest('GET', '/auth/me', null, accessToken);
    if (res.status === 200) {
      logResult('GET /auth/me', true, `User: ${res.data.data.nik}`);
    } else {
      logResult('GET /auth/me', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /auth/me', false, e.message);
  }

  // 3. Refresh token
  try {
    const res = await makeRequest('POST', '/auth/refresh', { refreshToken: refreshToken });
    if (res.status === 200 || res.status === 201) {
      accessToken = res.data.data.accessToken;
      refreshToken = res.data.data.refreshToken;
      logResult('POST /auth/refresh', true, 'New tokens received');
    } else {
      logResult('POST /auth/refresh', false, res.data.message);
    }
  } catch (e) {
    logResult('POST /auth/refresh', false, e.message);
  }

  // 4. Test without token (should fail)
  try {
    const res = await makeRequest('GET', '/auth/me');
    if (res.status === 401) {
      logResult('GET /auth/me (no token)', true, 'Correctly rejected unauthorized request');
    } else {
      logResult('GET /auth/me (no token)', false, 'Should have returned 401');
    }
  } catch (e) {
    logResult('GET /auth/me (no token)', false, e.message);
  }
}

async function testUserEndpoints() {
  console.log('\n========== USER ENDPOINTS ==========\n');

  // 1. List users
  try {
    const res = await makeRequest('GET', '/users', null, accessToken);
    if (res.status === 200) {
      logResult('GET /users', true, `Found ${res.data.data.length} users`);
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
      confirmPassword: 'Test@123'
    }, accessToken);
    if (res.status === 200 || res.status === 201) {
      testUserId = res.data.data.id;
      logResult('POST /users', true, `Created user ID: ${testUserId}`);
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
      if (res.status === 200) {
        logResult('GET /users/:id', true, `User NIK: ${res.data.data.nik}`);
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
        isActive: true
      }, accessToken);
      if (res.status === 200) {
        logResult('PATCH /users/:id', true, 'User updated');
      } else {
        logResult('PATCH /users/:id', false, res.data.message);
      }
    } catch (e) {
      logResult('PATCH /users/:id', false, e.message);
    }
  }
}

async function testRoleEndpoints() {
  console.log('\n========== ROLE ENDPOINTS ==========\n');

  // 1. List roles
  try {
    const res = await makeRequest('GET', '/roles', null, accessToken);
    if (res.status === 200) {
      logResult('GET /roles', true, `Found ${res.data.data.length} roles`);
    } else {
      logResult('GET /roles', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /roles', false, e.message);
  }

  // 2. Create role
  try {
    const res = await makeRequest('POST', '/roles', {
      name: 'TEST_ROLE',
      description: 'Test role for API testing'
    }, accessToken);
    if (res.status === 200 || res.status === 201) {
      testRoleId = res.data.data.id;
      logResult('POST /roles', true, `Created role ID: ${testRoleId}`);
    } else {
      logResult('POST /roles', false, res.data.message);
    }
  } catch (e) {
    logResult('POST /roles', false, e.message);
  }

  // 3. Get permissions
  try {
    const res = await makeRequest('GET', '/permissions', null, accessToken);
    if (res.status === 200) {
      logResult('GET /permissions', true, `Found ${res.data.data.length} permissions`);
    } else {
      logResult('GET /permissions', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /permissions', false, e.message);
  }
}

async function testHRDivisionEndpoints() {
  console.log('\n========== HR DIVISION ENDPOINTS ==========\n');

  // 1. List divisions
  try {
    const res = await makeRequest('GET', '/hr/divisions', null, accessToken);
    if (res.status === 200) {
      logResult('GET /hr/divisions', true, `Found ${res.data.data?.length || 0} divisions`);
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
    if (res.status === 200 || res.status === 201) {
      testDivisionId = res.data.data.id;
      logResult('POST /hr/divisions', true, `Created division ID: ${testDivisionId}`);
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
      if (res.status === 200) {
        logResult('GET /hr/divisions/:id', true, `Division: ${res.data.data.name}`);
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
        description: 'Updated test division'
      }, accessToken);
      if (res.status === 200) {
        logResult('PATCH /hr/divisions/:id', true, 'Division updated');
      } else {
        logResult('PATCH /hr/divisions/:id', false, res.data.message);
      }
    } catch (e) {
      logResult('PATCH /hr/divisions/:id', false, e.message);
    }
  }
}

async function testHRDepartmentEndpoints() {
  console.log('\n========== HR DEPARTMENT ENDPOINTS ==========\n');

  // 1. List departments
  try {
    const res = await makeRequest('GET', '/hr/departments', null, accessToken);
    if (res.status === 200) {
      logResult('GET /hr/departments', true, `Found ${res.data.data?.length || 0} departments`);
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
      if (res.status === 200 || res.status === 201) {
        testDepartmentId = res.data.data.id;
        logResult('POST /hr/departments', true, `Created department ID: ${testDepartmentId}`);
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
      if (res.status === 200) {
        logResult('GET /hr/departments/:id', true, `Department: ${res.data.data.name}`);
      } else {
        logResult('GET /hr/departments/:id', false, res.data.message);
      }
    } catch (e) {
      logResult('GET /hr/departments/:id', false, e.message);
    }
  }
}

async function testHRPositionEndpoints() {
  console.log('\n========== HR POSITION ENDPOINTS ==========\n');

  // 1. List positions
  try {
    const res = await makeRequest('GET', '/hr/positions', null, accessToken);
    if (res.status === 200) {
      logResult('GET /hr/positions', true, `Found ${res.data.data?.length || 0} positions`);
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
    if (res.status === 200 || res.status === 201) {
      testPositionId = res.data.data.id;
      logResult('POST /hr/positions', true, `Created position ID: ${testPositionId}`);
    } else {
      logResult('POST /hr/positions', false, res.data.message);
    }
  } catch (e) {
    logResult('POST /hr/positions', false, e.message);
  }
}

async function testHRJobGradeEndpoints() {
  console.log('\n========== HR JOB GRADE ENDPOINTS ==========\n');

  // 1. List job grades
  try {
    const res = await makeRequest('GET', '/hr/job-grades', null, accessToken);
    if (res.status === 200) {
      logResult('GET /hr/job-grades', true, `Found ${res.data.data?.length || 0} job grades`);
    } else {
      logResult('GET /hr/job-grades', false, res.data.message);
    }
  } catch (e) {
    logResult('GET /hr/job-grades', false, e.message);
  }

  // 2. Create job grade
  try {
    const res = await makeRequest('POST', '/hr/job-grades', {
      code: 'TEST-JG',
      name: 'Test Job Grade',
      minSalary: 5000000,
      maxSalary: 10000000,
      description: 'Test job grade 