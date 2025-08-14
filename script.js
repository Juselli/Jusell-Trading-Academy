// Trading Education Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initFAQ();
    initContactForm();
    initTradingChart();
    initAnimations();
    initBackToTop();
    initLiveAvailability();
    initFeatureToggles();
});

// Add CSS loaded detection to prevent FOUC
function initCSSLoaded() {
    // Check if CSS is loaded
    if (document.readyState === 'complete') {
        document.body.classList.add('css-loaded');
    } else {
        window.addEventListener('load', function() {
            document.body.classList.add('css-loaded');
        });
    }
    
    // Fallback: Add class after a short delay to ensure CSS is loaded
    setTimeout(function() {
        document.body.classList.add('css-loaded');
    }, 100);
}

// Initialize CSS loaded detection
initCSSLoaded();

// Lazy-load Calendly when needed
let calendlyLoaded = false;
function loadCalendlyAssets() {
    return new Promise((resolve) => {
        if (calendlyLoaded) { return resolve(); }
        // inject CSS
        const cssHref = 'https://assets.calendly.com/assets/external/widget.css';
        if (!document.querySelector('link[href="'+cssHref+'"]')) {
            const l = document.createElement('link');
            l.rel = 'stylesheet';
            l.href = cssHref;
            document.head.appendChild(l);
        }
        // inject JS
        const jsSrc = 'https://assets.calendly.com/assets/external/widget.js';
        if (typeof Calendly !== 'undefined') {
            calendlyLoaded = true; return resolve();
        }
        const s = document.createElement('script');
        s.src = jsSrc; s.async = true; s.onload = function(){ calendlyLoaded = true; resolve(); };
        document.head.appendChild(s);
    });
}

// Persist UTM params for attribution and build Calendly URL with them
(function persistUtmParams() {
    try {
        const url = new URL(window.location.href);
        const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
        const found = {};
        utmKeys.forEach(k => { const v = url.searchParams.get(k); if (v) found[k] = v; });
        if (Object.keys(found).length > 0) {
            localStorage.setItem('utmParams', JSON.stringify(found));
        }
    } catch (_) {}
})();

function buildCalendlyUrl(baseUrl) {
    let url = new URL(baseUrl);
    try {
        const saved = JSON.parse(localStorage.getItem('utmParams') || '{}');
        Object.entries(saved).forEach(([k, v]) => url.searchParams.set(k, v));
    } catch (_) {}
    return url.toString();
}

// Navigation functionality
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // ARIA for mobile toggle
    if (navToggle && navMenu) {
        navToggle.setAttribute('role', 'button');
        navToggle.setAttribute('aria-controls', 'nav-menu');
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('aria-hidden', 'true');
    }

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        const expanded = navToggle.classList.contains('active');
        navToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        navMenu.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    });

    // Keyboard toggle support
    navToggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navToggle.click();
        }
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                // Calculate offset based on screen size
                let offset = 70; // Default desktop navbar height
                if (window.innerWidth <= 480) {
                    offset = 65; // Small mobile navbar height + extra padding
                } else if (window.innerWidth <= 768) {
                    offset = 70; // Tablet mobile navbar height + extra padding
                }
                const targetTop = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetTop, behavior: 'smooth' });

                // Update URL hash without jumping
                history.replaceState(null, '', href);

                // Move focus for accessibility after scroll
                setTimeout(() => {
                    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }, 600);
            }
        });
    });

    // Active navigation highlighting
    function highlightCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (navLink) {
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    }
    window.addEventListener('scroll', highlightCurrentSection);
}

// Scroll effects
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// FAQ functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const answerId = `faq-answer-${index + 1}`;
        if (answer) answer.id = answerId;

        // ARIA & keyboard
        question.setAttribute('role', 'button');
        question.setAttribute('tabindex', '0');
        question.setAttribute('aria-controls', answerId);
        question.setAttribute('aria-expanded', 'false');
        if (answer) answer.setAttribute('aria-hidden', 'true');

        function toggleItem() {
            const isActive = item.classList.contains('active');
            // Close all FAQ items
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
                const q = faqItem.querySelector('.faq-question');
                const a = faqItem.querySelector('.faq-answer');
                if (q) q.setAttribute('aria-expanded', 'false');
                if (a) a.setAttribute('aria-hidden', 'true');
            });
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
                if (answer) answer.setAttribute('aria-hidden', 'false');
            }
        }

        question.addEventListener('click', toggleItem);
        question.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleItem();
            }
        });
    });
}

// Contact Form Handler
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('contactSubmit');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            program: document.getElementById('program').value,
            message: document.getElementById('message').value || 'No message provided'
        };
        
        // Update button to show processing
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual endpoint)
        console.log('Form Data Captured:', formData);
        
        // Store lead data (you can integrate with your email service here)
        localStorage.setItem('latestLead', JSON.stringify({
            ...formData,
            timestamp: new Date().toISOString()
        }));
        
        // Show success message
        setTimeout(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Show success notification
            showNotification('Information captured! Opening calendar...', 'success');
            
            // Open Calendly popup after lazy-loading assets
            setTimeout(async () => {
                try {
                    await loadCalendlyAssets();
                    const urlWithUtm = buildCalendlyUrl('https://calendly.com/jusell-work/30min');
                    if (typeof Calendly !== 'undefined') {
                        Calendly.initPopupWidget({ url: urlWithUtm });
                    } else {
                        showNotification('Calendar booking unavailable. Please contact us directly.', 'error');
                    }
                } catch (_) {
                    showNotification('Calendar booking unavailable. Please contact us directly.', 'error');
                }
            }, 800);
            
            // Reset form
            form.reset();
            
        }, 1500); // Simulate processing time
    });
}

// Form validation
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const program = document.getElementById('program').value;
    
    // Clear previous error states
    clearErrorStates();
    
    let isValid = true;
    
    // Validate name
    if (!name || name.length < 2) {
        showFieldError('name', 'Please enter your full name');
        isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate program selection
    if (!program) {
        showFieldError('program', 'Please select your interest');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '#ff4444';
        
        // Create or update error message
        let errorMsg = field.parentNode.querySelector('.field-error');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'field-error';
            field.parentNode.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
        errorMsg.style.color = '#ff4444';
        errorMsg.style.fontSize = '12px';
        errorMsg.style.marginTop = '4px';
    }
}

function clearErrorStates() {
    const fields = ['name', 'email', 'program'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '';
            const errorMsg = field.parentNode.querySelector('.field-error');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// Trading chart visualization
function initTradingChart() {
    // Skip on mobile or reduced motion
    if (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const chartContainer = document.querySelector('.trading-chart');
        if (chartContainer) { chartContainer.style.display = 'none'; }
        return;
    }
    const canvas = document.getElementById('heroChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Generate sample trading data
    const data = generateTradingData();
    
    // Chart styling
    const chartStyle = {
        background: '#1e1e1e',
        grid: '#333',
        bullish: '#00ff88',
        bearish: '#ff4444',
        volume: '#666'
    };

    function drawChart() {
        // Clear canvas
        ctx.fillStyle = chartStyle.background;
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        drawGrid();
        
        // Draw price line
        drawPriceLine(data);
        
        // Draw volume bars
        drawVolume(data);
        
        // Add labels
        drawLabels();
    }

    function drawGrid() {
        ctx.strokeStyle = chartStyle.grid;
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= 6; i++) {
            const y = (height / 6) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    function drawPriceLine(priceData) {
        if (priceData.length < 2) return;

        ctx.strokeStyle = chartStyle.bullish;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const xStep = width / (priceData.length - 1);
        const minPrice = Math.min(...priceData.map(d => d.price));
        const maxPrice = Math.max(...priceData.map(d => d.price));
        const priceRange = maxPrice - minPrice;

        priceData.forEach((point, index) => {
            const x = index * xStep;
            const y = height - ((point.price - minPrice) / priceRange) * (height * 0.7);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Add gradient fill
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(0, 255, 136, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0.05)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    function drawVolume(data) {
        const volumeHeight = height * 0.2;
        const barWidth = width / data.length;
        
        data.forEach((point, index) => {
            const x = index * barWidth;
            const barHeight = (point.volume / 100) * volumeHeight;
            const y = height - barHeight;
            
            ctx.fillStyle = point.price > (data[index - 1]?.price || point.price) 
                ? chartStyle.bullish 
                : chartStyle.bearish;
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
    }

    function drawLabels() {
        ctx.fillStyle = '#ffd700';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'left';
        
        // Price label
        ctx.fillText('Price: $45,250', 10, 25);
        ctx.fillText('+$1,250 (+2.85%)', 10, 45);
        
        // Volume label
        ctx.textAlign = 'right';
        ctx.fillText('Volume: 24.5K', width - 10, height - 10);
    }

    // Animate chart drawing
    let animationProgress = 0;
    function animateChart() {
        if (animationProgress < 1) {
            animationProgress += 0.02;
            
            // Animate the price line drawing
            const partialData = data.slice(0, Math.floor(data.length * animationProgress));
            if (partialData.length > 0) {
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = chartStyle.background;
                ctx.fillRect(0, 0, width, height);
                drawGrid();
                drawPriceLine(partialData);
                drawVolume(partialData.slice(0, Math.floor(partialData.length * 0.8)));
                drawLabels();
            }
            
            requestAnimationFrame(animateChart);
        } else {
            drawChart();
        }
    }

    // Start animation
    animateChart();

    // Update chart periodically with new data
    setInterval(() => {
        data.push(generateRandomDataPoint());
        if (data.length > 50) {
            data.shift(); // Remove oldest data point
        }
        drawChart();
    }, 3000);
}

// Generate sample trading data
function generateTradingData() {
    const data = [];
    let price = 44000;
    
    for (let i = 0; i < 30; i++) {
        price += (Math.random() - 0.5) * 1000;
        data.push({
            price: Math.max(price, 40000),
            volume: Math.random() * 100 + 20,
            timestamp: Date.now() - (30 - i) * 1000 * 60 * 15 // 15-minute intervals
        });
    }
    
    return data;
}

function generateRandomDataPoint() {
    return {
        price: 44000 + (Math.random() - 0.5) * 5000,
        volume: Math.random() * 100 + 20,
        timestamp: Date.now()
    };
}

// Scroll animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.benefit-card, .package-card, .testimonial-card, .credential');
    animateElements.forEach(el => observer.observe(el));
}

// Back to top button
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Package features toggle for mobile
function initFeatureToggles() {
    const toggles = document.querySelectorAll('.features-toggle');
    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const features = btn.previousElementSibling;
            if (!features || !features.classList.contains('package-features')) return;
            const expanded = features.classList.toggle('expanded');
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            btn.textContent = expanded ? 'Hide details' : 'Show full details';
        });
    });
}

// Performance optimization: Debounced scroll handler
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

// Lazy loading for images (if any are added later)
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-lazy]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.lazy;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Analytics tracking (placeholder for Google Analytics or other services)
function trackEvent(category, action, label, value) {
    // Replace with your analytics implementation
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
    
    console.log(`Analytics Event: ${category} - ${action} - ${label} - ${value}`);
}

// Track button clicks
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        const buttonText = e.target.textContent.trim();
        const section = e.target.closest('section')?.id || 'unknown';
        trackEvent('Button Click', buttonText, section);
    }
    if (e.target.classList.contains('nav-cta')) {
        const linkText = e.target.textContent.trim();
        trackEvent('Nav CTA', linkText, 'header');
    }
});

// Track form submissions
document.addEventListener('submit', function(e) {
    if (e.target.id === 'contactForm') {
        trackEvent('Form', 'Submit', 'Contact Form');
    }
});

// Keyboard accessibility
document.addEventListener('keydown', function(e) {
    // Close mobile menu with Escape key
    if (e.key === 'Escape') {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
    
    // Navigate with arrow keys in FAQ
    if (e.target.closest('.faq-question')) {
        const faqItems = Array.from(document.querySelectorAll('.faq-question'));
        const currentIndex = faqItems.indexOf(e.target);
        
        if (e.key === 'ArrowDown' && currentIndex < faqItems.length - 1) {
            e.preventDefault();
            faqItems[currentIndex + 1].focus();
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            e.preventDefault();
            faqItems[currentIndex - 1].focus();
        }
    }
});

// Error handling for the chart
window.addEventListener('error', function(e) {
    if (e.target.id === 'heroChart') {
        console.warn('Chart rendering failed, hiding chart container');
        const chartContainer = e.target.closest('.trading-chart');
        if (chartContainer) {
            chartContainer.style.display = 'none';
        }
    }
});

// Removed service worker registration to prevent 404 errors in Best Practices audit

// Preload critical resources
function preloadResources() {
    const criticalResources = [
        '/styles.css',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = 'style';
        document.head.appendChild(link);
    });
}

// Initialize preloading
preloadResources();

// Initialize live availability counter
function initLiveAvailability() {
    // Simulate occasional "checking" activity
    function simulateActivity() {
        const indicators = document.querySelectorAll('.status-indicator, .status-live');
        
        // Briefly change the blink speed to simulate activity
        indicators.forEach(indicator => {
            indicator.style.animationDuration = '0.5s';
            setTimeout(() => {
                indicator.style.animationDuration = '2s';
            }, 3000);
        });
    }
    
    // Add subtle "loading" effect occasionally
    function addLoadingEffect() {
        const counterNumbers = document.querySelectorAll('.counter-number');
        
        counterNumbers.forEach(number => {
            // Brief opacity change to simulate updating
            number.style.opacity = '0.7';
            setTimeout(() => {
                number.style.opacity = '1';
            }, 200);
        });
    }
    
    // Simulate activity every 2-5 minutes randomly
    setInterval(() => {
        simulateActivity();
    }, Math.random() * 180000 + 120000); // 2-5 minutes
    
    // Add subtle loading effect every 30-60 seconds
    setInterval(() => {
        addLoadingEffect();
    }, Math.random() * 30000 + 30000); // 30-60 seconds
} 