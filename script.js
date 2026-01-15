// Page Navigation
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link, .logo, .footer-logo, [data-page]');
    const pages = document.querySelectorAll('.page');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    // Function to switch pages
    function switchPage(pageId) {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        document.getElementById(pageId).classList.add('active');
        
        // Update active nav link
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Update nav link for current page
        document.querySelectorAll(`[data-page="${pageId}"]`).forEach(link => {
            if(link.classList.contains('nav-link')) {
                link.classList.add('active');
            }
        });
        
        // Close mobile menu if open
        mainNav.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
    
    // Add click event to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                switchPage(pageId);
            }
        });
    });
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        if (mainNav.classList.contains('active')) {
            this.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            this.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Booking form submission
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                service: document.getElementById('serviceType').value,
                sessionType: document.querySelector('input[name="sessionType"]:checked').value,
                date: document.getElementById('preferredDate').value,
                message: document.getElementById('message').value
            };
            
            // In a real application, you would send this data to a server
            // For this demo, we'll just show a confirmation message
            alert(`Thank you, ${formData.name}! Your appointment request has been submitted to Conciliokenya. Our team will contact you at ${formData.phone} within 24 hours to confirm your appointment.`);
            
            // Reset form
            appointmentForm.reset();
            
            // Switch to home page
            switchPage('home');
        });
    }
    
    // Set minimum date for booking to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        dateInput.min = today;
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('nav') && !e.target.closest('.mobile-menu-btn')) {
            mainNav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.padding = '12px 0';
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.padding = '18px 0';
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.05)';
        }
    });
    
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    const yearElement = document.querySelector('.copyright p');
    if (yearElement) {
        yearElement.innerHTML = yearElement.innerHTML.replace('2023', currentYear);
    }
});