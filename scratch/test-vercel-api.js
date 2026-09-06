async function testVercelApi() {
  console.log("Posting to https://raarya-fawn.vercel.app/api/send-otp...");
  try {
    const res = await fetch('https://raarya-fawn.vercel.app/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hemkumarr2803@gmail.com' })
    });
    const status = res.status;
    const json = await res.json();
    console.log("Status:", status);
    console.log("Response JSON:", json);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testVercelApi();
