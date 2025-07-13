// Email service test script
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...\n');

  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.log('❌ Email credentials not found in .env file');
    console.log('Please configure EMAIL_USER and EMAIL_PASSWORD');
    return;
  }

  console.log(`📧 Email Service: ${emailService}`);
  console.log(`👤 Email User: ${emailUser}`);
  console.log(`🔐 Password: ${'*'.repeat(emailPassword.length)}\n`);

  let transportConfig = {};

  switch (emailService.toLowerCase()) {
    case 'gmail':
      transportConfig = {
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      };
      break;
    
    case 'outlook':
    case 'hotmail':
      transportConfig = {
        service: 'hotmail',
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      };
      break;
    
    case 'yahoo':
      transportConfig = {
        service: 'yahoo',
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      };
      break;
    
    case 'smtp':
      transportConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      };
      break;
    
    default:
      console.log('❌ Unsupported email service:', emailService);
      return;
  }

  try {
    console.log('🔄 Creating email transporter...');
    const transporter = nodemailer.createTransporter(transportConfig);

    console.log('🔄 Verifying email configuration...');
    await transporter.verify();
    console.log('✅ Email configuration verified successfully!\n');

    console.log('🔄 Sending test email...');
    const testEmail = {
      from: {
        name: 'ADIBUS Test',
        address: emailUser
      },
      to: emailUser, // Send to self for testing
      subject: 'ADIBUS Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d32f2f, #f44336); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🚌 ADIBUS</h1>
            <p style="color: white; margin: 10px 0 0 0;">Email Service Test</p>
          </div>
          <div style="padding: 30px; background: white;">
            <h2 style="color: #333;">✅ Email Service Working!</h2>
            <p>Congratulations! Your email service is configured correctly and ready to send OTP emails.</p>
            <div style="background: #f8f9fa; border: 2px dashed #d32f2f; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <div style="font-size: 24px; font-weight: bold; color: #d32f2f;">123456</div>
              <div style="font-size: 14px; color: #666; margin-top: 10px;">Sample OTP Code</div>
            </div>
            <p><strong>Service:</strong> ${emailService}</p>
            <p><strong>From:</strong> ${emailUser}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `
ADIBUS Email Service Test

✅ Email Service Working!

Congratulations! Your email service is configured correctly and ready to send OTP emails.

Sample OTP Code: 123456

Service: ${emailService}
From: ${emailUser}
Time: ${new Date().toLocaleString()}
      `
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Check your inbox: ${emailUser}\n`);

    console.log('🎉 Email service is ready for production use!');

  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   - Email address is correct');
      console.log('   - Password/App Password is correct');
      console.log('   - 2-factor authentication is enabled (for Gmail)');
      console.log('   - App Password is generated (for Gmail)');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Please check:');
      console.log('   - Internet connection');
      console.log('   - Email service settings');
      console.log('   - Firewall/proxy settings');
    }
  }
}

// Run the test
testEmailService();