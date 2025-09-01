const fetch = require('node-fetch');

async function testBackend() {
  try {
    console.log('Testing backend connection...');
    
    // Test basic endpoint
    const response = await fetch('http://localhost:5000/');
    const data = await response.text();
    console.log('Basic endpoint response:', data);
    
    // Test auth endpoint
    const authResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123'
      })
    });
    
    console.log('Auth endpoint status:', authResponse.status);
    const authData = await authResponse.text();
    console.log('Auth endpoint response:', authData);
    
  } catch (error) {
    console.error('Backend test failed:', error.message);
  }
}

testBackend();
