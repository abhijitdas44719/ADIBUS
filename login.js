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

    // Phone number validation
    const phoneInput = document.getElementById('phone-number');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
      });
    }
  }

  checkExistingSession() {
    try {
      const userData = localStorage.getItem('adibus_user');
      if (userData) {
        // User is already logged in, redirect to home
        window.location.href = 'index.html';
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

  async sendOTP() {
    const btn = document.getElementById('send-otp-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    
    try {
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      btn.disabled = true;

      let contact = '';
      if (this.authMethod === 'phone') {
        const countryCode = document.getElementById('country-code')?.value || '+1';
        const phoneNumber = document.getElementById('phone-number')?.value || '';
        
        if (!phoneNumber || phoneNumber.length < 10) {
          throw new Error('Please enter a valid phone number (minimum 10 digits)');
        }
        
        contact = countryCode + phoneNumber;
      } else {
        const email = document.getElementById('email-address')?.value || '';
        
        if (!email || !this.isValidEmail(email)) {
          throw new Error('Please enter a valid email address');
        }
        
        contact = email;
      }

      this.userContact = contact;
      
      // Simulate API call (replace with actual fetch)
      console.log(`Sending OTP to ${contact} via ${this.authMethod}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const mockResponse = {
        ok: true,
        maskedContact: this.maskContact(contact)
      };

      if (!mockResponse.ok) {
        throw new Error('Failed to send OTP');
      }

      this.showSuccess('auth-success', `OTP sent successfully to ${mockResponse.maskedContact}`);
      
      setTimeout(() => {
        const contactDisplay = document.getElementById('contact-display');
        if (contactDisplay) {
          contactDisplay.textContent = mockResponse.maskedContact;
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

      // Simulate API call (replace with actual fetch)
      console.log(`Verifying OTP for ${this.userContact}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const mockResponse = {
        ok: true
      };

      if (!mockResponse.ok) {
        throw new Error('Invalid OTP');
      }

      // Check if user exists
      const existingUser = this.getUserByContact(this.userContact);
      
      if (existingUser) {
        // User exists, log them in
        this.loginUser(existingUser);
        this.showSuccess('otp-success', 'Login successful! Redirecting...');
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        // New user, go to profile completion
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
      // Simulate API call (replace with actual fetch)
      console.log(`Resending OTP to ${this.userContact}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const mockResponse = {
        ok: true
      };

      if (!mockResponse.ok) {
        throw new Error('Failed to resend OTP');
      }
      
      this.showSuccess('otp-success', 'OTP resent successfully!');
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

      // Create user object
      const userData = {
        id: this.generateUserId(),
        name: userName,
        contact: this.userContact,
        authMethod: this.authMethod,
        loginTime: new Date().toISOString(),
        isLoggedIn: true,
        verified: true
      };

      // Save user data
      this.saveUser(userData);
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

  maskContact(contact) {
    if (contact.includes('@')) {
      // Email
      const [username, domain] = contact.split('@');
      const maskedUsername = username.charAt(0) + '*'.repeat(Math.max(0, username.length - 2)) + (username.length > 1 ? username.charAt(username.length - 1) : '');
      return maskedUsername + '@' + domain;
    } else {
      // Phone
      return contact.length > 6 
        ? contact.slice(0, 3) + '****' + contact.slice(-3)
        : '******';
    }
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
