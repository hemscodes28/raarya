import nodemailer from 'nodemailer';

async function testInstant() {
  const start = Date.now();
  console.log("Testing instant email dispatch...");

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    pool: true,
    maxConnections: 5,
    auth: {
      user: 'raaryagroups@gmail.com',
      pass: 'hbtpxiotrupxdsoe'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"RAARYA Groups" <raaryagroups@gmail.com>',
      to: 'hemkumarr2803@gmail.com',
      subject: 'URGENT: Your RAARYA Verification Code is 771122',
      text: 'Your RAARYA verification code is 771122. Valid for 10 minutes.',
      html: '<h1 style="color: #f59e0b;">Your Verification Code: 771122</h1>',
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    });
    const elapsed = Date.now() - start;
    console.log(`Dispatched in ${elapsed}ms! Accepted:`, info.accepted);
    console.log("Response:", info.response);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    transporter.close();
  }
}

testInstant();
