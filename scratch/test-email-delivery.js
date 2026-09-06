import nodemailer from 'nodemailer';

async function testGmailSmtp() {
  console.log("Testing Gmail SMTP dispatch with clean headers...");
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'raaryagroups@gmail.com',
      pass: 'hbtpxiotrupxdsoe'
    }
  });

  try {
    const info = await transporter.sendMail({
      from: 'raaryagroups@gmail.com',
      to: 'hemkumarr2803@gmail.com',
      subject: 'RAARYA Security OTP: 543210',
      text: 'Your RAARYA verification code is 543210. Valid for 10 minutes.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>RAARYA Verification Code</h2>
          <p>Your 6-digit security OTP code is:</p>
          <h1 style="color: #d97706; letter-spacing: 5px;">543210</h1>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `
    });
    console.log("Sent successfully! Info:", info);
  } catch (err) {
    console.error("Gmail error:", err);
  }
}

testGmailSmtp();
