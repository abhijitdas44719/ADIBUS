const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Infobip configuration
const { Infobip, AuthType } = require('@infobip-api/sdk');
const infobip = new Infobip({
  baseUrl: process.env.INFOBIP_BASE_URL || 'https://api.infobip.com',
  apiKey: process.env.INFOBIP_API_KEY,
  authType: AuthType.ApiKey,
});

if (!process.env.INFOBIP_API_KEY || !process.env.INFOBIP_SENDER_ID) {
  console.error('❌ Missing Infobip credentials. Please check your .env file.');
  process.exit(1);
}

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
  origin: process.env.NODE_ENV === 'production' ? 'https://abhijitdas44719.github.io/ADIBUS/' : true,
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
  max: 10, // Limit each IP to 10 verification attempts per windowMs
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ADIBUS OTP Service'
  });
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

    if (method === 'phone') {
      if (!isValidPhoneNumber(contact)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format'
        });
      }
    } else if (method === 'email') {
      if (!isValidEmail(contact)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
      
      // For email, we'll simulate OTP for now
      return res.status(400).json({
        success: false,
        error: 'Email OTP not implemented yet. Please use phone verification.'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification method'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStorage.set(contact, {
      otp,
      expiryTime,
      attempts: 0,
      method
    });

    // Format phone number
    const formattedPhone = formatPhoneNumber(contact);

    // Send SMS via Infobip
    try {
      const smsResponse = await infobip.channels.sms.send({
        messages: [{
          destinations: [{ to: formattedPhone }],
          from: process.env.INFOBIP_SENDER_ID,
          text: `Your ADIBUS verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`
        }]
      });

      console.log(`✅ SMS sent successfully to ${formattedPhone}. Message ID: ${smsResponse.messages[0].messageId}`);

      res.json({
        success: true,
        message: 'OTP sent successfully',
        maskedContact: contact.slice(0, -6) + '******',
        expiresIn: 600 // 10 minutes in seconds
      });

    } catch (infobipError) {
      console.error('❌ Infobip Error:', infobipError);
      
      // Remove OTP from storage if SMS failed
      otpStorage.delete(contact);
      
      let errorMessage = 'Failed to send SMS';
      
      if (infobipError.response?.status === 400) {
        errorMessage = 'Invalid phone number';
      } else if (infobipError.response?.status === 403) {
        errorMessage = 'Permission denied for this phone number';
      }

      res.status(500).json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? infobipError.message : undefined
      });
    }

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
    
    console.log(`✅ OTP verified successfully for ${contact}`);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      contact: contact
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
        error: 'No active OTP session found'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update stored data
    otpStorage.set(contact, {
      ...storedData,
      otp,
      expiryTime,
      attempts: 0
    });

    // Format phone number and send SMS
    const formattedPhone = formatPhoneNumber(contact);

    try {
      const smsResponse = await infobip.channels.sms.send({
        messages: [{
          destinations: [{ to: formattedPhone }],
          from: process.env.INFOBIP_SENDER_ID,
          text: `Your ADIBUS verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`
        }]
      });

      console.log(`✅ OTP resent successfully to ${formattedPhone}. Message ID: ${smsResponse.messages[0].messageId}`);

      res.json({
        success: true,
        message: 'OTP resent successfully',
        expiresIn: 600
      });

    } catch (infobipError) {
      console.error('❌ Infobip Resend Error:', infobipError);
      
      res.status(500).json({
        success: false,
        error: 'Failed to resend SMS'
      });
    }

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
  for (const [contact, data] of otpStorage.entries()) {
    if (now > data.expiryTime) {
      otpStorage.delete(contact);
      console.log(`🧹 Cleaned up expired OTP for ${contact}`);
    }
  }
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 ADIBUS Server running on port ${PORT}`);
  console.log(`📱 Infobip SMS service initialized`);
  console.log(`🔐 OTP verification endpoints ready`);
  console.log(`🌐 Visit http://localhost:${PORT} to access the website`);
});

module.exports = app;
