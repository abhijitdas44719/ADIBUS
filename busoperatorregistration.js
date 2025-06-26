class BusOperatorRegistration {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 4;
        this.registrationData = {};
        this.otpData = {};
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress();
    }

    bindEvents() {
        // Mobile navigation
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        // Step 1: Phone verification
        document.getElementById('send-otp-btn').addEventListener('click', () => this.sendOTP());
        document.getElementById('verify-otp-btn').addEventListener('click', () => this.verifyOTP());
        document.getElementById('resend-otp').addEventListener('click', () => this.resendOTP());
        document.getElementById('back-to-phone').addEventListener('click', () => this.showStep('1'));

        // Step 2: Company details
        document.getElementById('back-to-step1').addEventListener('click', () => this.goToStep(1));
        document.getElementById('next-to-step3').addEventListener('click', () => this.validateAndNext(2));

        // Step 3: Fleet information
        document.getElementById('back-to-step2').addEventListener('click', () => this.goToStep(2));
        document.getElementById('complete-registration').addEventListener('click', () => this.completeRegistration());

        // Phone number input validation
        const phoneInput = document.getElementById('phone-number');
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // OTP input handling
        this.setupOTPInputs();

        // Checkbox interactions
        this.setupCheckboxes();

        // Form validation
        this.setupFormValidation();
    }

    setupOTPInputs() {
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

            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        });
    }

    setupCheckboxes() {
        const checkboxGroups = document.querySelectorAll('.checkbox-group');
        
        checkboxGroups.forEach(group => {
            const items = group.querySelectorAll('.checkbox-item');
            
            items.forEach(item => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                
                item.addEventListener('click', (e) => {
                    if (e.target.type !== 'checkbox') {
                        checkbox.checked = !checkbox.checked;
                    }
                    
                    if (checkbox.checked) {
                        item.classList.add('selected');
                    } else {
                        item.classList.remove('selected');
                    }
                });
            });
        });
    }

    setupFormValidation() {
        const inputs = document.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldId = field.id;
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') || field.closest('.form-group').querySelector('label .required')) {
            if (!value) {
                isValid = false;
                errorMessage = 'This field is required';
            }
        }

        // Specific field validations
        switch (fieldId) {
            case 'phone-number':
                if (value && (value.length < 10 || value.length > 15)) {
                    isValid = false;
                    errorMessage = 'Phone number must be 10-15 digits';
                }
                break;
            
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            
            case 'registration-number':
                if (value && value.length < 5) {
                    isValid = false;
                    errorMessage = 'Registration number must be at least 5 characters';
                }
                break;
        }

        // Update UI
        if (isValid) {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        } else {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            }
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async sendOTP() {
        const countryCode = document.getElementById('country-code').value;
        const phoneNumber = document.getElementById('phone-number').value.trim();
        const btn = document.getElementById('send-otp-btn');

        if (!phoneNumber) {
            this.showError('phone-error', 'Please enter your phone number');
            return;
        }

        if (phoneNumber.length < 10) {
            this.showError('phone-error', 'Phone number must be at least 10 digits');
            return;
        }

        const fullPhoneNumber = countryCode + phoneNumber;
        
        try {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            // Simulate API call to send OTP
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contact: phoneNumber,
                    method: 'phone'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.otpData = {
                    phone: fullPhoneNumber,
                    maskedPhone: this.maskPhoneNumber(fullPhoneNumber)
                };

                document.getElementById('phone-display').textContent = this.otpData.maskedPhone;
                this.showStep('1b');
                this.showToast('OTP sent successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to send OTP');
            }

        } catch (error) {
            console.error('Send OTP Error:', error);
            this.showError('phone-error', error.message || 'Failed to send OTP. Please try again.');
        } finally {
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
            btn.disabled = false;
        }
    }

    async verifyOTP() {
        const otpInputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        const btn = document.getElementById('verify-otp-btn');

        if (otp.length !== 6) {
            this.showToast('Please enter the complete 6-digit OTP', 'error');
            return;
        }

        try {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            btn.disabled = true;

            // Simulate API call to verify OTP
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contact: document.getElementById('phone-number').value,
                    otp: otp
                })
            });

            const data = await response.json();

            if (data.success) {
                this.registrationData.phone = this.otpData.phone;
                this.registrationData.phoneVerified = true;
                
                this.showToast('Phone verified successfully!', 'success');
                setTimeout(() => {
                    this.goToStep(2);
                }, 1500);
            } else {
                throw new Error(data.error || 'Invalid OTP');
            }

        } catch (error) {
            console.error('Verify OTP Error:', error);
            this.showToast(error.message || 'Invalid OTP. Please try again.', 'error');
        } finally {
            btn.innerHTML = '<i class="fas fa-check"></i> Verify OTP';
            btn.disabled = false;
        }
    }

    async resendOTP() {
        const btn = document.getElementById('resend-otp');
        const phoneNumber = document.getElementById('phone-number').value;

        try {
            btn.textContent = 'Sending...';
            btn.disabled = true;

            // Simulate API call to resend OTP
            const response = await fetch('/api/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contact: phoneNumber
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('OTP resent successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to resend OTP');
            }

        } catch (error) {
            console.error('Resend OTP Error:', error);
            this.showToast(error.message || 'Failed to resend OTP', 'error');
        } finally {
            btn.textContent = 'Resend OTP';
            btn.disabled = false;
        }
    }

    validateAndNext(step) {
        let isValid = true;

        if (step === 2) {
            // Validate company details
            const requiredFields = [
                'company-name',
                'registration-number', 
                'contact-person',
                'email',
                'years-business',
                'fleet-size',
                'address'
            ];

            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            if (isValid) {
                // Save company data
                this.registrationData.company = {
                    name: document.getElementById('company-name').value,
                    registrationNumber: document.getElementById('registration-number').value,
                    contactPerson: document.getElementById('contact-person').value,
                    email: document.getElementById('email').value,
                    yearsInBusiness: document.getElementById('years-business').value,
                    fleetSize: document.getElementById('fleet-size').value,
                    address: document.getElementById('address').value
                };

                this.goToStep(3);
            }
        }
    }

    completeRegistration() {
        // Validate fleet information
        const primaryRoutes = document.getElementById('primary-routes').value.trim();
        const priceRange = document.getElementById('price-range').value;
        
        if (!primaryRoutes) {
            this.showError('primary-routes-error', 'Please enter your primary routes');
            return;
        }

        if (!priceRange) {
            this.showError('price-range-error', 'Please select a price range');
            return;
        }

        // Get selected bus types
        const busTypes = [];
        document.querySelectorAll('#bus-types input[type="checkbox"]:checked').forEach(checkbox => {
            busTypes.push(checkbox.value);
        });

        if (busTypes.length === 0) {
            this.showError('bus-types-error', 'Please select at least one bus type');
            return;
        }

        // Get selected amenities
        const amenities = [];
        document.querySelectorAll('#amenities input[type="checkbox"]:checked').forEach(checkbox => {
            amenities.push(checkbox.value);
        });

        // Save fleet data
        this.registrationData.fleet = {
            primaryRoutes: primaryRoutes,
            busTypes: busTypes,
            amenities: amenities,
            priceRange: priceRange,
            safetyCertifications: document.getElementById('safety-cert').value
        };

        // Submit registration
        this.submitRegistration();
    }

    async submitRegistration() {
        const btn = document.getElementById('complete-registration');
        
        try {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            btn.disabled = true;

            // Simulate API call to submit registration
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Save to localStorage for demo purposes
            const registrationId = 'REG_' + Date.now();
            this.registrationData.id = registrationId;
            this.registrationData.status = 'pending';
            this.registrationData.submittedAt = new Date().toISOString();

            localStorage.setItem('bus_operator_registration', JSON.stringify(this.registrationData));

            this.showToast('Registration submitted successfully!', 'success');
            this.goToStep(4);

        } catch (error) {
            console.error('Registration Error:', error);
            this.showToast('Failed to submit registration. Please try again.', 'error');
        } finally {
            btn.innerHTML = '<i class="fas fa-check"></i> Complete Registration';
            btn.disabled = false;
        }
    }

    goToStep(step) {
        this.currentStep = step;
        this.showStep(step.toString());
        this.updateProgress();
    }

    showStep(stepId) {
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.remove('active');
        });

        // Show target step
        const targetStep = document.getElementById(`step-${stepId}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }

        // Clear any error messages
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });

        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
    }

    updateProgress() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                step.querySelector('.step-circle i').className = 'fas fa-check';
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = ((this.currentStep - 1) / (this.maxSteps - 1)) * 100;
        progressFill.style.width = `${progressPercentage}%`;
    }

    maskPhoneNumber(phone) {
        if (phone.length > 6) {
            return phone.slice(0, 3) + '****' + phone.slice(-3);
        }
        return '******';
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize registration system
document.addEventListener('DOMContentLoaded', () => {
    new BusOperatorRegistration();
});