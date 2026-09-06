async function testLogin() {
  console.log('Testing Vercel API /api/login for hemkumarjayanthi@gmail.com...');
  try {
    const res = await fetch('https://raarya-fawn.vercel.app/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: 'hemkumarjayanthi@gmail.com', password: 'mysecretpassword' })
    });
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testLogin();
