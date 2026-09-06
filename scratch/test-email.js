import nodemailer from 'nodemailer';

async function test() {
  console.log("Testing Gmail SMTP connection...");
  const smtpUser = 'raaryagroups@gmail.com';
  const smtpPass = 'hbtpxiotrupxdsoe';

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"RAARYA Groups Test" <${smtpUser}>`,
      to: 'raaryagroups@gmail.com',
      subject: 'Test Verification Email',
      html: '<h1>Test Email from RAARYA</h1>'
    });
    console.log("SUCCESS! MessageId:", info.messageId);
  } catch (err) {
    console.error("FAILED! Error details:", err);
  }
}

test();
