/**
 * ADIBUS API Configuration
 * Configures the backend PHP API connection for GitHub Pages / static website.
 */
const getBaseApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost/ADIBUS%20LOGIN%20API';
  
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `http://${host}${port}/ADIBUS%20LOGIN%20API`;
  }
  
  return 'http://localhost/ADIBUS%20LOGIN%20API';
};

const API_CONFIG = {
  BASE_URL: getBaseApiUrl(),

  endpoints: {
    sendOtp: '/send-otp.php',
    verifyOtp: '/verify-otp.php',
    resendOtp: '/resend-otp.php',
    completeProfile: '/complete-profile.php',
    login: '/login.php',
    register: '/register.php',
    verifyEmail: '/verify-email.php',
    resendEmailVerification: '/resend-email-verification.php',
    userProfile: '/user-profile.php',
    buses: '/buses.php',
    bookTicket: '/book-ticket.php',
    getTicket: '/get-ticket.php',
    cancelTicket: '/cancel-ticket.php',
    hotels: '/hotels-api.php',
    operatorRegister: '/operator-register.php',
    contact: '/contact-api.php'
  },

  getUrl(endpointKey) {
    const endpoint = this.endpoints[endpointKey] || '';
    return `${this.BASE_URL}${endpoint}`;
  }
};

if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
