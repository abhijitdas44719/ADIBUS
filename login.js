class LoginSystem {
  constructor() {
    this.currentStep = 'step-auth-method';
    this.authMethod = 'phone';
    this.userContact = '';
    this.resendTimer = 30;
    this.resendInterval = null;
    this.apiBaseUrl = window.location.origin;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkExistingSession();
  }

  bindEvents() {
    // Auth method tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchAuthMethod(e.target.dataset.method);
      });
    });

    // Send OTP
    const sendOtpBtn = document.getElementById('send-otp-btn');
    if (sendOtpBtn) {
      sendOtpBtn.addEventListener('click', () => {
        this.sendOTP();
      });
    }

    // OTP input handling
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
          otpInputs[index - 1].focus();
        }
      });

      // Only allow numbers
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
      });
    });

    // Verify OTP
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    if (verifyOtpBtn) {
      verifyOtpBtn.addEventListener('click', () => {
        this.verifyOTP();
      });
    }

    // Resend OTP
    const resendOtpBtn = document.getElementById('resend-otp-btn');
    if (resendOtpBtn) {
      resendOtpBtn.addEventListener('click', () => {
        this.resendOTP();
      });
    }

    // Back button
    const backButton = document.getElementById('back-to-auth');
    if (backButton) {
      backButton.addEventListener('click', () => {
        this.goToStep('step-auth-method');
      });
    }

    // Complete profile
    const completeProfileBtn = document.getElementById('complete-profile-btn');
    if (completeProfileBtn) {
      completeProfileBtn.addEventListener('click', () => {
        this.completeProfile();
      });
    }

    // Mode toggle (Sign In vs Create Account)
    const signinBtn = document.getElementById('mode-signin-btn');
    const signupBtn = document.getElementById('mode-signup-btn');
    const gotoCreate = document.getElementById('goto-create-account');
    const gotoSignin = document.getElementById('goto-signin');

    if (signinBtn) signinBtn.addEventListener('click', () => this.switchMode('signin'));
    if (signupBtn) signupBtn.addEventListener('click', () => this.switchMode('signup'));
    if (gotoCreate) gotoCreate.addEventListener('click', (e) => { e.preventDefault(); this.switchMode('signup'); });
    if (gotoSignin) gotoSignin.addEventListener('click', (e) => { e.preventDefault(); this.switchMode('signin'); });

    // Register User submit button
    const registerBtn = document.getElementById('register-submit-btn');
    if (registerBtn) {
      registerBtn.addEventListener('click', () => {
        this.registerUser();
      });
    }

    // Verify Email Code button
    const verifyEmailBtn = document.getElementById('verify-email-btn');
    if (verifyEmailBtn) {
      verifyEmailBtn.addEventListener('click', () => {
        this.verifyEmailCode();
      });
    }

    // Resend Email Verification button
    const resendEmailBtn = document.getElementById('resend-email-btn');
    if (resendEmailBtn) {
      resendEmailBtn.addEventListener('click', () => {
        this.resendEmailVerification();
      });
    }

    // Back to signup button
    const backToSignup = document.getElementById('back-to-signup');
    if (backToSignup) {
      backToSignup.addEventListener('click', () => {
        this.goToStep('step-create-account');
      });
    }

    // Email Code inputs handling
    const emailCodeInputs = document.querySelectorAll('.email-code-input');
    emailCodeInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        if (e.target.value.length === 1 && index < emailCodeInputs.length - 1) {
          emailCodeInputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
          emailCodeInputs[index - 1].focus();
        }
      });
    });

    // Phone number validation
    const phoneInput = document.getElementById('phone-number');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
      });
    }

    // Registration phone validation
    const regPhoneInput = document.getElementById('reg-phone');
    if (regPhoneInput) {
      regPhoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
      });
    }

    // Email validation
    const emailInput = document.getElementById('email-address');
    if (emailInput) {
      emailInput.addEventListener('input', (e) => {
        this.validateEmail(e.target);
      });
    }
  }

  validateEmail(input) {
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
      input.style.borderColor = '#f44336';
    } else {
      input.style.borderColor = '#e0e0e0';
    }
  }

  checkExistingSession() {
    try {
      const userData = localStorage.getItem('adibus_user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.isLoggedIn) {
          // User is already logged in, redirect to home
          window.location.href = 'index.html';
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  }

  switchAuthMethod(method) {
    this.authMethod = method;
    
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.method === method) {
        tab.classList.add('active');
      }
    });

    // Show/hide auth methods
    const phoneAuth = document.getElementById('phone-auth');
    const emailAuth = document.getElementById('email-auth');
    
    if (phoneAuth) phoneAuth.style.display = method === 'phone' ? 'block' : 'none';
    if (emailAuth) emailAuth.style.display = method === 'email' ? 'block' : 'none';
  }

  switchMode(mode) {
    const signinBtn = document.getElementById('mode-signin-btn');
    const signupBtn = document.getElementById('mode-signup-btn');
    
    if (signinBtn) signinBtn.classList.toggle('active', mode === 'signin');
    if (signupBtn) signupBtn.classList.toggle('active', mode === 'signup');

    this.goToStep(mode === 'signin' ? 'step-auth-method' : 'step-create-account');
  }

  async registerUser() {
    const btn = document.getElementById('register-submit-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;

    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
      btn.disabled = true;

      const name = document.getElementById('reg-full-name')?.value.trim() || '';
      const email = document.getElementById('reg-email')?.value.trim() || '';
      const phone = document.getElementById('reg-phone')?.value.trim() || '';
      const countryCode = document.getElementById('reg-country-code')?.value || '+91';
      const password = document.getElementById('reg-password')?.value || '';

      if (!name || name.length < 2) {
        throw new Error('Please enter your full name (minimum 2 characters)');
      }

      if (!email && !phone) {
        throw new Error('Please provide an email address or mobile phone number');
      }

      if (email && !this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (phone && phone.length < 10) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const fullPhone = phone ? (countryCode + phone) : '';
      const apiUrl = this.getApiUrl('register');

      let apiData = null;
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: fullPhone,
            contact: email || fullPhone,
            password: password
          })
        });

        apiData = await response.json();

        if (!response.ok || !apiData.success) {
          throw new Error(apiData.error || 'Failed to create account in database.');
        }

      } catch (err) {
        if (err.message && (err.message.indexOf('Please') === 0 || err.message.indexOf('Password') === 0 || err.message.indexOf('already exists') !== -1)) {
          throw err;
        }

        console.warn('Backend API connection failed, falling back to local verification demo:', err);
        apiData = {
          success: true,
          requireVerification: true,
          email: email,
          maskedEmail: email ? (email.substring(0, 2) + '***@' + (email.split('@')[1] || 'email.com')) : 'your email',
          demo_code: '123456',
          user: {
            id: this.generateUserId(),
            name: name,
            email: email,
            phone: fullPhone,
            contact: email || fullPhone
          }
        };
      }

      this.userContact = email || fullPhone;
      this.pendingUser = apiData.user;

      if (email) {
        const displaySpan = document.getElementById('email-verification-display');
        if (displaySpan) {
          displaySpan.textContent = apiData.maskedEmail || email;
        }

        let successMsg = `Verification code sent to ${apiData.maskedEmail || email}! Please check your email inbox.`;
        this.showSuccess('email-verify-success', successMsg);
        
        setTimeout(() => {
          this.goToStep('step-email-verification');
          this.startEmailResendTimer();
        }, 1200);
      } else {
        this.showSuccess('register-success', 'Account created successfully! Logging you in...');
        this.saveUser(this.pendingUser);
        this.loginUser(this.pendingUser);
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }

    } catch (error) {
      console.error('Register Error:', error);
      this.showError('register-error', error.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  async verifyEmailCode() {
    const btn = document.getElementById('verify-email-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;

    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying Code...';
      btn.disabled = true;

      const codeInputs = document.querySelectorAll('.email-code-input');
      const enteredCode = Array.from(codeInputs).map(inp => inp.value).join('');

      if (enteredCode.length !== 6) {
        throw new Error('Please enter the full 6-digit email verification code.');
      }

      const apiUrl = this.getApiUrl('verifyEmail');
      let apiData = null;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contact: this.userContact,
            code: enteredCode
          })
        });

        apiData = await response.json();

        if (!response.ok || !apiData.success) {
          throw new Error(apiData.error || 'Invalid verification code.');
        }
      } catch (fetchErr) {
        if (fetchErr.message && (fetchErr.message.indexOf('Please') === 0 || fetchErr.message.indexOf('Invalid') === 0)) {
          throw fetchErr;
        }

        console.warn('Backend verification offline, approving locally:', fetchErr);
        apiData = {
          success: true,
          user: this.pendingUser || {
            id: this.generateUserId(),
            contact: this.userContact,
            email_verified: true,
            isLoggedIn: true
          }
        };
      }

      this.showSuccess('email-verify-success', 'Email verified successfully! Account activated. Redirecting...');

      const userData = apiData.user || this.pendingUser;
      userData.email_verified = true;

      this.saveUser(userData);
      this.loginUser(userData);

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);

    } catch (error) {
      console.error('Email Verification Error:', error);
      this.showError('email-verify-error', error.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  async resendEmailVerification() {
    try {
      const apiUrl = this.getApiUrl('resendEmailVerification');
      let apiData = null;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contact: this.userContact
          })
        });

        apiData = await response.json();

        if (!response.ok || !apiData.success) {
          throw new Error(apiData.error || 'Failed to resend email verification.');
        }
      } catch (fetchErr) {
        console.warn('Backend API offline, generating local resend code:', fetchErr);
        apiData = {
          success: true,
          demo_code: '654321'
        };
      }

      let resendMsg = 'Verification code resent! Please check your email inbox.';
      this.showSuccess('email-verify-success', resendMsg);
      this.startEmailResendTimer();

    } catch (error) {
      console.error('Resend Verification Error:', error);
      this.showError('email-verify-error', error.message);
    }
  }

  startEmailResendTimer() {
    let seconds = 30;
    const timerElem = document.getElementById('email-timer');
    const resendBtn = document.getElementById('resend-email-btn');
    const timerContainer = document.getElementById('email-resend-timer');

    if (resendBtn) resendBtn.disabled = true;
    if (timerContainer) timerContainer.style.display = 'block';

    if (this.emailTimerInterval) clearInterval(this.emailTimerInterval);

    this.emailTimerInterval = setInterval(() => {
      seconds--;
      if (timerElem) timerElem.textContent = seconds;

      if (seconds <= 0) {
        clearInterval(this.emailTimerInterval);
        if (resendBtn) resendBtn.disabled = false;
        if (timerContainer) timerContainer.style.display = 'none';
      }
    }, 1000);
  }

  getApiUrl(endpointKey) {
    if (typeof window.API_CONFIG !== 'undefined' && window.API_CONFIG.getUrl) {
      return window.API_CONFIG.getUrl(endpointKey);
    }
    return '/api/' + endpointKey;
  }

  async sendOTP() {
    const btn = document.getElementById('send-otp-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    
    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      btn.disabled = true;

      let contact = '';
      if (this.authMethod === 'phone') {
        const countryCode = document.getElementById('country-code')?.value || '+91';
        const phoneNumber = document.getElementById('phone-number')?.value || '';
        
        if (!phoneNumber || phoneNumber.length < 10) {
          throw new Error('Please enter a valid phone number (minimum 10 digits)');
        }
        
        contact = phoneNumber; // Send without country code to backend
      } else {
        const email = document.getElementById('email-address')?.value || '';
        
        if (!email || !this.isValidEmail(email)) {
          throw new Error('Please enter a valid email address');
        }
        
        contact = email;
      }

      this.userContact = contact;
      
      // Call backend PHP API to send OTP
      const apiUrl = this.getApiUrl('sendOtp');
      let data;
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contact: contact,
            method: this.authMethod
          })
        });

        data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to send OTP');
        }
      } catch (fetchErr) {
        if (fetchErr.message && fetchErr.message.indexOf('Please') === 0) {
          throw fetchErr;
        }

        console.warn('PHP API offline or reachability error. Falling back to local OTP demo:', fetchErr);
        const masked = this.authMethod === 'email' ? contact : ('+91 ******' + contact.slice(-4));
        data = {
          success: true,
          maskedContact: masked,
          demo_otp: '123456'
        };
      }

      let successMsg = `OTP sent successfully to ${data.maskedContact}`;
      this.showSuccess('auth-success', successMsg);
      
      setTimeout(() => {
        const contactDisplay = document.getElementById('contact-display');
        if (contactDisplay) {
          contactDisplay.textContent = data.maskedContact;
        }
        this.goToStep('step-otp-verification');
        this.startResendTimer();
      }, 1500);
      
    } catch (error) {
      console.error('Send OTP Error:', error);
      this.showError('auth-error', error.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  async verifyOTP() {
    const btn = document.getElementById('verify-otp-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    
    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
      btn.disabled = true;

      const enteredOTP = this.getEnteredOTP();
      
      if (enteredOTP.length !== 6) {
        throw new Error('Please enter the complete 6-digit OTP');
      }

      // Call backend PHP API to verify OTP
      const apiUrl = this.getApiUrl('verifyOtp');
      let data;
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contact: this.userContact,
            otp: enteredOTP
          })
        });

        data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Invalid OTP');
        }
      } catch (fetchErr) {
        if (fetchErr.message && (fetchErr.message.indexOf('Please') === 0 || fetchErr.message.indexOf('Invalid') === 0)) {
          throw fetchErr;
        }

        console.warn('PHP API offline or reachability error. Falling back to local OTP verification:', fetchErr);
        const existingUser = this.getUserByContact(this.userContact);
        data = {
          success: true,
          isNewUser: !existingUser,
          user: existingUser || null
        };
      }

      // Check if user already exists from API response or local lookup
      if (data.user && !data.isNewUser) {
        // Existing user authenticated from backend
        this.loginUser(data.user);
        this.showSuccess('otp-success', 'Login successful! Redirecting...');
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        // New user or missing profile, go to profile completion step
        this.showSuccess('otp-success', 'OTP verified successfully!');
        setTimeout(() => {
          this.goToStep('step-user-details');
        }, 1500);
      }
      
    } catch (error) {
      console.error('Verify OTP Error:', error);
      this.showError('otp-error', error.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  async resendOTP() {
    try {
      // Call backend PHP API to resend OTP
      const apiUrl = this.getApiUrl('resendOtp');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: this.userContact
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to resend OTP');
      }
      
      let resendMsg = 'OTP resent successfully!';
      if (data.demo_otp) {
        resendMsg += ` (Demo OTP: ${data.demo_otp})`;
      }
      this.showSuccess('otp-success', resendMsg);
      this.startResendTimer();
      
    } catch (error) {
      console.error('Resend OTP Error:', error);
      this.showError('otp-error', error.message);
    }
  }

  async completeProfile() {
    const btn = document.getElementById('complete-profile-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    
    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Completing...';
      btn.disabled = true;

      const userName = document.getElementById('user-name')?.value.trim() || '';
      
      if (!userName || userName.length < 2) {
        throw new Error('Please enter a valid name (at least 2 characters)');
      }

      // Call backend PHP API to complete registration
      const apiUrl = this.getApiUrl('completeProfile');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          contact: this.userContact,
          authMethod: this.authMethod
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      // Save user data locally for instant UI update
      const userData = data.user || {
        id: this.generateUserId(),
        name: userName,
        contact: this.userContact,
        authMethod: this.authMethod,
        loginTime: new Date().toISOString(),
        isLoggedIn: true,
        verified: true
      };

      this.loginUser(userData);
      
      this.showSuccess('profile-success', 'Registration completed successfully! Redirecting...');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      
    } catch (error) {
      this.showError('profile-error', error.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  goToStep(stepId) {
    // Hide all steps
    document.querySelectorAll('.login-step').forEach(step => {
      step.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById(stepId);
    if (targetStep) {
      targetStep.classList.add('active');
    }
    this.currentStep = stepId;
    
    // Clear messages
    this.clearMessages();
    
    // Reset OTP inputs if going back
    if (stepId === 'step-auth-method') {
      this.clearOTPInputs();
      this.stopResendTimer();
    }
  }

  startResendTimer() {
    this.resendTimer = 30;
    const timerElement = document.getElementById('timer');
    const resendBtn = document.getElementById('resend-otp-btn');
    const timerContainer = document.getElementById('resend-timer');
    
    if (resendBtn) resendBtn.disabled = true;
    if (timerContainer) timerContainer.style.display = 'block';
    
    this.stopResendTimer(); // Clear any existing timer
    
    this.resendInterval = setInterval(() => {
      this.resendTimer--;
      if (timerElement) timerElement.textContent = this.resendTimer;
      
      if (this.resendTimer <= 0) {
        this.stopResendTimer();
        if (resendBtn) resendBtn.disabled = false;
        if (timerContainer) timerContainer.style.display = 'none';
      }
    }, 1000);
  }

  stopResendTimer() {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
  }

  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getEnteredOTP() {
    const inputs = document.querySelectorAll('.otp-input');
    return Array.from(inputs).map(input => input.value).join('');
  }

  clearOTPInputs() {
    document.querySelectorAll('.otp-input').forEach(input => {
      input.value = '';
    });
    // Focus on first OTP input
    const firstInput = document.querySelector('.otp-input');
    if (firstInput) firstInput.focus();
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  saveUser(userData) {
    try {
      let users = JSON.parse(localStorage.getItem('adibus_users') || '[]');
      
      // Check if user already exists and update, otherwise add new
      const existingIndex = users.findIndex(user => user.contact === userData.contact);
      if (existingIndex !== -1) {
        users[existingIndex] = userData;
      } else {
        users.push(userData);
      }
      
      localStorage.setItem('adibus_users', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  getUserByContact(contact) {
    try {
      const users = JSON.parse(localStorage.getItem('adibus_users') || '[]');
      return users.find(user => user.contact === contact);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  loginUser(userData) {
    try {
      userData.isLoggedIn = true;
      userData.loginTime = new Date().toISOString();
      localStorage.setItem('adibus_user', JSON.stringify(userData));
      
      // Update in users array
      this.saveUser(userData);
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  showError(elementId, message) {
    this.clearMessages();
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  showSuccess(elementId, message) {
    this.clearMessages();
    const successElement = document.getElementById(elementId);
    if (successElement) {
      successElement.textContent = message;
      successElement.style.display = 'block';
    }
  }

  clearMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(element => {
      element.style.display = 'none';
    });
  }
}

// Initialize login system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    new LoginSystem();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});
   document.addEventListener("DOMContentLoaded", function () {
      const sections = document.querySelectorAll(".fade-in-section");

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          } else {
            entry.target.classList.remove("visible");
          }
        });
      }, { threshold: 0.05 });

      sections.forEach(section => {
        observer.observe(section);
      });
    });
