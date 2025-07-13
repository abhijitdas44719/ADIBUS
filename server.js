const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require('path');
const validator = require('validator');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Email service configuration
const nodemailer = require('nodemailer');

// Twilio configuration
const twilio = require('twilio');
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client (only if credentials are provided)
let twilioClient = null;
if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
  twilioClient = twilio(twilioAccountSid, twilioAuthToken);
  console.log('✅ Twilio SMS service initialized');
} else {
  console.log('⚠️  Twilio credentials not found. SMS functionality disabled.');
}

// Email transporter configuration
let emailTransporter = null;

// Configure email service based on provider
function createEmailTransporter() {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  if (!emailUser || !emailPassword) {
    console.log('⚠️  Email credentials not found. Email functionality disabled.');
    return null;
  }

  let transportConfig = {};

  switch (emailService.toLowerCase()) {
    case 'gmail':
      transportConfig = {
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword // Use App Password for Gmail
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
      // Custom SMTP configuration
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
      return null;
  }

  try {
    const transporter = nodemailer.createTransporter(transportConfig);
    console.log(`✅ Email service initialized: ${emailService}`);
    return transporter;
  } catch (error) {
    console.error('❌ Email transporter creation failed:', error.message);
    return null;
  }
}

// Initialize email transporter
emailTransporter = createEmailTransporter();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true
}));

// Rate limiting
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP requests per windowMs
  message: {
    error: 'Too many OTP requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 verification attempts per windowMs
  message: {
    error: 'Too many verification attempts. Please try again later.',
    retryAfter: '15 minutes'
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// In-memory storage for OTPs (use Redis in production)
const otpStorage = new Map();

// Utility functions
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateSecureOTP() {
  // Generate cryptographically secure OTP
  const buffer = crypto.randomBytes(3);
  const otp = parseInt(buffer.toString('hex'), 16) % 1000000;
  return otp.toString().padStart(6, '0');
}

function formatPhoneNumber(phone, countryCode = '+91') {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // If phone starts with country code, return as is
  if (cleanPhone.startsWith(countryCode.replace('+', ''))) {
    return '+' + cleanPhone;
  }
  
  // Add country code
  return countryCode + cleanPhone;
}

function isValidPhoneNumber(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

function isValidEmail(email) {
  return validator.isEmail(email);
}

function maskContact(contact) {
  if (contact.includes('@')) {
    // Email masking
    const [username, domain] = contact.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(Math.max(0, username.length - 2)) + (username.length > 1 ? username.charAt(username.length - 1) : '');
    return maskedUsername + '@' + domain;
  } else {
    // Phone masking
    return contact.length > 6 
      ? contact.slice(0, 3) + '****' + contact.slice(-3)
      : '******';
  }
}

// Email template for OTP
function createOTPEmailTemplate(otp, userName = 'User') {
  return {
    subject: 'ADIBUS - Your Verification Code',
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ADIBUS - Verification Code</title>
        <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #d32f2f, #f44336); padding: 30px; text-align: center; }
            .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .header-text { color: white; font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
            .otp-container { background: #f8f9fa; border: 2px dashed #d32f2f; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .otp-label { font-size: 14px; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #d32f2f; letter-spacing: 8px; margin: 10px 0; }
            .otp-validity { font-size: 14px; color: #666; margin-top: 15px; }
            .instructions { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 30px 0; }
            .instructions h3 { color: #1976d2; margin: 0 0 10px 0; font-size: 16px; }
            .instructions ul { margin: 10px 0; padding-left: 20px; }
            .instructions li { margin: 5px 0; color: #333; }
            .security-note { background: #fff3e0; border-left: 4px solid #ff9800; padding: 20px; margin: 30px 0; }
            .security-note h3 { color: #f57c00; margin: 0 0 10px 0; font-size: 16px; }
            .footer { background: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
            .footer-text { color: #666; font-size: 14px; line-height: 1.6; }
            .social-links { margin: 20px 0; }
            .social-links a { display: inline-block; margin: 0 10px; color: #d32f2f; text-decoration: none; }
            @media (max-width: 600px) {
                .container { margin: 0 10px; }
                .content { padding: 30px 20px; }
                .otp-code { font-size: 28px; letter-spacing: 4px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚌 ADIBUS</div>
                <div class="header-text">Your Journey Starts Here</div>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${userName},</div>
                <p>Thank you for choosing ADIBUS! To complete your login, please use the verification code below:</p>
                
                <div class="otp-container">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                    <div class="otp-validity">⏰ Valid for 10 minutes</div>
                </div>
                
                <div class="instructions">
                    <h3>📋 How to use this code:</h3>
                    <ul>
                        <li>Return to the ADIBUS login page</li>
                        <li>Enter this 6-digit code in the verification field</li>
                        <li>Complete your profile setup</li>
                        <li>Start booking your bus tickets!</li>
                    </ul>
                </div>
                
                <div class="security-note">
                    <h3>🔒 Security Notice:</h3>
                    <p><strong>Never share this code with anyone.</strong> ADIBUS will never ask for your verification code via phone, email, or any other method. If you didn't request this code, please ignore this email.</p>
                </div>
                
                <p>If you have any questions or need assistance, our customer support team is available 24/7 to help you.</p>
                
                <p>Happy travels!<br><strong>The ADIBUS Team</strong></p>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    <strong>ADIBUS</strong> - India's Leading Bus Booking Platform<br>
                    Trusted by over 25 million customers worldwide
                </div>
                
                <div class="social-links">
                    <a href="#">📧 Support</a>
                    <a href="#">📱 Mobile App</a>
                    <a href="#">🌐 Website</a>
                </div>
                
                <div class="footer-text" style="margin-top: 20px; font-size: 12px; color: #999;">
                    This email was sent to you because you requested a verification code for ADIBUS.<br>
                    If you didn't make this request, please ignore this email.
                </div>
            </div>
        </div>
    </body>
    </html>
    `,
    text: `
Hello ${userName},

Your ADIBUS verification code is: ${otp}

This code is valid for 10 minutes. Please enter it on the login page to complete your verification.

Security Notice: Never share this code with anyone. ADIBUS will never ask for your verification code.

If you didn't request this code, please ignore this email.

Best regards,
The ADIBUS Team
    `
  };
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  const services = {
    server: 'OK',
    sms: twilioClient ? 'Available' : 'Disabled',
    email: emailTransporter ? 'Available' : 'Disabled'
  };
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ADIBUS OTP Service',
    services
  });
});

// Test email configuration
app.get('/api/test-email', async (req, res) => {
  if (!emailTransporter) {
    return res.status(503).json({
      success: false,
      error: 'Email service not configured'
    });
  }

  try {
    await emailTransporter.verify();
    res.json({
      success: true,
      message: 'Email service is working correctly'
    });
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Email service test failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Send OTP endpoint
app.post('/api/send-otp', otpLimiter, async (req, res) => {
  try {
    const { contact, method } = req.body;

    if (!contact || !method) {
      return res.status(400).json({
        success: false,
        error: 'Contact and method are required'
      });
    }

    // Validate based on method
    if (method === 'phone') {
      if (!isValidPhoneNumber(contact)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format'
        });
      }

      if (!twilioClient) {
        return res.status(503).json({
          success: false,
          error: 'SMS service not available. Please use email verification.'
        });
      }
    } else if (method === 'email') {
      if (!isValidEmail(contact)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      if (!emailTransporter) {
        return res.status(503).json({
          success: false,
          error: 'Email service not available. Please use phone verification.'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification method. Use "phone" or "email".'
      });
    }

    // Generate secure OTP
    const otp = generateSecureOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStorage.set(contact, {
      otp,
      expiryTime,
      attempts: 0,
      method
    });

    let deliveryResult = null;

    if (method === 'phone') {
      // Send SMS via Twilio
      const formattedPhone = formatPhoneNumber(contact);
      
      try {
        const message = await twilioClient.messages.create({
          body: `Your ADIBUS verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`,
          from: twilioPhoneNumber,
          to: formattedPhone
        });

        console.log(`✅ SMS sent successfully to ${formattedPhone}. Message SID: ${message.sid}`);
        deliveryResult = { type: 'SMS', messageId: message.sid };

      } catch (twilioError) {
        console.error('❌ Twilio Error:', twilioError);
        otpStorage.delete(contact);
        
        let errorMessage = 'Failed to send SMS';
        if (twilioError.code === 21211) errorMessage = 'Invalid phone number';
        else if (twilioError.code === 21614) errorMessage = 'Phone number cannot receive SMS';
        else if (twilioError.code === 21408) errorMessage = 'Permission denied for this phone number';

        return res.status(500).json({
          success: false,
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? twilioError.message : undefined
        });
      }
    } else if (method === 'email') {
      // Send Email via Nodemailer
      try {
        const emailTemplate = createOTPEmailTemplate(otp);
        
        const mailOptions = {
          from: {
            name: 'ADIBUS',
            address: process.env.EMAIL_USER
          },
          to: contact,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        };

        const info = await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${contact}. Message ID: ${info.messageId}`);
        deliveryResult = { type: 'Email', messageId: info.messageId };

      } catch (emailError) {
        console.error('❌ Email Error:', emailError);
        otpStorage.delete(contact);
        
        let errorMessage = 'Failed to send email';
        if (emailError.code === 'EAUTH') errorMessage = 'Email authentication failed';
        else if (emailError.code === 'ECONNECTION') errorMessage = 'Email service connection failed';

        return res.status(500).json({
          success: false,
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
        });
      }
    }

    res.json({
      success: true,
      message: `OTP sent successfully via ${method}`,
      maskedContact: maskContact(contact),
      expiresIn: 600, // 10 minutes in seconds
      delivery: deliveryResult
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', verifyLimiter, (req, res) => {
  try {
    const { contact, otp } = req.body;

    if (!contact || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Contact and OTP are required'
      });
    }

    const storedData = otpStorage.get(contact);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found or expired. Please request a new one.'
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedData.expiryTime) {
      otpStorage.delete(contact);
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStorage.delete(contact);
      return res.status(400).json({
        success: false,
        error: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedData.otp !== otp.toString()) {
      storedData.attempts += 1;
      otpStorage.set(contact, storedData);
      
      return res.status(400).json({
        success: false,
        error: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`
      });
    }

    // OTP verified successfully
    otpStorage.delete(contact);
    
    console.log(`✅ OTP verified successfully for ${contact} via ${storedData.method}`);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      contact: contact,
      method: storedData.method
    });

  } catch (error) {
    console.error('❌ Verification Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Resend OTP endpoint
app.post('/api/resend-otp', otpLimiter, async (req, res) => {
  try {
    const { contact } = req.body;

    if (!contact) {
      return res.status(400).json({
        success: false,
        error: 'Contact is required'
      });
    }

    const storedData = otpStorage.get(contact);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: 'No active OTP session found. Please start a new verification.'
      });
    }

    // Generate new OTP
    const otp = generateSecureOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update stored data
    otpStorage.set(contact, {
      ...storedData,
      otp,
      expiryTime,
      attempts: 0
    });

    let deliveryResult = null;

    if (storedData.method === 'phone') {
      // Resend SMS
      const formattedPhone = formatPhoneNumber(contact);
      
      try {
        const message = await twilioClient.messages.create({
          body: `Your ADIBUS verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`,
          from: twilioPhoneNumber,
          to: formattedPhone
        });

        console.log(`✅ SMS resent successfully to ${formattedPhone}. Message SID: ${message.sid}`);
        deliveryResult = { type: 'SMS', messageId: message.sid };

      } catch (twilioError) {
        console.error('❌ Twilio Resend Error:', twilioError);
        return res.status(500).json({
          success: false,
          error: 'Failed to resend SMS'
        });
      }
    } else if (storedData.method === 'email') {
      // Resend Email
      try {
        const emailTemplate = createOTPEmailTemplate(otp);
        
        const mailOptions = {
          from: {
            name: 'ADIBUS',
            address: process.env.EMAIL_USER
          },
          to: contact,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        };

        const info = await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Email resent successfully to ${contact}. Message ID: ${info.messageId}`);
        deliveryResult = { type: 'Email', messageId: info.messageId };

      } catch (emailError) {
        console.error('❌ Email Resend Error:', emailError);
        return res.status(500).json({
          success: false,
          error: 'Failed to resend email'
        });
      }
    }

    res.json({
      success: true,
      message: `OTP resent successfully via ${storedData.method}`,
      expiresIn: 600,
      delivery: deliveryResult
    });

  } catch (error) {
    console.error('❌ Resend Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  if (req.path.endsWith('.html')) {
    res.sendFile(path.join(__dirname, req.path));
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [contact, data] of otpStorage.entries()) {
    if (now > data.expiryTime) {
      otpStorage.delete(contact);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired OTP(s)`);
  }
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 ADIBUS Server running on port ${PORT}`);
  console.log(`📱 SMS service: ${twilioClient ? 'Available' : 'Disabled'}`);
  console.log(`📧 Email service: ${emailTransporter ? 'Available' : 'Disabled'}`);
  console.log(`🔐 OTP verification endpoints ready`);
  console.log(`🌐 Visit http://localhost:${PORT} to access the website`);
});

module.exports = app;