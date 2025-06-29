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

  // Auto-set today's date as minimum for date inputs
  const checkinDate = document.getElementById('checkin-date');
  const checkoutDate = document.getElementById('checkout-date');
  
  if (checkinDate && checkoutDate) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    checkinDate.setAttribute('min', today);
    checkinDate.value = today;
    checkoutDate.setAttribute('min', tomorrowStr);
    checkoutDate.value = tomorrowStr;
    
    // Update checkout minimum when checkin changes
    checkinDate.addEventListener('change', function() {
      const selectedDate = new Date(this.value);
      selectedDate.setDate(selectedDate.getDate() + 1);
      const minCheckout = selectedDate.toISOString().split('T')[0];
      checkoutDate.setAttribute('min', minCheckout);
      
      if (checkoutDate.value <= this.value) {
        checkoutDate.value = minCheckout;
      }
    });
  }

  // Price Range Slider
  const priceSlider = document.querySelector('.price-slider');
  const priceDisplay = document.querySelector('.price-display');
  
  if (priceSlider && priceDisplay) {
    priceSlider.addEventListener('input', function() {
      const value = this.value;
      priceDisplay.textContent = `₹500 - ₹${value}`;
      filterHotels();
    });
  }

  // Filter Buttons
  const starFilters = document.querySelectorAll('.star-filter');
  const amenityFilters = document.querySelectorAll('.amenity-filter');
  const typeFilters = document.querySelectorAll('.type-filter');
  const clearFiltersBtn = document.querySelector('.clear-filters');

  // Star Rating Filters
  starFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      this.classList.toggle('active');
      filterHotels();
    });
  });

  // Amenity Filters
  amenityFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      this.classList.toggle('active');
      filterHotels();
    });
  });

  // Property Type Filters
  typeFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      this.classList.toggle('active');
      filterHotels();
    });
  });

  // Clear All Filters
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      // Reset all filter buttons
      document.querySelectorAll('.star-filter, .amenity-filter, .type-filter').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Reset price slider
      if (priceSlider) {
        priceSlider.value = 10000;
        priceDisplay.textContent = '₹500 - ₹10,000';
      }
      
      // Show all hotels
      document.querySelectorAll('.hotel-card').forEach(card => {
        card.style.display = 'block';
      });
    });
  }

  // Filter Hotels Function
  function filterHotels() {
    const hotelCards = document.querySelectorAll('.hotel-card');
    const activeStarFilters = document.querySelectorAll('.star-filter.active');
    const activeAmenityFilters = document.querySelectorAll('.amenity-filter.active');
    const activeTypeFilters = document.querySelectorAll('.type-filter.active');
    const maxPrice = priceSlider ? parseInt(priceSlider.value) : 10000;

    hotelCards.forEach(card => {
      let showCard = true;
      
      // Price filter
      const cardPrice = parseInt(card.dataset.price);
      if (cardPrice > maxPrice) {
        showCard = false;
      }
      
      // Star rating filter
      if (activeStarFilters.length > 0) {
        const cardRating = parseInt(card.dataset.rating);
        const selectedRatings = Array.from(activeStarFilters).map(btn => parseInt(btn.dataset.rating));
        if (!selectedRatings.includes(cardRating)) {
          showCard = false;
        }
      }
      
      // Property type filter
      if (activeTypeFilters.length > 0) {
        const cardType = card.dataset.type;
        const selectedTypes = Array.from(activeTypeFilters).map(btn => btn.dataset.type);
        if (!selectedTypes.includes(cardType)) {
          showCard = false;
        }
      }
      
      // Show/hide card with animation
      if (showCard) {
        card.style.display = 'block';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 10);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
  }

  // Wishlist Functionality
  const wishlistBtns = document.querySelectorAll('.wishlist-btn');
  
  wishlistBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
      
      const icon = this.querySelector('i');
      if (this.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        
        // Show feedback
        showToast('Added to wishlist!');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        
        showToast('Removed from wishlist!');
      }
    });
  });

  // Book Now Functionality
  const bookBtns = document.querySelectorAll('.book-btn');
  
  bookBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const hotelCard = this.closest('.hotel-card');
      const hotelName = hotelCard.querySelector('h3').textContent;
      
      // Show loading state
      const originalText = this.textContent;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
      this.disabled = true;
      
      // Simulate booking process
      setTimeout(() => {
        this.innerHTML = originalText;
        this.disabled = false;
        showToast(`Booking initiated for ${hotelName}!`);
      }, 2000);
    });
  });

  // Search Form Validation
  const searchForm = document.querySelector('.search-form');
  
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const destination = this.querySelector('input[placeholder="Where are you going?"]');
      const checkin = this.querySelector('#checkin-date');
      const checkout = this.querySelector('#checkout-date');
      
      let isValid = true;
      
      // Reset previous error styles
      [destination, checkin, checkout].forEach(input => {
        if (input) input.style.borderColor = '#e0e0e0';
      });
      
      // Validate inputs
      if (!destination.value.trim()) {
        destination.style.borderColor = '#f44336';
        isValid = false;
      }
      
      if (!checkin.value) {
        checkin.style.borderColor = '#f44336';
        isValid = false;
      }
      
      if (!checkout.value) {
        checkout.style.borderColor = '#f44336';
        isValid = false;
      }
      
      if (isValid) {
        // Show loading state
        const submitBtn = this.querySelector('.search-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        submitBtn.disabled = true;
        
        // Simulate search
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          showToast('Search completed! Showing available hotels.');
        }, 2000);
      } else {
        showToast('Please fill in all required fields', 'error');
      }
    });
  }

  // Load More Hotels
  const loadMoreBtn = document.querySelector('.load-more-btn');
  
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      this.disabled = true;
      
      // Simulate loading more hotels
      setTimeout(() => {
        this.innerHTML = originalText;
        this.disabled = false;
        showToast('More hotels loaded!');
      }, 1500);
    });
  }

  // Navbar Background on Scroll
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      navbar.style.background = 'rgba(255, 255, 255, 0.98)';
      navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  });

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
  const animatedElements = document.querySelectorAll('.hotel-card, .feature-card');
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
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
        element.textContent = Math.floor(current);
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
        if (text.includes('50K+')) targetNumber = 50000;
        else if (text.includes('2M+')) targetNumber = 2000000;
        else if (text.includes('500+')) targetNumber = 500;
        else if (text.includes('4.8')) {
          statNumber.textContent = '4.8';
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

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(e) {
    if (navMenu && hamburger && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });

  // Toast Notification Function
  function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: type === 'error' ? '#f44336' : '#4caf50',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      zIndex: '10000',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // Initialize filters on page load
  filterHotels();
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