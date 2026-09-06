import nodemailer from 'nodemailer';

async function test() {
  console.log("Sending real test email to hemkumarr2803@gmail.com...");
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
    logger: true,
    debug: true
  });

  try {
    const info = await transporter.sendMail({
      from: `"RAARYA Groups Verification" <${smtpUser}>`,
      to: 'hemkumarr2803@gmail.com',
      subject: 'RAARYA Verification Code Test - 998877',
      html: '<h2>Your RAARYA verification code is: 998877</h2>'
    });
    console.log("SUCCESS! Accepted by Gmail SMTP:", info.accepted);
    console.log("MessageId:", info.messageId);
    console.log("Response:", info.response);
  } catch (err) {
    console.error("FAILED! Error:", err);
  }
}

test();
