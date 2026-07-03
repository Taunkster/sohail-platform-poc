const http = require('http');

// Configuration matching your local Docker Compose setup
const API_URL = 'http://localhost:3001/tasks';
const TOKENS = {
  A: 'student-tenant-a', // Ensure this matches your actual JWT/Auth setup
  B: 'student-tenant-b'
};

const makeRequest = (tenant) => {
  return new Promise((resolve, reject) => {
    const req = http.get(API_URL, {
      headers: { 'Authorization': `Bearer ${TOKENS[tenant]}` }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ tenant, status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ tenant, status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
  });
};

async function runTest() {
  console.log('Starting Concurrency Correctness Test...');
  const iterations = 100; // 200 total concurrent requests
  const promises = [];

  // Interleave the requests to intentionally stress the connection pool
  for (let i = 0; i < iterations; i++) {
    promises.push(makeRequest('A'));
    promises.push(makeRequest('B'));
  }

  const results = await Promise.all(promises);
  let leaks = 0;
  let errors = 0;

  results.forEach(res => {
    if (res.status !== 200 && res.status !== 201) {
      errors++;
      return;
    }

    // Check for leaks: If Tenant A gets a Tenant B task (or vice versa)
    const records = Array.isArray(res.data) ? res.data : [res.data];
    records.forEach(record => {
      // Assuming your task records have a 'tenantId' or specific identifying field
      // Adjust this condition based on your exact JSON response structure!
      if (record.tenantId && record.tenantId !== `tenant-${res.tenant.toLowerCase()}`) {
         console.error(`LEAK DETECTED! Request for Tenant ${res.tenant} returned record for ${record.tenantId}`);
         leaks++;
      }
    });
  });

  console.log(`\n Test Complete: ${iterations * 2} Requests Fired.`);
  console.log(`Successful Requests: ${results.length - errors}`);
  console.log(`Network Errors: ${errors}`);
  
  if (leaks === 0) {
    console.log(`\n ISOLATION HOLDS. No context leaks detected under concurrent load!`);
  } else {
    console.log(`\nCRITICAL FAILURE: ${leaks} data leaks detected.`);
  }
}

runTest();