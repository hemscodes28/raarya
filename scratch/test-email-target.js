async function testSendOtp() {
  console.log('Testing Vercel API /api/send-otp for hemkumarr2803@gmail.com...');
  try {
    const res = await fetch('https://raarya-fawn.vercel.app/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hemkumarr2803@gmail.com' })
    });
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testSendOtp();
