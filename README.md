# ADIBUS - Bus Booking Website with SMS & Email OTP Verification

A modern bus booking website with real SMS OTP verification using Twilio and Email OTP using Nodemailer.

## 🚀 Features

- **Dual OTP Verification** - Both SMS (Twilio) and Email (Nodemailer) support
- **Multiple Email Providers** - Gmail, Outlook, Yahoo, and custom SMTP
- **Responsive Design** - Works on all devices
- **User Session Management** - Persistent login across pages
- **Rate Limiting** - Protection against spam and abuse
- **Security Features** - Helmet.js, CORS, input validation
- **Professional UI** - Modern design with smooth animations
- **Real-time Validation** - Email and phone number format checking

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher)
2. **Email Account** with app password (Gmail recommended)
3. **Twilio Account** (optional, for SMS functionality)

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Email Service Setup

#### For Gmail (Recommended):
1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in your .env file

#### For Other Providers:
- **Outlook/Hotmail**: Use your regular password
- **Yahoo**: Generate app password in account security
- **Custom SMTP**: Configure SMTP settings

### 3. Twilio Setup (Optional)

1. **Sign up for Twilio**: Go to [https://www.twilio.com/](https://www.twilio.com/)
2. **Get your credentials**:
   - Account SID (found in Twilio Console Dashboard)
   - Auth Token (found in Twilio Console Dashboard)
3. **Purchase a phone number**:
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number that supports SMS

### 4. Environment Configuration

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file** with your credentials:
   ```env
   # Email Configuration (Required)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # Twilio Configuration (Optional)
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

### 5. Test Email Configuration

```bash
npm run test
```

This will send a test email to verify your configuration.

### 6. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📱 How to Use

### For Users:

1. **Visit the website**: Go to `http://localhost:3000`
2. **Click Login**: Click the login button in the navigation
3. **Choose Verification Method**: 
   - **Phone**: Enter mobile number → Receive SMS OTP
   - **Email**: Enter email address → Receive Email OTP
4. **Enter OTP**: Input the 6-digit code you received
5. **Complete Profile**: Enter your name to complete registration
6. **Access Website**: You're now logged in across all pages

### For Testing:

#### Email Testing:
- Use any valid email address
- Check your email inbox for the OTP
- OTP emails include professional HTML templates

#### SMS Testing (if Twilio configured):
- Use your real phone number to receive actual SMS
- Check server logs for detailed information

## 🔐 Security Features

- **Rate Limiting**: 5 OTP requests per 15 minutes per IP
- **OTP Expiration**: 10-minute expiry for security
- **Attempt Limiting**: Maximum 3 verification attempts per OTP
- **Input Validation**: Email and phone number format validation
- **CORS Protection**: Configured for production use
- **Helmet.js**: Security headers and protection
- **Memory Cleanup**: Automatic cleanup of expired OTPs

## 🛠️ API Endpoints

### Send OTP
```
POST /api/send-otp
Content-Type: application/json

{
  "contact": "user@example.com" or "1234567890",
  "method": "email" or "phone"
}
```

### Verify OTP
```
POST /api/verify-otp
Content-Type: application/json

{
  "contact": "user@example.com" or "1234567890",
  "otp": "123456"
}
```

### Resend OTP
```
POST /api/resend-otp
Content-Type: application/json

{
  "contact": "user@example.com" or "1234567890"
}
```

### Health Check
```
GET /api/health
```

### Test Email Service
```
GET /api/test-email
```

## 📧 Email Features

### Professional Email Templates:
- **HTML Format**: Beautiful, responsive email design
- **Text Fallback**: Plain text version for all email clients
- **Branding**: ADIBUS branded templates
- **Security Notices**: Clear security information
- **Instructions**: Step-by-step guidance

### Supported Email Services:
- **Gmail**: Most reliable, recommended
- **Outlook/Hotmail**: Microsoft email services
- **Yahoo Mail**: Yahoo email service
- **Custom SMTP**: Any SMTP server

## 🌐 Production Deployment

### Environment Variables for Production:
```env
NODE_ENV=production
PORT=80
EMAIL_SERVICE=gmail
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASSWORD=your_production_app_password
FRONTEND_URL=https://yourdomain.com
```

### Recommended Production Setup:
- Use **Redis** instead of in-memory storage for OTPs
- Implement **database** for user management
- Add **SSL/HTTPS** encryption
- Use **PM2** for process management
- Implement **logging** with Winston
- Add **monitoring** and alerting

## 🔍 Troubleshooting

### Common Issues:

1. **Email not received**:
   - Check spam/junk folder
   - Verify email address is correct
   - Run `npm run test` to test email configuration
   - Check server logs for email delivery status

2. **Gmail authentication error**:
   - Enable 2-factor authentication
   - Generate App Password (not regular password)
   - Use App Password in EMAIL_PASSWORD

3. **SMS not received** (if using Twilio):
   - Check if phone number is valid and can receive SMS
   - Verify Twilio phone number is SMS-enabled
   - Check Twilio console for delivery status

4. **Rate limiting errors**:
   - Wait 15 minutes before trying again
   - Check if you're exceeding the rate limits

### Debug Mode:
Set `NODE_ENV=development` to see detailed error messages and logs.

## 📞 Support

For Email-related issues:
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Documentation](https://nodemailer.com/)

For Twilio-related issues:
- [Twilio Documentation](https://www.twilio.com/docs)
- [Twilio Support](https://support.twilio.com/)

For application issues:
- Check server logs for detailed error information
- Ensure all environment variables are properly set
- Run the email test script: `npm run test`

## 🔄 Updates and Maintenance

- **OTP Cleanup**: Expired OTPs are automatically cleaned every 5 minutes
- **Rate Limit Reset**: Rate limits reset every 15 minutes
- **Session Management**: User sessions persist until manual logout
- **Security Updates**: Regularly update dependencies for security patches

## 🎯 Demo Instructions

1. **Configure Email**: Set up Gmail with App Password in .env
2. **Start Server**: Run `npm run dev`
3. **Visit Login**: Go to `http://localhost:3000/login.html`
4. **Choose Email**: Select email verification method
5. **Enter Email**: Use your real email address
6. **Check Email**: Look for OTP in your inbox (check spam too)
7. **Enter OTP**: Input the 6-digit code from email
8. **Complete Profile**: Provide your name
9. **Enjoy**: Navigate the site with your logged-in status

The system now supports both **real SMS via Twilio** and **real Email via Nodemailer** with professional templates and comprehensive error handling!