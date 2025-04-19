// index.js

// Toggle dropdown for mobile view
document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.querySelector('.dropdown');
  const dropdownLink = dropdown.querySelector('a');

  dropdownLink.addEventListener('click', (e) => {
    // Prevent default link behavior
    if (window.innerWidth <= 768) {
      e.preventDefault();
      dropdown.classList.toggle('active');
    }
  });
});
