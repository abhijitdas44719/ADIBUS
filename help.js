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

  // Help Search Functionality
  const helpSearchInput = document.getElementById('help-search-input');
  const helpSearchBtn = document.getElementById('help-search-btn');
  const searchTags = document.querySelectorAll('.search-tag');
  
  // Sample help articles for search
  const helpArticles = [
    {
      title: "How to book a bus ticket",
      content: "Step-by-step guide to booking bus tickets on ADIBUS platform",
      category: "booking",
      keywords: ["book", "ticket", "reservation", "bus"]
    },
    {
      title: "Cancel ticket and get refund",
      content: "Learn how to cancel your bus ticket and get refund",
      category: "cancellation",
      keywords: ["cancel", "refund", "cancellation", "money back"]
    },
    {
      title: "Change travel date",
      content: "How to modify your travel date after booking",
      category: "booking",
      keywords: ["change", "date", "modify", "reschedule"]
    },
    {
      title: "Payment methods accepted",
      content: "All supported payment options for booking tickets",
      category: "payment",
      keywords: ["payment", "credit card", "debit card", "upi", "netbanking"]
    },
    {
      title: "Refund policy and timeline",
      content: "Understanding refund policies and processing time",
      category: "payment",
      keywords: ["refund", "policy", "timeline", "processing"]
    },
    {
      title: "Login and account issues",
      content: "Troubleshoot login problems and account access",
      category: "account",
      keywords: ["login", "account", "password", "access"]
    }
  ];

  // Search functionality
  function performSearch(query) {
    if (!query.trim()) return;
    
    const results = helpArticles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase()) ||
      article.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
    );
    
    showSearchResults(results, query);
  }

  function showSearchResults(results, query) {
    // Create or update search results display
    let resultsContainer = document.querySelector('.search-results-container');
    if (!resultsContainer) {
      resultsContainer = document.createElement('div');
      resultsContainer.className = 'search-results-container';
      resultsContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        max-width: 600px;
        width: 90%;
        max-height: 70vh;
        overflow-y: auto;
        z-index: 10001;
        padding: 30px;
      `;
      document.body.appendChild(resultsContainer);
      
      // Add overlay
      const overlay = document.createElement('div');
      overlay.className = 'search-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
      `;
      document.body.appendChild(overlay);
      
      overlay.addEventListener('click', closeSearchResults);
    }
    
    resultsContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3>Search Results for "${query}"</h3>
        <button onclick="closeSearchResults()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
      </div>
      ${results.length > 0 ? 
        results.map(result => `
          <div style="padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 15px; cursor: pointer;" onclick="openArticle('${result.title}')">
            <h4 style="margin: 0 0 10px 0; color: #d32f2f;">${result.title}</h4>
            <p style="margin: 0; color: #666; font-size: 0.9rem;">${result.content}</p>
          </div>
        `).join('') :
        '<p style="text-align: center; color: #666; padding: 40px;">No results found. Try different keywords or browse our help categories.</p>'
      }
    `;
  }

  window.closeSearchResults = function() {
    const resultsContainer = document.querySelector('.search-results-container');
    const overlay = document.querySelector('.search-overlay');
    if (resultsContainer) resultsContainer.remove();
    if (overlay) overlay.remove();
  };

  window.openArticle = function(title) {
    showToast(`Opening article: ${title}`);
    closeSearchResults();
  };

  // Search event listeners
  if (helpSearchBtn) {
    helpSearchBtn.addEventListener('click', function() {
      performSearch(helpSearchInput.value);
    });
  }

  if (helpSearchInput) {
    helpSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch(this.value);
      }
    });
  }

  // Search tags
  searchTags.forEach(tag => {
    tag.addEventListener('click', function() {
      const query = this.dataset.query;
      helpSearchInput.value = query;
      performSearch(query);
    });
  });

  // Help Categories
  const helpCategories = document.querySelectorAll('.help-category');
  
  helpCategories.forEach(category => {
    category.addEventListener('click', function() {
      const categoryType = this.dataset.category;
      showCategoryArticles(categoryType);
    });
  });

  function showCategoryArticles(category) {
    const categoryArticles = helpArticles.filter(article => article.category === category);
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    
    showSearchResults(categoryArticles, `${categoryName} Articles`);
  }

  // FAQ Functionality
  const faqItems = document.querySelectorAll('.faq-item');
  const faqFilters = document.querySelectorAll('.faq-filter');
  
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

  // FAQ Filters
  faqFilters.forEach(filter => {
    filter.addEventListener('click', function() {
      const filterType = this.dataset.filter;
      
      // Update active filter
      faqFilters.forEach(f => f.classList.remove('active'));
      this.classList.add('active');
      
      // Filter FAQ items
      faqItems.forEach(item => {
        const itemCategory = item.dataset.category;
        
        if (filterType === 'all' || itemCategory === filterType) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
          item.classList.remove('active');
        }
      });
    });
  });

  // Contact Methods
  const contactBtns = document.querySelectorAll('.contact-btn');
  
  contactBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const method = this.textContent.trim();
      
      switch(method) {
        case 'Call Now':
          window.open('tel:+919876543210');
          break;
        case 'Start Chat':
          openChatWidget();
          break;
        case 'Send Email':
          window.open('mailto:support@adibus.com?subject=Support Request');
          break;
        case 'WhatsApp':
          window.open('https://wa.me/919876543210?text=Hello, I need help with ADIBUS');
          break;
      }
    });
  });

  // Chat Widget Functionality
  const chatWidget = document.getElementById('chat-widget');
  const chatClose = document.getElementById('chat-close');
  const chatSend = document.getElementById('chat-send');
  const chatInputField = document.getElementById('chat-input-field');
  const chatMessages = document.getElementById('chat-messages');

  function openChatWidget() {
    chatWidget.classList.add('active');
  }

  function closeChatWidget() {
    chatWidget.classList.remove('active');
  }

  if (chatClose) {
    chatClose.addEventListener('click', closeChatWidget);
  }

  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
      </div>
      <div class="message-content">
        <p>${content}</p>
        <span class="message-time">${time}</span>
      </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function sendChatMessage() {
    const message = chatInputField.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    chatInputField.value = '';
    
    // Simulate bot response
    setTimeout(() => {
      const responses = [
        "Thank you for your message. I'm here to help you with any questions about ADIBUS.",
        "I understand your concern. Let me help you find the right solution.",
        "That's a great question! Let me provide you with the information you need.",
        "I'm happy to assist you with that. Here's what you need to know...",
        "Thanks for reaching out. I'll help you resolve this issue quickly."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse);
    }, 1000);
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendChatMessage);
  }

  if (chatInputField) {
    chatInputField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  // Star Rating Functionality
  const starRating = document.querySelector('.star-rating');
  const stars = starRating.querySelectorAll('i');
  
  stars.forEach((star, index) => {
    star.addEventListener('click', function() {
      const rating = index + 1;
      
      // Update star display
      stars.forEach((s, i) => {
        if (i < rating) {
          s.classList.remove('far');
          s.classList.add('fas', 'active');
        } else {
          s.classList.remove('fas', 'active');
          s.classList.add('far');
        }
      });
      
      showToast(`Thank you for rating us ${rating} star${rating > 1 ? 's' : ''}!`);
    });
    
    star.addEventListener('mouseenter', function() {
      const rating = index + 1;
      
      stars.forEach((s, i) => {
        if (i < rating) {
          s.style.color = '#ffd700';
        } else {
          s.style.color = 'rgba(255, 255, 255, 0.3)';
        }
      });
    });
  });

  starRating.addEventListener('mouseleave', function() {
    stars.forEach(star => {
      if (star.classList.contains('active')) {
        star.style.color = '#ffd700';
      } else {
        star.style.color = 'rgba(255, 255, 255, 0.3)';
      }
    });
  });

  // Feedback Form
  const submitFeedback = document.querySelector('.submit-feedback');
  const feedbackText = document.getElementById('feedback-text');
  
  if (submitFeedback) {
    submitFeedback.addEventListener('click', function() {
      const feedback = feedbackText.value.trim();
      
      if (!feedback) {
        showToast('Please enter your feedback before submitting.', 'error');
        return;
      }
      
      // Show loading state
      const originalText = this.textContent;
      this.textContent = 'Submitting...';
      this.disabled = true;
      
      // Simulate submission
      setTimeout(() => {
        this.textContent = originalText;
        this.disabled = false;
        feedbackText.value = '';
        showToast('Thank you for your feedback! We appreciate your input.');
      }, 2000);
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
  const animatedElements = document.querySelectorAll('.help-category, .contact-method, .resource-card');
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
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

  // Make showToast globally available
  window.showToast = showToast;

  // Auto-suggestions for search
  const searchSuggestions = [
    "How to book a ticket",
    "Cancel my booking",
    "Change travel date",
    "Refund policy",
    "Payment methods",
    "Login issues",
    "Forgot password",
    "Contact support",
    "Bus schedules",
    "Boarding points"
  ];

  if (helpSearchInput) {
    helpSearchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      
      if (query.length > 2) {
        const suggestions = searchSuggestions.filter(suggestion => 
          suggestion.toLowerCase().includes(query)
        );
        
        showSearchSuggestions(suggestions);
      } else {
        hideSearchSuggestions();
      }
    });
  }

  function showSearchSuggestions(suggestions) {
    let suggestionsContainer = document.querySelector('.search-suggestions');
    
    if (!suggestionsContainer) {
      suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'search-suggestions';
      suggestionsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 0 0 12px 12px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      `;
      
      const searchWrapper = document.querySelector('.search-wrapper');
      searchWrapper.style.position = 'relative';
      searchWrapper.appendChild(suggestionsContainer);
    }
    
    suggestionsContainer.innerHTML = suggestions.map(suggestion => `
      <div class="suggestion-item" style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: background 0.3s ease;" 
           onmouseover="this.style.background='#f8f9fa'" 
           onmouseout="this.style.background='white'"
           onclick="selectSuggestion('${suggestion}')">
        ${suggestion}
      </div>
    `).join('');
    
    suggestionsContainer.style.display = 'block';
  }

  function hideSearchSuggestions() {
    const suggestionsContainer = document.querySelector('.search-suggestions');
    if (suggestionsContainer) {
      suggestionsContainer.style.display = 'none';
    }
  }

  window.selectSuggestion = function(suggestion) {
    helpSearchInput.value = suggestion;
    hideSearchSuggestions();
    performSearch(suggestion);
  };

  // Hide suggestions when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-wrapper')) {
      hideSearchSuggestions();
    }
  });
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