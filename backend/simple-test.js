const http = require('http');

function test(method, path, data, token) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1' + path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    
    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch(e) { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('=== AUTH TESTS ===');
  
  let r = await test('POST', '/auth/login', { nik: 'ADMIN001', password: 'Admin@123' });
  console.log('POST /auth/login:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  if (!r.data.success) { console.log('Cannot continue without token'); return; }
  
  const token = r.data.data.accessToken;
  const refresh = r.data.data.refreshToken;
  console.log('  Token obtained, roles:', r.data.data.user.roles);
  
  r = await test('GET', '/auth/me', null, token);
  console.log('GET /auth/me:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  r = await test('POST', '/auth/refresh', { refreshToken: refresh });
  console.log('POST /auth/refresh:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  console.log('\n=== USER TESTS ===');
  
  r = await test('GET', '/users', null, token);
  console.log('GET /users:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  r = await test('GET', '/roles', null, token);
  console.log('GET /roles:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  r = await test('GET', '/permissions', null, token);
  console.log('GET /permissions:', r.data.success ? 'PASS (' + (r.data.data?.length || 0) + ')' : 'FAIL - ' + r.data.message);
  
  console.log('\n=== HR DIVISION TESTS ===');
  
  r = await test('GET', '/hr/divisions', null, token);
  console.log('GET /hr/divisions:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  r = await test('POST', '/hr/divisions', { code: 'TEST-DIV', name: 'Test Division' }, token);
  console.log('POST /hr/divisions:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  const divId = r.data.data?.id;
  
  if (divId) {
    r = await test('GET', '/hr/divisions/' + divId, null, token);
    console.log('GET /hr/divisions/:id:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
    
    r = await test('PATCH', '/hr/divisions/' + divId, { name: 'Test Division Updated' }, token);
    console.log('PATCH /hr/divisions/:id:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  }
  
  console.log('\n=== HR DEPARTMENT TESTS ===');
  
  r = await test('GET', '/hr/departments', null, token);
  console.log('GET /hr/departments:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  if (divId) {
    r = await test('POST', '/hr/departments', { code: 'TEST-DEPT', name: 'Test Department', divisionId: divId }, token);
    console.log('POST /hr/departments:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
    const deptId = r.data.data?.id;
    
    if (deptId) {
      r = await test('GET', '/hr/departments/' + deptId, null, token);
      console.log('GET /hr/departments/:id:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
      
      r = await test('DELETE', '/hr/departments/' + deptId, null, token);
      console.log('DELETE /hr/departments/:id:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
    }
    
    r = await test('DELETE', '/hr/divisions/' + divId, null, token);
    console.log('DELETE /hr/divisions/:id:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  }
  
  console.log('\n=== HR POSITION TESTS ===');
  
  r = await test('GET', '/hr/positions', null, token);
  console.log('GET /hr/positions:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  r = await test('POST', '/hr/positions', { code: 'TEST-POS', name: 'Test Position', level: 5 }, token);
  console.log('POST /hr/positions:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  const posId = r.data.data?.id;
  
  if (posId) {
    r = await test('DELETE', '/hr/positions/' + posId, null, token);
    console.log('DELETE /hr/positions/:id:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  }
  
  console.log('\n=== HR JOB GRADE TESTS ===');
  
  r = await test('GET', '/hr/job-grades', null, token);
  console.log('GET /hr/job-grades:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  r = await test('POST', '/hr/job-grades', { code: 'TEST-JG', name: 'Test Job Grade', minSalary: 5000000, maxSalary: 10000000 }, token);
  console.log('POST /hr/job-grades:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  const jgId = r.data.data?.id;
  
  if (jgId) {
    r = await test('DELETE', '/hr/job-grades/' + jgId, null, token);
    console.log('DELETE /hr/job-grades/:id:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  }
  
  console.log('\n=== HR EMPLOYMENT STATUS TESTS ===');
  
  r = await test('GET', '/hr/employment-statuses', null, token);
  console.log('GET /hr/employment-statuses:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  console.log('\n=== HR WORK LOCATION TESTS ===');
  
  r = await test('GET', '/hr/work-locations', null, token);
  console.log('GET /hr/work-locations:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  console.log('\n=== HR ORGANIZATION TESTS ===');
  
  r = await test('GET', '/hr/organization/tree', null, token);
  console.log('GET /hr/organization/tree:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  r = await test('GET', '/hr/organization/department-hierarchy', null, token);
  console.log('GET /hr/organization/department-hierarchy:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  console.log('\n=== HR EMPLOYEE TESTS ===');
  
  r = await test('GET', '/hr/employees', null, token);
  console.log('GET /hr/employees:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  r = await test('GET', '/hr/employees/statistics', null, token);
  console.log('GET /hr/employees/statistics:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  r = await test('GET', '/hr/employees/contract-expiring', null, token);
  console.log('GET /hr/employees/contract-expiring:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  console.log('\n=== AUDIT TESTS ===');
  
  r = await test('GET', '/audit/logs', null, token);
  console.log('GET /audit/logs:', r.data.success ? 'PASS' : 'FAIL - ' + r.data.message);
  
  console.log('\n=== TEST COMPLETE ===');
}

run().catch(console.error);