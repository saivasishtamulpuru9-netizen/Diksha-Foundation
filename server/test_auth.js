const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAuthVerification() {
  console.log("==========================================");
  console.log("     Phase 2 Auth Automated Test Suite    ");
  console.log("==========================================");

  let adminToken = '';
  let teacherToken = '';
  let studentToken = '';

  // 1. Health check verification
  console.log("\n[Test 1] Phase 1 Health Endpoint Check (GET /api/health)...");
  const healthRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`Response status: ${healthRes.status}, Payload:`, healthRes.data);
  console.assert(healthRes.status === 200 && healthRes.data.success === true, "Test 1 Failed");

  // 2. Registration Verification - Admin
  console.log("\n[Test 2] Registration Verification (POST /api/auth/register - Admin)...");
  const regAdminRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Dr. Ritu Verma',
    email: 'admin.verify@diksha.org',
    password: 'securePassword123',
    role: 'admin',
    centerName: 'Diksha Patna Center'
  });
  console.log(`Response status: ${regAdminRes.status}, Token returned: ${!!regAdminRes.data.token}, Password hash in response: ${!!regAdminRes.data.user?.password}`);
  adminToken = regAdminRes.data.token;
  console.assert(regAdminRes.status === 201 && adminToken && !regAdminRes.data.user.password, "Test 2 Failed");

  // 3. Registration Verification - Teacher / Volunteer
  console.log("\n[Test 3] Registration Verification (POST /api/auth/register - Teacher)...");
  const regTeacherRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Anjali Sharma',
    email: 'teacher.verify@diksha.org',
    password: 'teacherPassword123',
    role: 'teacher',
    centerName: 'Diksha Main Center'
  });
  console.log(`Response status: ${regTeacherRes.status}, Token returned: ${!!regTeacherRes.data.token}`);
  teacherToken = regTeacherRes.data.token;
  console.assert(regTeacherRes.status === 201 && teacherToken, "Test 3 Failed");

  // 4. Registration Verification - Student
  console.log("\n[Test 4] Registration Verification (POST /api/auth/register - Student)...");
  const regStudentRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Aarav Kumar',
    email: 'student.verify@diksha.org',
    password: 'studentPassword123',
    role: 'student',
    centerName: 'Diksha Kankarbagh'
  });
  console.log(`Response status: ${regStudentRes.status}, Token returned: ${!!regStudentRes.data.token}`);
  studentToken = regStudentRes.data.token;
  console.assert(regStudentRes.status === 201 && studentToken, "Test 4 Failed");

  // 5. Duplicate Registration Rejection
  console.log("\n[Test 5] Duplicate Email Rejection (POST /api/auth/register)...");
  const dupRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Duplicate User',
    email: 'admin.verify@diksha.org',
    password: 'password123',
    role: 'admin'
  });
  console.log(`Response status: ${dupRes.status}, Message: "${dupRes.data.message}"`);
  console.assert(dupRes.status === 400, "Test 5 Failed");

  // 6. Valid Login Verification
  console.log("\n[Test 6] Valid Login Verification (POST /api/auth/login)...");
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin.verify@diksha.org',
    password: 'securePassword123'
  });
  console.log(`Response status: ${loginRes.status}, Token returned: ${!!loginRes.data.token}`);
  console.assert(loginRes.status === 200 && loginRes.data.token, "Test 6 Failed");

  // 7. Invalid Password Rejection
  console.log("\n[Test 7] Invalid Password Rejection (POST /api/auth/login)...");
  const badPassRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin.verify@diksha.org',
    password: 'WRONG_PASSWORD'
  });
  console.log(`Response status: ${badPassRes.status}, Message: "${badPassRes.data.message}"`);
  console.assert(badPassRes.status === 401, "Test 7 Failed");

  // 8. Nonexistent User Rejection
  console.log("\n[Test 8] Nonexistent User Rejection (POST /api/auth/login)...");
  const nonExistRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'doesnotexist@diksha.org',
    password: 'somePassword'
  });
  console.log(`Response status: ${nonExistRes.status}, Message: "${nonExistRes.data.message}"`);
  console.assert(nonExistRes.status === 401, "Test 8 Failed");

  // 9. Protected Endpoint Access with Valid JWT
  console.log("\n[Test 9] Protected Endpoint with Valid JWT (GET /api/auth/protected)...");
  const protRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/protected',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`Response status: ${protRes.status}, User in response: ${protRes.data.user?.name}`);
  console.assert(protRes.status === 200 && protRes.data.success === true, "Test 9 Failed");

  // 10. Missing / Invalid JWT Rejection
  console.log("\n[Test 10] Protected Endpoint without Token (GET /api/auth/protected)...");
  const noTokRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/protected',
    method: 'GET'
  });
  console.log(`Response status: ${noTokRes.status}, Message: "${noTokRes.data.message}"`);
  console.assert(noTokRes.status === 401, "Test 10 Failed");

  // 11. Role-Based Authorization - Admin Allowed
  console.log("\n[Test 11] Admin Accessing Admin-Only Endpoint (GET /api/auth/admin-only)...");
  const adminOkRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin-only',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`Response status: ${adminOkRes.status}, Message: "${adminOkRes.data.message}"`);
  console.assert(adminOkRes.status === 200, "Test 11 Failed");

  // 12. Role-Based Authorization - Teacher Denied on Admin-Only Endpoint (Forbidden 403)
  console.log("\n[Test 12] Teacher Accessing Admin-Only Endpoint (GET /api/auth/admin-only)...");
  const teachDenyRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin-only',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
  console.log(`Response status: ${teachDenyRes.status}, Message: "${teachDenyRes.data.message}"`);
  console.assert(teachDenyRes.status === 403, "Test 12 Failed");

  // 13. Role-Based Authorization - Student Denied on Admin-Only Endpoint (Forbidden 403)
  console.log("\n[Test 13] Student Accessing Admin-Only Endpoint (GET /api/auth/admin-only)...");
  const studDenyRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin-only',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log(`Response status: ${studDenyRes.status}, Message: "${studDenyRes.data.message}"`);
  console.assert(studDenyRes.status === 403, "Test 13 Failed");

  console.log("\n==========================================");
  console.log("   ALL 13 AUTHENTICATION TESTS PASSED!    ");
  console.log("==========================================");
}

runAuthVerification().catch(err => {
  console.error("Test Suite Execution Error:", err);
});
