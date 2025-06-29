document.addEventListener('DOMContentLoaded', function() {
  // Mobile Navigation Toggle
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all FAQ items
      faqItems.forEach(faqItem => {
        faqItem.classList.remove('active');
      });
      
      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Copy Promo Code Functionality
  const copyButtons = document.querySelectorAll('.copy-btn');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const promoCode = this.previousElementSibling.textContent;
      
      // Create temporary input to copy text
      const tempInput = document.createElement('input');
      tempInput.value = promoCode;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      // Show feedback
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-check"></i>';
      this.style.background = '#4caf50';
      
      setTimeout(() => {
        this.innerHTML = originalText;
        this.style.background = '#d32f2f';
      }, 2000);
    });
  });

  // Smooth Scrolling for Navigation Links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Navbar Background on Scroll
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(255, 255, 255)';
      navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  });

  // Swap Button Functionality
  const swapBtn = document.querySelector('.swap-btn');
  const fromInput = document.querySelector('.form-row:first-child .form-group:first-child input');
  const toInput = document.querySelector('.form-row:first-child .form-group:last-child input');
  
  if (swapBtn && fromInput && toInput) {
    swapBtn.addEventListener('click', function() {
      const fromValue = fromInput.value;
      const toValue = toInput.value;
      
      fromInput.value = toValue;
      toInput.value = fromValue;
      
      // Add animation class
      this.style.transform = 'rotate(180deg)';
      setTimeout(() => {
        this.style.transform = 'rotate(0deg)';
      }, 300);
    });
  }

  // Form Validation
  const searchForm = document.querySelector('.search-form');
  
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const fromInput = this.querySelector('input[placeholder="Departure city"]');
      const toInput = this.querySelector('input[placeholder="Destination city"]');
      const dateInput = this.querySelector('input[type="date"]');
      
      let isValid = true;
      
      // Reset previous error styles
      [fromInput, toInput, dateInput].forEach(input => {
        input.style.borderColor = '#e0e0e0';
      });
      
      // Validate inputs
      if (!fromInput.value.trim()) {
        fromInput.style.borderColor = '#f44336';
        isValid = false;
      }
      
      if (!toInput.value.trim()) {
        toInput.style.borderColor = '#f44336';
        isValid = false;
      }
      
      if (!dateInput.value) {
        dateInput.style.borderColor = '#f44336';
        isValid = false;
      }
      
      if (isValid) {
        // Show loading state
        const submitBtn = this.querySelector('.search-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        submitBtn.disabled = true;
        
        // Simulate search (replace with actual search logic)
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          alert('Search functionality would be implemented here!');
        }, 2000);
      } else {
        // Show error message
        alert('Please fill in all required fields');
      }
    });
  }

  // Intersection Observer for Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  const animatedElements = document.querySelectorAll('.feature-card, .offer-card, .testimonial-card, .stat-item');
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    observer.observe(el);
  });

  // Counter Animation for Stats
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      // Format number based on target
      if (target >= 1000000) {
        element.textContent = (current / 1000000).toFixed(1) + 'M+';
      } else if (target >= 1000) {
        element.textContent = (current / 1000).toFixed(0) + 'K+';
      } else {
        element.textContent = Math.floor(current) + '+';
      }
    }, 20);
  };
  
  // Start counter animation when stats section is visible
  const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumber = entry.target;
        const text = statNumber.textContent;
        
        // Extract number from text
        let targetNumber;
        if (text.includes('25M+')) targetNumber = 25000000;
        else if (text.includes('3500+')) targetNumber = 3500;
        else if (text.includes('15+')) targetNumber = 15;
        else if (text.includes('24/7')) {
          statNumber.textContent = '24/7';
          return;
        }
        
        if (targetNumber) {
          animateCounter(statNumber, targetNumber);
        }
        
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach(stat => {
    statsObserver.observe(stat);
  });

  // Auto-set today's date as minimum for date input
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });

  // Offers slider navigation (if you want to add slider functionality)
  const offersContainer = document.querySelector('.offers-slider');
  const prevBtn = document.querySelector('.offers-prev');
  const nextBtn = document.querySelector('.offers-next');
  
  if (offersContainer && prevBtn && nextBtn) {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.offer-card');
    const totalSlides = slides.length;
    
    // Hide navigation buttons if not needed
    if (totalSlides <= 4) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  }
});

// Utility function to debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimized scroll handler
const handleScroll = debounce(function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, 10);

window.addEventListener('scroll', handleScroll);
    

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
      }, { threshold: 0.1 });

      sections.forEach(section => {
        observer.observe(section);
      });
    });
 
