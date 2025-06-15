// Authentication utility functions for all pages
class AuthManager {
  static getCurrentUser() {
    const userData = localStorage.getItem('adibus_user');
    return userData ? JSON.parse(userData) : null;
  }

  static isLoggedIn() {
    const user = this.getCurrentUser();
    return user && user.isLoggedIn;
  }

  static logout() {
    // Clear current user session
    localStorage.removeItem('adibus_user');
    
    // Update user in users array
    const users = JSON.parse(localStorage.getItem('adibus_users') || '[]');
    const currentUser = this.getCurrentUser();
    
    if (currentUser) {
      const userIndex = users.findIndex(user => user.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].isLoggedIn = false;
        localStorage.setItem('adibus_users', JSON.stringify(users));
      }
    }
    
    // Reload page to update UI
    window.location.reload();
  }

  static updateNavigation() {
    const user = this.getCurrentUser();
    const loginBtn = document.querySelector('.login-btn');
    const navAuth = document.querySelector('.nav-auth');
    
    if (!loginBtn || !navAuth) return;

    if (this.isLoggedIn() && user) {
      // Replace login button with user menu
      navAuth.innerHTML = `
        <div class="user-menu">
          <button class="user-btn" id="user-menu-btn">
            <i class="fas fa-user-circle"></i>
            <span>${user.name}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="user-dropdown" id="user-dropdown">
            <a href="#" class="dropdown-item">
              <i class="fas fa-user"></i>
              Profile
            </a>
            <a href="#" class="dropdown-item">
              <i class="fas fa-ticket-alt"></i>
              My Bookings
            </a>
            <a href="#" class="dropdown-item">
              <i class="fas fa-heart"></i>
              Wishlist
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" id="logout-btn">
              <i class="fas fa-sign-out-alt"></i>
              Sign Out
            </a>
          </div>
        </div>
      `;

      // Add styles for user menu
      this.addUserMenuStyles();
      
      // Bind events
      this.bindUserMenuEvents();
    } else {
      // Show login button
      navAuth.innerHTML = `
        <button class="login-btn" onclick="window.location.href='login.html'">
          <i class="fas fa-user"></i>
          Login
        </button>
      `;
    }
  }

  static addUserMenuStyles() {
    if (document.getElementById('user-menu-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'user-menu-styles';
    styles.textContent = `
      .user-menu {
        position: relative;
      }

      .user-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #d32f2f, #f44336);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      }

      .user-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(211, 47, 47, 0.3);
      }

      .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        padding: 8px 0;
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 1000;
        margin-top: 10px;
      }

      .user-dropdown.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        text-decoration: none;
        color: #333;
        transition: background 0.3s ease;
        font-size: 14px;
      }

      .dropdown-item:hover {
        background: #f5f5f5;
        color: #d32f2f;
      }

      .dropdown-divider {
        height: 1px;
        background: #e0e0e0;
        margin: 8px 0;
      }

      @media (max-width: 768px) {
        .user-btn span {
          display: none;
        }
        
        .user-btn {
          padding: 12px 16px;
        }
        
        .user-dropdown {
          right: -10px;
          min-width: 180px;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  static bindUserMenuEvents() {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.classList.remove('active');
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to sign out?')) {
          this.logout();
        }
      });
    }
  }

  static init() {
    // Update navigation on page load
    document.addEventListener('DOMContentLoaded', () => {
      this.updateNavigation();
    });
  }
}

// Initialize auth manager
AuthManager.init();