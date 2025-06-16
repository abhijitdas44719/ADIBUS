# ADIBUS - Bus Booking Website with SMS OTP Verification

A modern bus booking website with real SMS OTP verification using Twilio.

## 🚀 Features

- **Real SMS OTP Verification** using Twilio
- **Dual Authentication** - Phone number and Email (SMS implemented)
- **Responsive Design** - Works on all devices
- **User Session Management** - Persistent login across pages
- **Rate Limiting** - Protection against spam and abuse
- **Security Features** - Helmet.js, CORS, input validation
- **Professional UI** - Modern design with smooth animations

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher)
2. **Twilio Account** with:
   - Account SID
   - Auth Token
   - Phone Number (for sending SMS)

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Twilio Setup

1. **Sign up for Twilio**: Go to [https://www.twilio.com/](https://www.twilio.com/)
2. **Get your credentials**:
   - Account SID (found in Twilio Console Dashboard)
   - Auth Token (found in Twilio Console Dashboard)
3. **Purchase a phone number**:
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number that supports SMS
   - Note down the phone number (format: +1234567890)

### 3. Environment Configuration

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file** with your Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   PORT=3000
   NODE_ENV=development
   ```

### 4. Start the Server

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
3. **Choose Phone Verification**: Select phone number verification
4. **Enter Phone Number**: Enter your mobile number with country code
5. **Receive SMS**: You'll receive an SMS with a 6-digit OTP
6. **Enter OTP**: Input the OTP code you received
7. **Complete Profile**: Enter your name to complete registration
8. **Access Website**: You're now logged in across all pages

### For Testing:

- Use your real phone number to receive actual SMS
- Check server logs for detailed information
- OTP expires in 10 minutes
- Maximum 3 verification attempts per OTP
- Rate limiting: 5 OTP requests per 15 minutes per IP

## 🔐 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **OTP Expiration**: 10-minute expiry for security
- **Attempt Limiting**: Maximum 3 verification attempts
- **Input Validation**: Phone number and email format validation
- **CORS Protection**: Configured for production use
- **Helmet.js**: Security headers and protection
- **Memory Cleanup**: Automatic cleanup of expired OTPs

## 🛠️ API Endpoints

### Send OTP
```
POST /api/send-otp
Content-Type: application/json

{
  "contact": "1234567890",
  "method": "phone"
}
```

### Verify OTP
```
POST /api/verify-otp
Content-Type: application/json

{
  "contact": "1234567890",
  "otp": "123456"
}
```

### Resend OTP
```
POST /api/resend-otp
Content-Type: application/json

{
  "contact": "1234567890"
}
```

## 🌐 Production Deployment

### Environment Variables for Production:
```env
NODE_ENV=production
PORT=80
TWILIO_ACCOUNT_SID=your_production_sid
TWILIO_AUTH_TOKEN=your_production_token
TWILIO_PHONE_NUMBER=your_production_number
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

1. **SMS not received**:
   - Check if phone number is valid and can receive SMS
   - Verify Twilio phone number is SMS-enabled
   - Check Twilio console for delivery status

2. **Invalid credentials error**:
   - Double-check Account SID and Auth Token
   - Ensure .env file is properly configured

3. **Rate limiting errors**:
   - Wait 15 minutes before trying again
   - Check if you're exceeding the rate limits

4. **Phone number format issues**:
   - Use international format (+1234567890)
   - Ensure country code is included

### Debug Mode:
Set `NODE_ENV=development` to see detailed error messages and logs.

## 📞 Support

For Twilio-related issues:
- [Twilio Documentation](https://www.twilio.com/docs)
- [Twilio Support](https://support.twilio.com/)

For application issues:
- Check server logs for detailed error information
- Ensure all environment variables are properly set
- Verify phone number format and Twilio configuration

## 🔄 Updates and Maintenance

- **OTP Cleanup**: Expired OTPs are automatically cleaned every 5 minutes
- **Rate Limit Reset**: Rate limits reset every 15 minutes
- **Session Management**: User sessions persist until manual logout
- **Security Updates**: Regularly update dependencies for security patches