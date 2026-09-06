async function testAllEmails() {
  const emails = ['hemkumarjayanthi@gmail.com', 'hemkumarr2803@gmail.com'];
  for (const email of emails) {
    console.log(`\nTesting /api/send-otp for: ${email}`);
    try {
      const res = await fetch('https://raarya-fawn.vercel.app/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: email, email: '' }) // test passing email as phone param
      });
      const data = await res.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error:', err);
    }
  }
}

testAllEmails();
