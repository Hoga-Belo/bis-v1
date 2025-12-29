const http = require('http');

// First login to get token
const loginData = JSON.stringify({
  nik: 'ADMIN001',
  password: 'Admin@123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('Testing Backend Endpoints...\n');

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    if (result.success) {
      console.log('✅ Login successful');
      const token = result.data.accessToken;
      
      // Test endpoints
      testEndpoints(token);
    } else {
      console.log('❌ Login failed:', result.message);
    }
  });
});

loginReq.on('error', (e) => {
  console.error('Login error:', e.message);
});

loginReq.write(loginData);
loginReq.end();

function testEndpoints(token) {
  const endpoints = [
    { path: '/api/v1/hr/employees/statistics', name: 'Employee Statistics' },
    { path: '/api/v1/hr/employees/contracts/expiring', name: 'Contract Expiring' },
    { path: '/api/v1/hr/employees', name: 'Employee List' },
    { path: '/api/v1/audit/logs', name: 'Audit Logs' },
    { path: '/api/v1/hr/divisions', name: 'Divisions' },
    { path: '/api/v1/hr/departments', name: 'Departments' },
    { path: '/api/v1/hr/positions', name: 'Positions' },
    { path: '/api/v1/hr/job-grades', name: 'Job Grades' },
    { path: '/api/v1/hr/employment-statuses', name: 'Employment Statuses' },
    { path: '/api/v1/hr/work-locations', name: 'Work Locations' },
    { path: '/api/v1/hr/organization/tree', name: 'Organization Tree' },
    { path: '/api/v1/hr/organization/departments', name: 'Department Hierarchy' },
  ];

  let completed = 0;
  const results = [];

  endpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint.path,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let status = res.statusCode === 200 ? '✅' : '❌';
          let message = '';
          
          try {
            const result = JSON.parse(data);
            if (result.success === false) {
              status = '❌';
              message = result.message || 'Unknown error';
            }
          } catch (e) {
            if (res.statusCode !== 200) {
              message = data.substring(0, 100);
            }
          }
          
          results.push({
            name: endpoint.name,
            path: endpoint.path,
            status: res.statusCode,
            success: status === '✅',
            message
          });
          
          completed++;
          if (completed === endpoints.length) {
            printResults(results);
          }
        });
      });

      req.on('error', (e) => {
        results.push({
          name: endpoint.name,
          path: endpoint.path,
          status: 'ERROR',
          success: false,
          message: e.message
        });
        completed++;
        if (completed === endpoints.length) {
          printResults(results);
        }
      });

      req.end();
    }, index * 100); // Stagger requests
  });
}

function printResults(results) {
  console.log('\n========== TEST RESULTS ==========\n');
  
  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`${icon} ${r.name}`);
    console.log(`   Path: ${r.path}`);
    console.log(`   Status: ${r.status}`);
    if (r.message) {
      console.log(`   Message: ${r.message}`);
    }
    console.log('');
  });
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('==================================');
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('==================================');
}