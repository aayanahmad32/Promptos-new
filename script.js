document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Enhanced User Engagement Tracking for SEO 2025
        let startTime = new Date();
        let maxScroll = 0;
        let userInteractions = {
            clicks: 0,
            promptsGenerated: 0,
            copies: 0,
            shares: 0,
            timeSpent: 0
        };
        
        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((new Date() - startTime) / 1000);
            userInteractions.timeSpent = timeSpent;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'user_session', {
                    'custom_parameter': JSON.stringify(userInteractions)
                });
            }
        });
        
        // Track scroll depth with enhanced granularity
        window.addEventListener('scroll', debounce(() => {
            const scrollPercentage = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercentage > maxScroll) {
                maxScroll = scrollPercentage;
                
                // Track at more granular intervals
                if ([10, 25, 50, 75, 90].includes(scrollPercentage)) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll_depth', {
                            'custom_parameter': scrollPercentage
                        });
                    }
                }
            }
        }, 100));
        
        // Track all user clicks for engagement analysis
        document.addEventListener('click', () => {
            userInteractions.clicks++;
        });
        
        // Lazy loading for images with IntersectionObserver
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
        
        // Update copyright year to 2025
        const copyrightElement = document.getElementById('copyright');
        if (copyrightElement) {
            copyrightElement.innerHTML = '&copy; ' + new Date().getFullYear() + ' PromptOS by LoopLabs. All Rights Reserved.';
        }
        
        let encoding;
        const tokenCountElement = document.getElementById('token-count');
        const tokenDisplayElement = document.getElementById('token-count-display');
        
        // Initialize token counter with fallback
        try {
            encoding = await tiktoken.getEncoding("cl100k_base");
        } catch (error) {
            console.warn("Could not initialize token counter. Feature will be disabled.", error);
            if(tokenDisplayElement) tokenDisplayElement.style.display = 'none';
        }
        
        // Ad Management System - FIXED SECURITY
        const AdManager = {
            initialized: false,
            adSlots: new Map(),
            observer: null,
            
            init() {
                if (this.initialized) return;
                
                // Initialize IntersectionObserver for lazy ad loading
                if ('IntersectionObserver' in window) {
                    this.observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                this.loadAd(entry.target);
                                this.observer.unobserve(entry.target);
                            }
                        });
                    }, {
                        rootMargin: '100px',
                        threshold: 0.1
                    });
                }
                
                // Register all ad containers
                this.registerAdSlots();
                
                // Initialize ads immediately if no IntersectionObserver
                if (!this.observer) {
                    this.loadAllAds();
                }
                
                this.initialized = true;
                console.log('AdManager initialized');
            },
            
            registerAdSlots() {
                const adContainers = document.querySelectorAll('.ad-container');
                adContainers.forEach(container => {
                    const id = container.id || 'ad-' + Math.random().toString(36).substr(2, 9);
                    container.id = id;
                    
                    // Add loading state
                    container.classList.add('loading');
                    
                    // Store ad slot info
                    this.adSlots.set(id, {
                        element: container,
                        loaded: false,
                        type: this.getAdType(container),
                        size: this.getAdSize(container)
                    });
                    
                    // Start observing if IntersectionObserver is available
                    if (this.observer) {
                        this.observer.observe(container);
                    }
                });
            },
            
            getAdType(container) {
                if (container.classList.contains('ad-728')) return 'banner-728';
                if (container.classList.contains('ad-468')) return 'banner-468';
                if (container.classList.contains('ad-300')) return 'box-300';
                if (container.classList.contains('ad-160')) return 'skyscraper-160';
                return 'unknown';
            },
            
            getAdSize(container) {
                if (container.classList.contains('ad-728')) return { width: 728, height: 90 };
                if (container.classList.contains('ad-468')) return { width: 468, height: 60 };
                if (container.classList.contains('ad-300')) return { width: 300, height: 250 };
                if (container.classList.contains('ad-160')) return { width: 160, height: 600 };
                return { width: 0, height: 0 };
            },
            
            loadAd(container) {
                const slotInfo = this.adSlots.get(container.id);
                if (!slotInfo || slotInfo.loaded) return;
                
                // Add ready class for styling
                container.classList.remove('loading');
                container.classList.add('ready');
                
                // Execute ad scripts within container - FIXED SECURITY
                const scripts = container.querySelectorAll('script');
                scripts.forEach(script => {
                    if (script.src) {
                        // External script
                        const newScript = document.createElement('script');
                        newScript.src = script.src;
                        newScript.async = true;
                        newScript.onload = () => {
                            this.onAdLoaded(container);
                        };
                        newScript.onerror = () => {
                            this.onAdError(container);
                        };
                        document.head.appendChild(newScript);
                    } else if (script.textContent) {
                        // Inline script - FIXED: Use safer execution instead of eval
                        try {
                            const newScript = document.createElement('script');
                            newScript.text = script.textContent;
                            document.head.appendChild(newScript);
                            this.onAdLoaded(container);
                        } catch (error) {
                            console.error('Error executing ad script:', error);
                            this.onAdError(container);
                        }
                    }
                });
                
                slotInfo.loaded = true;
            },
            
            loadAllAds() {
                this.adSlots.forEach((slotInfo, id) => {
                    this.loadAd(slotInfo.element);
                });
            },
            
            onAdLoaded(container) {
                container.classList.add('loaded');
                container.classList.remove('loading');
                
                // Track ad view
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'ad_view', {
                        'ad_type': this.getAdType(container),
                        'ad_position': container.id
                    });
                }
                
                console.log('Ad loaded:', container.id);
            },
            
            onAdError(container) {
                container.classList.add('error');
                container.classList.remove('loading');
                
                // Show fallback content
                this.showFallback(container);
                
                // Track ad error
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'ad_error', {
                        'ad_type': this.getAdType(container),
                        'ad_position': container.id
                    });
                }
                
                console.error('Ad failed to load:', container.id);
            },
            
            showFallback(container) {
                const slotInfo = this.adSlots.get(container.id);
                if (!slotInfo) return;
                
                // Create fallback element
                const fallback = document.createElement('div');
                fallback.className = 'ad-fallback';
                fallback.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    min-height: ${slotInfo.size.height}px;
                    background: rgba(21, 24, 38, 0.5);
                    border: 1px dashed var(--panel-border);
                    border-radius: 8px;
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    text-align: center;
                    padding: 10px;
                `;
                fallback.innerHTML = `
                    <div>
                        <i class="fas fa-ad" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                        <div>Advertisement</div>
                        <div style="font-size: 0.8rem; margin-top: 5px;">Space for rent</div>
                    </div>
                `;
                
                // Clear container and add fallback
                container.innerHTML = '';
                container.appendChild(fallback);
            },
            
            refreshAd(containerId) {
                const container = document.getElementById(containerId);
                if (!container) return;
                
                const slotInfo = this.adSlots.get(containerId);
                if (!slotInfo) return;
                
                // Reset slot
                slotInfo.loaded = false;
                container.classList.remove('loaded', 'error', 'ready');
                container.classList.add('loading');
                
                // Reload ad
                this.loadAd(container);
            },
            
            handleResponsiveAds() {
                const width = window.innerWidth;
                
                this.adSlots.forEach((slotInfo, id) => {
                    const container = slotInfo.element;
                    const shouldShow = this.shouldShowAd(width, slotInfo.type);
                    
                    if (shouldShow) {
                        container.style.display = 'flex';
                        if (!slotInfo.loaded && !this.observer) {
                            this.loadAd(container);
                        }
                    } else {
                        container.style.display = 'none';
                    }
                });
            },
            
            shouldShowAd(width, type) {
                switch (type) {
                    case 'banner-728':
                        return width >= 1024;
                    case 'banner-468':
                        return width >= 768;
                    case 'box-300':
                        return width >= 768;
                    case 'skyscraper-160':
                        return width >= 1200;
                    default:
                        return true;
                }
            }
        };
        
        // Initialize AdManager
        AdManager.init();
        
        // FIXED: Handle responsive ads on resize - Only track width changes
        let resizeTimeout;
        let lastWidth = window.innerWidth; // Store initial width
        
        window.addEventListener('resize', () => {
            // Only run if width changed (ignore keyboard height changes)
            if (window.innerWidth !== lastWidth) {
                lastWidth = window.innerWidth;
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    AdManager.handleResponsiveAds();
                }, 250);
            }
        });
        
        // Ad click tracking
        document.addEventListener('click', (e) => {
            const adContainer = e.target.closest('.ad-container');
            if (adContainer) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'ad_click', {
                        'ad_type': AdManager.getAdType(adContainer),
                        'ad_position': adContainer.id
                    });
                }
            }
        });
        
        // Performance monitoring for ads
        const PerformanceMonitor = {
            init() {
                // Monitor Core Web Vitals for ad performance
                if ('PerformanceObserver' in window) {
                    const perfObserver = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.name.includes('ad') || entry.element?.closest('.ad-container')) {
                                this.recordMetric(entry);
                            }
                        }
                    });
                    
                    perfObserver.observe({ type: 'largest-contentful-paint', buffered: true });
                    perfObserver.observe({ type: 'first-input', buffered: true });
                    perfObserver.observe({ type: 'layout-shift', buffered: true });
                }
            },
            
            recordMetric(entry) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'ad_performance', {
                        'metric_name': entry.name,
                        'metric_value': entry.value,
                        'metric_id': entry.id
                    });
                }
            }
        };
        
        PerformanceMonitor.init();
        
        // Ad refresh timer (refresh ads every 30 seconds)
        setInterval(() => {
            AdManager.adSlots.forEach((slotInfo, id) => {
                if (slotInfo.loaded && isElementInViewport(slotInfo.element)) {
                    AdManager.refreshAd(id);
                }
            });
        }, 30000);
        
        const PromptOS = {
            state: { 
                finalPrompt: '', 
                parsedPromptData: null, 
                history: [],
                isJsonFormat: false,
                isSqlFormat: false,
                isYamlFormat: false,
                isXmlFormat: false,
                isGraphFormat: false,
                isMarkdownFormat: false,
                isCsvFormat: false,
                isTomlFormat: false,
                isLightTheme: false,
                lastActivity: Date.now()
            },
            elements: {},
            templateDB: {
                "Business Guides": [
                    {name: "SWOT Analysis", idea: "a SWOT analysis for a new coffee shop"}, 
                    {name: "Elevator Pitch", idea: "a 30-second elevator pitch for a new tech startup"}, 
                    {name: "Cold Email Outreach", idea: "a cold email to a potential client offering web design services"}, 
                    {name: "Business Plan Outline", idea: "an outline for a business plan for an online clothing store"}, 
                    {name: "Market Research Questions", idea: "a list of questions for market research on a new mobile app"}, 
                    {name: "Press Release", idea: "a press release announcing a new product launch"}, 
                    {name: "Job Description", idea: "a job description for a senior marketing manager"}, 
                    {name: "Performance Review", idea: "a template for an employee performance review"}, 
                    {name: "Meeting Agenda", idea: "an agenda for a weekly team meeting"}, 
                    {name: "Investor Update", idea: "a monthly update email for investors"}
                ],
                "Brand Study": [
                    {name: "Brand Competitor Analysis", idea: "an analysis of the top 3 competitors for Nike"}, 
                    {name: "Brand Failure Analysis", idea: "an analysis of why Blockbuster failed"}, 
                    {name: "Brand History Summary", idea: "a summary of the history of Coca-Cola"}, 
                    {name: "Brand Statistics Report", idea: "a report on the market share statistics of Apple"}, 
                    {name: "Business Model Canvas", idea: "a business model canvas for Spotify"}, 
                    {name: "Brand Strategy Outline", idea: "an outline of a brand strategy for a new luxury car brand"}, 
                    {name: "Target Audience Persona", idea: "a target audience persona for a new gaming console"}, 
                    {name: "Brand Voice & Tone Guide", idea: "a guide for the brand voice and tone of a friendly, approachable SaaS company"}, 
                    {name: "Logo Concept Brief", idea: "a brief for a logo designer for a new vegan restaurant"}, 
                    {name: "Slogan Generation", idea: "generate 10 slogans for a new brand of eco-friendly cleaning products"}
                ],
                "Startup Essentials": [
                    {name: "Startup Pitch Deck Outline", idea: "an outline for a 10-slide startup pitch deck"}, 
                    {name: "Lean Canvas", idea: "a lean canvas for a new food delivery app"}, 
                    {name: "Value Proposition Statement", idea: "a value proposition statement for an online learning platform"}, 
                    {name: "Go-to-Market Strategy", idea: "a go-to-market strategy for a new productivity tool"}, 
                    {name: "Financial Projections", idea: "a simple 3-year financial projection for a small business"}, 
                    {name: "User Persona Development", idea: "a set of user personas for a new social media app"}, 
                    {name: "Minimum Viable Product (MVP) Features", idea: "a list of MVP features for a new project management tool"}, 
                    {name: "Investor Questions Prep", idea: "a list of common questions investors ask startups"}, 
                    {name: "Cap Table Template", idea: "a simple capitalization table for a startup with two founders"}, 
                    {name: "Term Sheet Explained", idea: "explain the key terms in a startup term sheet"}
                ],
                "AI Tools & Prompts": [
                    {name: "ChatGPT Prompt for Summarization", idea: "a prompt to make ChatGPT summarize a long article"}, 
                    {name: "Midjourney Prompt for Characters", idea: "a Midjourney prompt for a photorealistic fantasy elf"}, 
                    {name: "Stable Diffusion Prompt for Landscapes", idea: "a Stable Diffusion prompt for a breathtaking mountain landscape"}, 
                    {name: "AI Business Idea Generator", idea: "generate 5 business ideas using AI"}, 
                    {name: "AI Elevator Pitch Generator", idea: "generate an elevator pitch for an AI-powered personal assistant"}, 
                    {name: "AI Code Debugging Prompt", idea: "a prompt to help debug a Python script"}, 
                    {name: "AI Content Marketing Strategy", idea: "an AI-driven content marketing strategy"}, 
                    {name: "AI Email Subject Line Generator", idea: "generate 10 catchy email subject lines for a sale"}, 
                    {name: "AI Social Media Post Generator", idea: "generate a week of social media posts for a coffee shop"}, 
                    {name: "AI Persona Creator", idea: "create a detailed user persona for a fitness app"}
                ],
                "🎨 Creative Arts & Design": [
                    { name: "Character Concept Art", idea: "Detailed concept art of a futuristic bounty hunter" }, 
                    { name: "Architectural Visualization", idea: "Photorealistic render of a modern glass house in a forest" }, 
                    { name: "Logo Design Brief", idea: "Create a design brief for a minimalist logo for an organic skincare brand" }, 
                    { name: "Album Cover Art", idea: "concept art for a synthwave album cover"},
                    {name: "T-Shirt Design", idea: "a vintage-style t-shirt design for a national park"},
                    {name: "Infographic Design", idea: "design an infographic about the benefits of hydration"},
                    {name: "Book Cover Concept", idea: "a concept for a fantasy novel book cover"},
                    {name: "Interior Design Moodboard", idea: "a moodboard for a Scandinavian-style living room"},
                    {name: "Fashion Sketch", idea: "a fashion sketch of a futuristic streetwear outfit"},
                    {name: "3D Model Idea", idea: "an idea for a low-poly 3D model of a fantasy creature"}
                ],
                "💻 Software Development": [
                    { name: "Python API Endpoint", idea: "Write a Python Flask API endpoint to fetch user data" }, 
                    { name: "JavaScript Component", idea: "Create a reusable React component for a pricing card" }, 
                    { name: "SQL Database Schema", idea: "Design an SQL schema for a simple e-commerce website"},
                    {name: "Unit Test Generation", idea: "write unit tests for a javascript function that calculates sales tax"},
                    {name: "Code Refactoring", idea: "refactor this messy python script to be more readable"},
                    {name: "Algorithm Explanation", idea: "explain the quicksort algorithm in simple terms"},
                    {name: "DevOps CI/CD Pipeline", idea: "outline a simple CI/CD pipeline for a web app using GitHub Actions"},
                    {name: "API Documentation", idea: "write API documentation for a user authentication endpoint"},
                    {name: "Regex Generator", idea: "create a regex to validate a phone number"},
                    {name: "Docker File Creation", idea: "create a Dockerfile for a basic Node.js application"}
                ]
            },
            
            init() {
                this.cacheElements();
                this.attachEventListeners();
                this.loadHistory();
                this.loadTheme();
                this.updateLiveActivity();
                
                // Initialize performance monitoring
                this.initPerformanceMonitoring();
                
                // Check if PWA is supported and register service worker
                if ('serviceWorker' in navigator) {
                    this.registerServiceWorker();
                }
                
                // Add install button functionality
                this.addInstallButtonFunctionality();
                
                // Add license warning
                this.addLicenseWarning();
                
                // Add modal event listeners - FIXED: Using event delegation
                this.addModalEventListeners();
                
                // Initialize custom modal
                this.initCustomModal();
                
                // Update live activity every 30 seconds
                setInterval(() => this.updateLiveActivity(), 30000);
                
                // Track page load performance
                this.trackPageLoadPerformance();
            },
            
            initPerformanceMonitoring() {
                // Track Core Web Vitals
                if ('PerformanceObserver' in window) {
                    const perfObserver = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (typeof gtag !== 'undefined') {
                                gtag('event', 'core_web_vital', {
                                    'name': entry.name,
                                    'value': entry.value,
                                    'id': entry.id
                                });
                            }
                        }
                    });
                    
                    perfObserver.observe({ type: 'largest-contentful-paint', buffered: true });
                    perfObserver.observe({ type: 'first-input', buffered: true });
                    perfObserver.observe({ type: 'layout-shift', buffered: true });
                }
            },
            
            trackPageLoadPerformance() {
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const perfData = performance.getEntriesByType('navigation')[0];
                        if (perfData && typeof gtag !== 'undefined') {
                            gtag('event', 'page_load_performance', {
                                'domContentLoaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                                'pageLoad': perfData.loadEventEnd - perfData.loadEventStart,
                                'firstPaint': perfData.responseEnd - perfData.fetchStart
                            });
                        }
                    }, 0);
                });
            },
            
            cacheElements() {
                this.elements = {
                    canvas: document.getElementById('prompt-canvas'),
                    output: document.getElementById('output-preview'),
                    templateModal: document.getElementById('template-modal'),
                    historyPanel: document.getElementById('history-panel'),
                    conversionButtons: document.getElementById('conversion-buttons'),
                    shareModal: document.getElementById('share-modal'),
                    shareLink: document.getElementById('share-link'),
                    menuBtn: document.getElementById('menu-btn'),
                    menuDropdown: document.getElementById('menu-dropdown'),
                    themeToggle: document.getElementById('theme-toggle'),
                    loadingIndicator: document.getElementById('loading-indicator'),
                    qualityScore: document.getElementById('quality-score'),
                    scoreFill: document.getElementById('score-fill'),
                    scoreText: document.getElementById('score-text'),
                    activeUsers: document.getElementById('active-users'),
                    promptsGenerated: document.getElementById('prompts-generated'),
                    searchBtn: document.getElementById('search-btn'),
                    templateSearchInput: document.getElementById('template-search-input'),
                    // Custom modal elements
                    customModal: document.getElementById('custom-modal'),
                    customModalTitle: document.getElementById('custom-modal-title'),
                    customModalBody: document.getElementById('custom-modal-body'),
                    customModalBackBtn: document.getElementById('custom-modal-back-btn'),
                    customModalCloseBtn: document.getElementById('custom-modal-close-btn'),
                    aboutLink: document.getElementById('about-link'),
                    privacyLink: document.getElementById('privacy-link')
                };
            },
            
            attachEventListeners() {
                // Generate buttons with enhanced tracking
                const generateBtnTop = document.getElementById('generate-btn-top');
                const generateBtn = document.getElementById('generate-btn');
                
                if (generateBtnTop) {
                    generateBtnTop.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.generateFullPrompt();
                        userInteractions.promptsGenerated++;
                        this.trackUserAction('prompt_generated', 'top_button');
                    });
                }
                
                if (generateBtn) {
                    generateBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.generateFullPrompt();
                        userInteractions.promptsGenerated++;
                        this.trackUserAction('prompt_generated', 'bottom_button');
                    });
                }
                
                // Menu button
                if (this.elements.menuBtn) {
                    this.elements.menuBtn.addEventListener('click', () => {
                        this.elements.menuDropdown.classList.toggle('active');
                        this.trackUserAction('menu_opened');
                    });
                }
                
                // Theme toggle
                if (this.elements.themeToggle) {
                    this.elements.themeToggle.addEventListener('click', () => {
                        this.toggleTheme();
                        this.trackUserAction('theme_toggled');
                    });
                }
                
                // Menu items with tracking
                const installItem = document.getElementById('install-item');
                if (installItem) {
                    installItem.addEventListener('click', () => {
                        this.elements.menuDropdown.classList.remove('active');
                        this.showNotification('Install feature coming soon!');
                        this.trackUserAction('install_clicked');
                    });
                }
                
                const docsItem = document.getElementById('docs-item');
                if (docsItem) {
                    docsItem.addEventListener('click', () => {
                        this.elements.menuDropdown.classList.remove('active');
                        document.getElementById('docs-modal').classList.add('active');
                        this.trackUserAction('docs_opened');
                    });
                }
                
                const blogItem = document.getElementById('blog-item');
                if (blogItem) {
                    blogItem.addEventListener('click', () => {
                        this.elements.menuDropdown.classList.remove('active');
                        document.getElementById('blog-modal').classList.add('active');
                        this.trackUserAction('blog_opened');
                    });
                }
                
                const aboutItem = document.getElementById('about-item');
                if (aboutItem) {
                    aboutItem.addEventListener('click', () => {
                        this.elements.menuDropdown.classList.remove('active');
                        this.showCustomModal('About Us', 'about-content');
                        this.trackUserAction('about_opened');
                    });
                }
                
                const privacyItem = document.getElementById('privacy-item');
                if (privacyItem) {
                    privacyItem.addEventListener('click', () => {
                        this.elements.menuDropdown.classList.remove('active');
                        this.showCustomModal('Privacy Policy', 'privacy-content');
                        this.trackUserAction('privacy_opened');
                    });
                }
                
                const instagramItem = document.getElementById('instagram-item');
                if (instagramItem) {
                    instagramItem.addEventListener('click', () => {
                        this.elements.menuDropdown.classList.remove('active');
                        window.open('https://www.instagram.com/looplabstech?igsh=MW11cDRoMnhmdDBqaw==', '_blank');
                        this.trackUserAction('instagram_clicked');
                    });
                }
                
                const contactItem = document.getElementById('contact-item');
                if (contactItem) {
                    contactItem.addEventListener('click', () => {
                        this.elements.menuDropdown.classList.remove('active');
                        window.open('https://www.instagram.com/looplabstech?igsh=MW11cDRoMnhmdDBqaw==', '_blank');
                        this.trackUserAction('contact_clicked');
                    });
                }
                
                // Close menu when clicking outside
                document.addEventListener('click', (e) => {
                    if (!this.elements.menuBtn.contains(e.target) && !this.elements.menuDropdown.contains(e.target)) {
                        this.elements.menuDropdown.classList.remove('active');
                    }
                });
                
                // Other buttons with tracking
                const copyBtnTop = document.getElementById('copy-btn-top');
                if (copyBtnTop) {
                    copyBtnTop.addEventListener('click', () => {
                        this.copyPrompt();
                        userInteractions.copies++;
                        this.trackUserAction('prompt_copied', 'top_button');
                    });
                }
                
                const copyBtn = document.getElementById('copy-btn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                        this.copyPrompt();
                        userInteractions.copies++;
                        this.trackUserAction('prompt_copied', 'bottom_button');
                    });
                }
                
                const historyBtn = document.getElementById('history-btn');
                if (historyBtn) {
                    historyBtn.addEventListener('click', () => {
                        this.toggleHistoryPanel(true);
                        this.trackUserAction('history_opened');
                    });
                }
                
                const settingsBtn = document.getElementById('settings-btn');
                if (settingsBtn) {
                    settingsBtn.addEventListener('click', () => {
                        this.showNotification('New features coming soon!');
                        this.trackUserAction('settings_clicked');
                    });
                }
                
                // Search button - FIXED
                if (this.elements.searchBtn) {
                    this.elements.searchBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showSearchModal();
                        this.trackUserAction('search_opened');
                    });
                }
                
                // Conversion buttons with tracking
                const conversionButtons = document.getElementById('conversion-buttons');
                if (conversionButtons) {
                    const convertContextBtn = document.getElementById('convert-context-btn');
                    if (convertContextBtn) {
                        convertContextBtn.addEventListener('click', () => {
                            this.convertToContextual();
                            this.trackUserAction('format_converted', 'contextual');
                        });
                    }
                    
                    const convertJsonBtn = document.getElementById('convert-json-btn');
                    if (convertJsonBtn) {
                        convertJsonBtn.addEventListener('click', () => {
                            this.convertToJson();
                            this.trackUserAction('format_converted', 'json');
                        });
                    }
                    
                    const convertSqlBtn = document.getElementById('convert-sql-btn');
                    if (convertSqlBtn) {
                        convertSqlBtn.addEventListener('click', () => {
                            this.convertToSql();
                            this.trackUserAction('format_converted', 'sql');
                        });
                    }
                    
                    const convertYamlBtn = document.getElementById('convert-yaml-btn');
                    if (convertYamlBtn) {
                        convertYamlBtn.addEventListener('click', () => {
                            this.convertToYaml();
                            this.trackUserAction('format_converted', 'yaml');
                        });
                    }
                    
                    const convertXmlBtn = document.getElementById('convert-xml-btn');
                    if (convertXmlBtn) {
                        convertXmlBtn.addEventListener('click', () => {
                            this.convertToXml();
                            this.trackUserAction('format_converted', 'xml');
                        });
                    }
                    
                    const convertGraphBtn = document.getElementById('convert-graph-btn');
                    if (convertGraphBtn) {
                        convertGraphBtn.addEventListener('click', () => {
                            this.convertToGraph();
                            this.trackUserAction('format_converted', 'graph');
                        });
                    }
                    
                    const convertMarkdownBtn = document.getElementById('convert-markdown-btn');
                    if (convertMarkdownBtn) {
                        convertMarkdownBtn.addEventListener('click', () => {
                            this.convertToMarkdown();
                            this.trackUserAction('format_converted', 'markdown');
                        });
                    }
                    
                    const convertCsvBtn = document.getElementById('convert-csv-btn');
                    if (convertCsvBtn) {
                        convertCsvBtn.addEventListener('click', () => {
                            this.convertToCsv();
                            this.trackUserAction('format_converted', 'csv');
                        });
                    }
                    
                    const convertTomlBtn = document.getElementById('convert-toml-btn');
                    if (convertTomlBtn) {
                        convertTomlBtn.addEventListener('click', () => {
                            this.convertToToml();
                            this.trackUserAction('format_converted', 'toml');
                        });
                    }
                }
                
                // Share button with tracking
                const shareBtnTop = document.getElementById('share-btn-top');
                if (shareBtnTop) {
                    shareBtnTop.addEventListener('click', () => {
                        this.showShareModal();
                        this.trackUserAction('share_opened', 'top_button');
                    });
                }
                
                const shareBtn = document.getElementById('share-btn');
                if (shareBtn) {
                    shareBtn.addEventListener('click', () => {
                        this.showShareModal();
                        this.trackUserAction('share_opened', 'bottom_button');
                    });
                }
                
                // Share options with tracking
                document.querySelectorAll('.share-option').forEach(option => {
                    option.addEventListener('click', (e) => {
                        e.preventDefault(); 
                        const platform = e.currentTarget.dataset.platform;
                        this.sharePrompt(platform);
                        userInteractions.shares++;
                        this.trackUserAction('prompt_shared', platform);
                    });
                });
                
                // Copy link button
                const copyLinkBtn = document.getElementById('copy-link-btn');
                if (copyLinkBtn) {
                    copyLinkBtn.addEventListener('click', (e) => {
                        e.preventDefault(); 
                        if (this.elements.shareLink) {
                            this.elements.shareLink.select();
                            document.execCommand('copy');
                            this.showNotification('Link copied to clipboard!');
                            this.trackUserAction('link_copied');
                        }
                    });
                }
            },
            
            // FIXED: Custom Modal Implementation
            initCustomModal() {
                if (!this.elements.customModal) return;
                
                // Custom modal event listeners using event delegation
                document.addEventListener('click', (e) => {
                    // Handle back button
                    const backBtn = e.target.closest('#custom-modal-back-btn');
                    if (backBtn) {
                        e.preventDefault();
                        this.hideCustomModal();
                        return;
                    }
                    
                    // Handle close button
                    const closeBtn = e.target.closest('#custom-modal-close-btn');
                    if (closeBtn) {
                        e.preventDefault();
                        this.hideCustomModal();
                        return;
                    }
                    
                    // Handle overlay click
                    if (e.target === this.elements.customModal) {
                        this.hideCustomModal();
                        return;
                    }
                });
                
                // Handle escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.elements.customModal.classList.contains('active')) {
                        this.hideCustomModal();
                    }
                });
                
                // Footer links
                if (this.elements.aboutLink) {
                    this.elements.aboutLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showCustomModal('About Us', 'about-content');
                        this.trackUserAction('about_opened', 'footer_link');
                    });
                }
                
                if (this.elements.privacyLink) {
                    this.elements.privacyLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.showCustomModal('Privacy Policy', 'privacy-content');
                        this.trackUserAction('privacy_opened', 'footer_link');
                    });
                }
            },
            
            showCustomModal(title, contentId) {
                if (!this.elements.customModal || !this.elements.customModalTitle || !this.elements.customModalBody) return;
                
                // Get content from hidden container
                const contentContainer = document.getElementById(contentId);
                if (!contentContainer) return;
                
                // Set title
                this.elements.customModalTitle.textContent = title;
                
                // Clone and append content
                this.elements.customModalBody.innerHTML = '';
                const clonedContent = contentContainer.cloneNode(true);
                clonedContent.style.display = 'block';
                this.elements.customModalBody.appendChild(clonedContent);
                
                // Show modal
                this.elements.customModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Focus management for accessibility
                setTimeout(() => {
                    this.elements.customModalBackBtn.focus();
                }, 100);
            },
            
            hideCustomModal() {
                if (!this.elements.customModal) return;
                
                this.elements.customModal.classList.remove('active');
                document.body.style.overflow = '';
                
                // Clear content
                if (this.elements.customModalBody) {
                    this.elements.customModalBody.innerHTML = '';
                }
            },
            
            // FIXED: Modal event listeners with proper back button handling
            addModalEventListeners() {
                // Close modal when clicking on close button or backdrop
                document.addEventListener('click', (e) => {
                    // Check if clicked element is a close button
                    if (e.target.classList.contains('modal-close-btn') || e.target.closest('.modal-close-btn')) {
                        const modal = e.target.closest('.modal-overlay');
                        if (modal) {
                            modal.classList.remove('active');
                        }
                    }
                    
                    // Close modal when clicking outside
                    if (e.target.classList.contains('modal-overlay')) {
                        e.target.classList.remove('active');
                    }
                });
                
                // FIXED: Handle back buttons for specific modals
                const templateModalBackBtn = document.getElementById('template-modal-back-btn');
                if (templateModalBackBtn) {
                    templateModalBackBtn.addEventListener('click', () => {
                        document.getElementById('template-modal').classList.remove('active');
                    });
                }
                
                const aboutUsBackBtn = document.getElementById('about-us-back-btn');
                if (aboutUsBackBtn) {
                    aboutUsBackBtn.addEventListener('click', () => {
                        document.getElementById('about-us-modal').classList.remove('active');
                    });
                }
                
                const privacyPolicyBackBtn = document.getElementById('privacy-policy-back-btn');
                if (privacyPolicyBackBtn) {
                    privacyPolicyBackBtn.addEventListener('click', () => {
                        document.getElementById('privacy-policy-modal').classList.remove('active');
                    });
                }
                
                // Handle back buttons for other modals
                const blogBackBtn = document.getElementById('blog-back-btn');
                if (blogBackBtn) {
                    blogBackBtn.addEventListener('click', () => {
                        document.getElementById('blog-modal').classList.remove('active');
                    });
                }
                
                const docsBackBtn = document.getElementById('docs-back-btn');
                if (docsBackBtn) {
                    docsBackBtn.addEventListener('click', () => {
                        document.getElementById('docs-modal').classList.remove('active');
                    });
                }
                
                // Close modals with Escape key
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                            modal.classList.remove('active');
                        });
                        if (this.elements.historyPanel) {
                            this.elements.historyPanel.classList.remove('active');
                        }
                    }
                });
            },
            
            trackUserAction(action, label = '') {
                if (typeof gtag !== 'undefined') {
                    gtag('event', action, {
                        'event_label': label,
                        'custom_parameter': Date.now() - this.state.lastActivity
                    });
                }
                this.state.lastActivity = Date.now();
            },
            
            addLicenseWarning() {
                // Console warning about license
                console.log('%c⚠️ LICENSE WARNING ⚠️', 'color: #9b59b6; font-size: 24px; font-weight: bold;');
                console.log('%cThis software is licensed under the PromptOS Restricted License.', 'color: #333; font-size: 16px;');
                console.log('%cPersonal use is permitted, but modification and commercial use require explicit permission.', 'color: #333; font-size: 16px;');
                console.log('%cFor inquiries, please contact: Instagram @looplabstech', 'color: #333; font-size: 16px;');
            },
            
            registerServiceWorker() {
                // Check if the current page is served over HTTPS or localhost
                if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
                    navigator.serviceWorker.register('/sw.js').then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    }).catch(error => {
                        console.log('ServiceWorker registration failed: ', error);
                    });
                }
            },
            
            addInstallButtonFunctionality() {
                const installButton = document.getElementById('install-button');
                
                // Check if the app is already installed
                if (window.matchMedia('(display-mode: standalone)').matches) {
                    installButton.style.display = 'none';
                }
                
                // Show install button when the app can be installed
                window.addEventListener('beforeinstallprompt', (event) => {
                    // Prevent the default browser install prompt
                    event.preventDefault();
                    // Store the event for later use
                    this.deferredPrompt = event;
                    // Show the install button
                    installButton.style.display = 'flex';
                });
                
                // Install the app when the button is clicked
                installButton.addEventListener('click', () => {
                    if (this.deferredPrompt) {
                        // Show the install prompt
                        this.deferredPrompt.prompt();
                        // Wait for the user to respond to the prompt
                        this.deferredPrompt.userChoice.then((choiceResult) => {
                            if (choiceResult.outcome === 'accepted') {
                                this.showNotification('App installed successfully!');
                                this.trackUserAction('app_installed');
                            } else {
                                this.showNotification('App installation was cancelled.');
                                this.trackUserAction('install_cancelled');
                            }
                            this.deferredPrompt = null;
                        });
                    }
                });
                
                // Hide the install button when the app is installed
                window.addEventListener('appinstalled', () => {
                    installButton.style.display = 'none';
                    this.showNotification('App installed successfully!');
                    this.trackUserAction('app_installed');
                });
            },
            
            toggleTheme() {
                this.state.isLightTheme = !this.state.isLightTheme;
                document.body.classList.toggle('light-theme', this.state.isLightTheme);
                this.elements.themeToggle.classList.toggle('active', this.state.isLightTheme);
                localStorage.setItem('promptOSTheme', this.state.isLightTheme ? 'light' : 'dark');
                this.trackUserAction('theme_changed', this.state.isLightTheme ? 'light' : 'dark');
            },
            
            loadTheme() {
                const savedTheme = localStorage.getItem('promptOSTheme');
                if (savedTheme === 'light') {
                    this.state.isLightTheme = true;
                    document.body.classList.add('light-theme');
                    this.elements.themeToggle.classList.add('active');
                }
            },
            
            updateLiveActivity() {
                // Simulate active users (random between 50 and 200)
                const activeUsers = Math.floor(Math.random() * 151) + 50;
                if (this.elements.activeUsers) {
                    this.elements.activeUsers.textContent = activeUsers;
                }
                
                // Get prompts generated from localStorage or default to 0
                const promptsGenerated = parseInt(localStorage.getItem('promptOSPromptsGenerated') || '0');
                if (this.elements.promptsGenerated) {
                    this.elements.promptsGenerated.textContent = promptsGenerated;
                }
            },
            
            analyzeIntent(idea) {
                const lowerIdea = idea.toLowerCase();
                const creativeArtKeywords = ['photo', 'image', 'art', 'painting', 'render', 'cinematic', 'logo', 'drawing', 'illustration', 'picture', 'portrait', 'potrait', 'rococo', 'style', 'photorealistic', 'concept art', 'design', 'album cover', 't-shirt design', 'infographic', 'book cover', 'interior design', 'fashion sketch', '3d model'];
                if (creativeArtKeywords.some(kw => lowerIdea.includes(kw))) return 'creative_art';
                const softwareDevKeywords = ['python', 'javascript', 'js', 'react', 'sql', 'code', 'debug', 'refactor', 'algorithm', 'api', 'devops', 'ci/cd', 'regex', 'docker', 'script', 'function', 'test', 'schema', 'program', 'coding'];
                if (softwareDevKeywords.some(kw => lowerIdea.includes(kw))) return 'software_dev';
                const businessKeywords = ['swot', 'pitch', 'business plan', 'market research', 'press release', 'job description', 'performance review', 'meeting agenda', 'investor update', 'brand analysis', 'business model', 'target audience', 'slogan', 'startup', 'lean canvas', 'value proposition', 'go-to-market', 'financial projection', 'user persona', 'mvp', 'cap table', 'term sheet', 'marketing', 'sales', 'strategy', 'company', 'market', 'competitor', 'revenue'];
                if (businessKeywords.some(kw => lowerIdea.includes(kw))) return 'business';
                const writingKeywords = ['summarize', 'outline', 'write an email', 'blog post', 'social media', 'story', 'poem', 'lyrics', 'recipe', 'article', 'essay', 'report', 'document', 'content', 'generate text'];
                if (writingKeywords.some(kw => lowerIdea.includes(kw))) return 'writing';
                const scienceKeywords = ['quantum physics', 'biology', 'chemistry', 'astronomy', 'research', 'theory', 'experiment', 'analysis', 'scientific', 'data analysis', 'scientific report'];
                if (scienceKeywords.some(kw => lowerIdea.includes(kw))) return 'science';
                return 'general';
            },
            
            calculateQualityScore(prompt) {
                // Enhanced quality score calculation for 2025
                let score = 0;
                
                // Base score for length (0-30 points)
                if (prompt.length > 100) score += 10;
                if (prompt.length > 300) score += 10;
                if (prompt.length > 500) score += 10;
                
                // Structure score (0-40 points)
                if (prompt.includes('Goal')) score += 10;
                if (prompt.includes('Return Format')) score += 10;
                if (prompt.includes('Warnings')) score += 10;
                if (prompt.includes('Context')) score += 10;
                
                // Content score (0-30 points)
                if (prompt.includes('example')) score += 10;
                if (prompt.includes('instruction')) score += 10;
                if (prompt.length > 800) score += 10;
                
                // 2025 enhancements
                if (prompt.includes('2025')) score += 5;
                if (prompt.includes('AI')) score += 5;
                if (prompt.includes('multimodal')) score += 5;
                
                // Cap at 100
                score = Math.min(score, 100);
                
                return score;
            },
            
            generateFullPrompt() {
                try {
                    // Show loading indicator
                    if (this.elements.loadingIndicator) {
                        this.elements.loadingIndicator.classList.add('loading-active');
                    }
                    
                    const autoCorrectCheckbox = document.getElementById('auto-correct-toggle');
                    let idea = this.elements.canvas.value.trim();
                    if (!idea) {
                        this.showNotification("Please type your core idea first!");
                        if (this.elements.loadingIndicator) {
                            this.elements.loadingIndicator.classList.remove('loading-active');
                        }
                        return;
                    }
                    if (autoCorrectCheckbox && autoCorrectCheckbox.checked) {
                        idea = 'First, please correct any spelling and grammatical errors in the following user idea. Then, use the corrected and improved version of the idea to fulfill the original request as expertly as possible. Original user idea: "' + idea + '"';
                    }
                    
                    const intent = this.analyzeIntent(idea);
                    let promptParts = { 
                        goal: idea, 
                        returnFormat: '', 
                        warnings: '', 
                        contextDump: '',
                        inputExample: idea,
                        outputExample: ''
                    };
                    
                    // Enhanced prompt generation for 2025
                    const yearContext = "As of 2025, consider the latest advancements in AI technology and best practices for prompt engineering.";
                    
                    switch(intent) {
                        case 'creative_art':
                            promptParts.goal = 'Generate concept art/an image for: "' + idea + '".';
                            promptParts.returnFormat = 'A high-resolution image description ready for an image generation AI, including artistic style, composition, lighting, and specific details optimized for 2025 AI models.';
                            promptParts.warnings = 'Avoid modern elements unless specified. Ensure no cartoonish proportions or overly saturated colors. Focus on the artistic elements. Consider 2025 AI capabilities for image generation.';
                            promptParts.contextDump = '**Character:**\nAct as a world-class creative director with expertise in visual arts, composition, and historical/modern artistic styles.\n**Instructions:**\n- Deconstruct the core idea into visual components.\n- Suggest a specific artistic style or influence.\n- Describe lighting, camera angle, and mood.\n- Include details about subject, background, and foreground elements.\n- Consider 2025 AI capabilities for enhanced image generation.\n**Examples:**\nInspired by François Boucher and Jean-Honoré Fragonard, with soft brushwork, intricate fabrics, and opulent backgrounds. Cinematic lighting similar to Barry Lyndon (naturalistic candlelight glow).\n**Adjustments (Optional):**\n- Camera angle: Slightly low, giving a regal, elevated presence.\n- Lighting: Soft diffused daylight from the left, with gentle shadows for depth.\n- Mood: Graceful, dignified, and slightly whimsical, with warm and inviting atmosphere.\n- Composition: Centered subject, full-length framing, rule-of-thirds alignment for background elements.\n**Extras (Optional):**\n- Details: Elaborate silk gown with floral embroidery and lace trim.\n- Background: A grand palace garden with marble balustrades and blooming roses.\n**Negative Prompts (Optional):**\n- Avoid modern elements, harsh shadows, cartoonish proportions, excessive blur.\n**2025 Enhancement:**\n- Consider multimodal capabilities and advanced AI understanding of artistic concepts.';
                            promptParts.outputExample = 'A detailed description of the requested artwork, including style, composition, lighting, and mood elements optimized for 2025 AI models.';
                            break;
                        case 'software_dev':
                            promptParts.goal = 'Develop a software solution for: "' + idea + '".';
                            promptParts.returnFormat = 'Well-commented code snippet in the most appropriate language, adhering to 2025 best practices. If a script, include execution instructions. If a design, use clear diagrams/descriptions.';
                            promptParts.warnings = 'Ensure code is syntactically correct and runnable. Do not include placeholder comments or vague instructions. Prioritize security and efficiency. Consider 2025 software development standards.';
                            promptParts.contextDump = '**Character:**\nAssume the role of a senior software engineer with expertise in system design, coding best practices, and debugging across various programming languages.\n**Instructions:**\n- Break down the request into logical programming steps.\n- Suggest the most suitable programming language or technology stack.\n- Provide clear, concise, and executable code.\n- Include comments to explain complex logic or critical sections.\n- For API endpoints, define request/response structures.\n- For database schemas, provide table definitions and relationships.\n- For algorithms, explain the logic and time/space complexity.\n**Best Practices:**\n- Follow SOLID principles where applicable.\n- Consider edge cases and error handling.\n- Aim for modularity and reusability.\n- Incorporate 2025 software development standards and AI-assisted coding practices.';
                            promptParts.outputExample = 'A complete code solution with comments explaining the implementation and usage, following 2025 best practices.';
                            break;
                        case 'business':
                            promptParts.goal = 'Generate a business-focused analysis/plan for: "' + idea + '".';
                            promptParts.returnFormat = 'A structured report or outline, using professional business terminology, presented in a clear and actionable format (e.g., bullet points, numbered lists, specific sections) optimized for 2025 business strategies.';
                            promptParts.warnings = 'Avoid generic advice. Focus on practical, actionable insights relevant to the business context. Do not include financial figures unless explicitly requested and data is provided. Consider 2025 business trends and AI integration.';
                            promptParts.contextDump = '**Character:**\nAct as an experienced business strategist and market analyst with a deep understanding of corporate strategy, market dynamics, and operational efficiency.\n**Instructions:**\n- Deconstruct the business idea into core components (e.g., market, product, competition, strategy).\n- Provide a detailed and insightful analysis.\n- Offer actionable recommendations or a strategic outline.\n- Use appropriate business frameworks (e.g., SWOT, Porter\'s Five Forces, Lean Canvas) if relevant.\n- Consider 2025 business trends, AI integration, and digital transformation strategies.\n**Audience:**\n- Assume the audience is a stakeholder, investor, or management team seeking professional guidance.';
                            promptParts.outputExample = 'A comprehensive business analysis with strategic recommendations and actionable insights for 2025.';
                            break;
                        case 'writing':
                            promptParts.goal = 'Craft a piece of writing/content about: "' + idea + '".';
                            promptParts.returnFormat = 'Well-structured text, adhering to specific length (e.g., a paragraph, an email draft, 5 social media posts), tone (e.g., formal, informal, persuasive), and audience requirements optimized for 2025 content standards.';
                            promptParts.warnings = 'Avoid plagiarism. Ensure factual accuracy for non-creative pieces. Maintain consistent tone and style throughout. Proofread for grammar and spelling. Consider 2025 content trends and AI-assisted writing.';
                            promptParts.contextDump = '**Character:**\nAssume the role of a skilled technical writer, content strategist, or creative storyteller, depending on the context of the idea.\n**Instructions:**\n- Understand the purpose and target audience for the content.\n- Outline key points or arguments before writing.\n- Use clear, concise language.\n- Adapt the tone and style to suit the output format (e.g., conversational for social media, formal for a report).\n- Ensure the content flows logically.\n- Consider 2025 content trends, SEO best practices, and AI-assisted writing techniques.\n**Format Guidelines:**\n- For emails: include subject line, greeting, body, and closing.\n- For articles/blog posts: suggest headings and structure.\n- For social media: provide short, engaging posts suitable for platform.';
                            promptParts.outputExample = 'A well-crafted piece of writing that meets specified requirements for tone, style, and audience, optimized for 2025.';
                            break;
                        case 'science':
                            promptParts.goal = 'Explain the scientific concept of: "' + idea + '".';
                            promptParts.returnFormat = 'A clear, concise, and accurate explanation, using appropriate scientific terminology while also being accessible to the specified audience. Use structured formats like bullet points or numbered lists where beneficial, incorporating 2025 scientific advancements.';
                            promptParts.warnings = 'Ensure scientific accuracy. Do not oversimplify to the point of being incorrect. Cite hypothetical sources or methodologies if providing a research plan. Consider 2025 scientific advancements and discoveries.';
                            promptParts.contextDump = '**Character:**\nAct as a seasoned scientist and science communicator, capable of breaking down complex concepts for various audiences.\n**Instructions:**\n- Start with a clear definition of the concept.\n- Explain the underlying principles and mechanisms.\n- Provide examples or analogies to aid understanding.\n- Discuss practical applications or implications.\n- Maintain a neutral, objective tone.\n- Incorporate 2025 scientific advancements and discoveries where relevant.\n**Audience:**\n- Assume the explanation is for a curious learner with a basic scientific background.';
                            promptParts.outputExample = 'An accurate yet accessible explanation of the scientific concept, with examples and applications, updated for 2025.';
                            break;
                        default:
                            promptParts.goal = 'Provide a comprehensive and expert-level response to: "' + idea + '".';
                            promptParts.returnFormat = 'A detailed, well-structured, and accurate response presented in clear, concise paragraphs or bullet points, suitable for professional use, incorporating 2025 knowledge and best practices.';
                            promptParts.warnings = 'Ensure accuracy and prevent factual errors. Do not provide information outside the scope of the request. Consider 2025 advancements and best practices.';
                            promptParts.contextDump = '**Character:**\nAssume the role of a highly knowledgeable and versatile expert, capable of breaking down complex requests into actionable insights.\n**Instructions:**\n- Break down the request into its key components.\n- Provide a comprehensive and actionable response.\n- Use clear and professional language.\n- Anticipate common follow-up questions and address them briefly.\n- Incorporate 2025 knowledge, trends, and best practices where relevant.';
                            promptParts.outputExample = 'A thorough and expert response that addresses all aspects of the request, updated for 2025.';
                            break;
                    }
                    
                    // Add 2025 context to all prompts
                    const standardPrompt = '---\n🎯 Goal\n' + promptParts.goal + '\n---\n📦 Return Format\n' + promptParts.returnFormat + '\n---\n⚠️ Warnings\n' + promptParts.warnings + '\n---\n🗂 Context Dump\n' + promptParts.contextDump + '\n---\n📅 2025 Context\n' + yearContext + '\n';
                    
                    this.state.parsedPromptData = {
                        standardFormat: standardPrompt,
                        promptParts: promptParts
                    };
                    
                    // Update prompts generated counter
                    const currentCount = parseInt(localStorage.getItem('promptOSPromptsGenerated') || '0');
                    localStorage.setItem('promptOSPromptsGenerated', (currentCount + 1).toString());
                    this.updateLiveActivity();
                    
                    // Hide loading indicator
                    if (this.elements.loadingIndicator) {
                        this.elements.loadingIndicator.classList.remove('loading-active');
                    }
                    
                    if (this.elements.conversionButtons) {
                        this.elements.conversionButtons.style.display = 'flex';
                    }
                    this.updateOutput(standardPrompt, false);
                } catch (error) {
                    console.error("Error during prompt generation:", error);
                    this.showNotification("An error occurred. Please check the console for details.");
                    if (this.elements.loadingIndicator) {
                        this.elements.loadingIndicator.classList.remove('loading-active');
                    }
                }
            },
            
            convertToJson() {
                if (!this.state.parsedPromptData) return;
                
                const promptParts = this.state.parsedPromptData.promptParts;
                const jsonPrompt = {
                    "request": {
                        "task_description": promptParts.goal,
                        "input_schema": {
                            "type": "object",
                            "properties": {
                                "idea": {
                                    "type": "string",
                                    "description": "The user's idea or request"
                                }
                            },
                            "required": ["idea"]
                        },
                        "output_schema": {
                            "type": "object",
                            "properties": {
                                "response": {
                                    "type": "string",
                                    "description": "The AI's response to user's idea"
                                }
                            },
                            "required": ["response"]
                        }
                    },
                    "example_1": {
                        "input": {
                            "idea": promptParts.inputExample
                        },
                        "output": {
                            "response": promptParts.outputExample
                        }
                    },
                    "constraints_and_notes": [
                        promptParts.warnings,
                        "Follow the return format: " + promptParts.returnFormat,
                        "Context: " + promptParts.contextDump,
                        "Generated in 2025 with the latest AI capabilities"
                    ]
                };
                
                const jsonString = JSON.stringify(jsonPrompt, null, 2);
                this.updateOutput(jsonString, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
                if (this.elements.conversionButtons) {
                    this.elements.conversionButtons.style.display = 'none';
                }
            },
            
            convertToSql() {
                if (!this.state.parsedPromptData) return;
                
                const promptParts = this.state.parsedPromptData.promptParts;
                const sqlPrompt = `-- SQL-style Prompt for AI (2025 Enhanced)
SELECT 
    task_description AS goal,
    return_format AS output_format,
    warnings AS constraints,
    context_dump AS context,
    '2025 Enhanced' AS generation_version
FROM 
    prompt_requirements
WHERE 
    task_id = '${promptParts.inputExample.replace(/'/g, "''")}'
ORDER BY 
    priority DESC;
-- Example Query:
SELECT 
    response 
FROM 
    ai_output 
WHERE 
    input_idea = '${promptParts.inputExample.replace(/'/g, "''")}'
LIMIT 1;`;
                
                this.updateOutput(sqlPrompt, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
                if (this.elements.conversionButtons) {
                    this.elements.conversionButtons.style.display = 'none';
                }
            },
            
            convertToYaml() {
                if (!this.state.parsedPromptData) return;
                
                const promptParts = this.state.parsedPromptData.promptParts;
                const yamlPrompt = `# YAML-style Prompt for AI (2025 Enhanced)
task:
  description: "${promptParts.goal}"
  format: "${promptParts.returnFormat}"
  year: "2025"
  
constraints:
  - "${promptParts.warnings}"
  
context:
  - "${promptParts.contextDump}"
  
examples:
  input: "${promptParts.inputExample}"
  expected_output: "${promptParts.outputExample}"
  
metadata:
  created_by: PromptOS
  version: "2025.1"
  generation_method: "AI-enhanced"`;
                
                this.updateOutput(yamlPrompt, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
                if (this.elements.conversionButtons) {
                    this.elements.conversionButtons.style.display = 'none';
                }
            },
            
            convertToXml() {
                if (!this.state.parsedPromptData) return;
                
                const promptParts = this.state.parsedPromptData.promptParts;
                const xmlPrompt = `<?xml version="1.0" encoding="UTF-8"?>
<prompt>
    <task>
        <description>${promptParts.goal}</description>
        <format>${promptParts.returnFormat}</format>
        <year>2025</year>
    </task>
    <constraints>
        <warning>${promptParts.warnings}</warning>
    </constraints>
    <context>
        <dump>${promptParts.contextDump}</dump>
    </context>
    <examples>
        <input>${promptParts.inputExample}</input>
        <expected_output>${promptParts.outputExample}</expected_output>
    </examples>
    <metadata>
        <created_by>PromptOS</created_by>
        <version>2025.1</version>
    </metadata>
</prompt>`;
                
                this.updateOutput(xmlPrompt, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
                if (this.elements.conversionButtons) {
                    this.elements.conversionButtons.style.display = 'none';
                }
            },
            
            convertToGraph() {
                if (!this.state.parsedPromptData) return;
                
                const promptParts = this.state.parsedPromptData.promptParts;
                const graphPrompt = `# Graph-based Prompt for AI (2025 Enhanced)
# Nodes represent concepts, edges represent relationships
# This format helps AI understand complex relationships between ideas
graph TD
    A["${promptParts.goal}"] --> B["${promptParts.returnFormat}"]
    A --> C["${promptParts.warnings}"]
    A --> D["${promptParts.contextDump}"]
    A --> E["2025 Context"]
    B --> F["Output"]
    C --> F
    D --> F
    E --> F
    F --> G["${promptParts.outputExample}"]
    
    classDef primaryNode fill:#9b59b6,stroke:#333,stroke-width:2px,color:#fff
    classDef secondaryNode fill:#8e44ad,stroke:#333,stroke-width:1px,color:#fff
    classDef outputNode fill:#3498db,stroke:#333,stroke-width:2px,color:#fff
    classDef yearNode fill:#e74c3c,stroke:#333,stroke-width:2px,color:#fff
    
    class A primaryNode
    class B,C,D secondaryNode
    class E yearNode
    class F,G outputNode
# Graph Analysis Instructions:
# 1. Start from the main goal node and follow relationships
# 2. Consider how constraints and context influence the output
# 3. Use graph structure to organize your response logically
# 4. Incorporate 2025 context and advancements`;
                
                this.updateOutput(graphPrompt, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
                if (this.elements.conversionButtons) {
                    this.elements.conversionButtons.style.display = 'none';
                }
            },
            
            convertToMarkdown() {
                if (!this.state.parsedPromptData) return;
                
                const promptParts = this.state.parsedPromptData.promptParts;
                const markdownPrompt = `# ${promptParts.goal}

## Return Format
 ${promptParts.returnFormat}

## Warnings
 ${promptParts.warnings}

## Context
 ${promptParts.contextDump}

## 2025 Context
As of 2025, consider the latest advancements in AI technology and best practices for prompt engineering.

## Example
**Input:** ${promptParts.inputExample}
**Expected Output:** ${promptParts.outputExample}`;
                
                this.updateOutput(markdownPrompt, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
                if (this.elements.conversionButtons) {
                    this.elements.conversionButtons.style.display = 'none';
                }
            },
            
            convertToCsv() {
                if (!this.state.parsedPromptData) return;
                
                const promptParts = this.state.parsedPromptData.promptParts;
                const csvPrompt = `"Section","Content"
"Goal","${promptParts.goal.replace(/"/g, '""')}"
"Return Format","${promptParts.returnFormat.replace(/"/g, '""')}"
"Warnings","${promptParts.warnings.replace(/"/g, '""')}"
"Context","${promptParts.contextDump.replace(/"/g, '""')}"
"2025 Context","As of 2025, consider the latest advancements in AI technology and best practices for prompt engineering."
"Example Input","${promptParts.inputExample.replace(/"/g, '""')}"
"Example Output","${promptParts.outputExample.replace(/"/g, '""')}"`;
                
                this.updateOutput(csvPrompt, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
                if (this.elements.conversionButtons) {
                    this.elements.conversionButtons.style.display = 'none';
                }
            },
            
            convertToToml() {
                if (!this.state.parsedPromptData) return;
                
                const promptParts = this.state.parsedPromptData.promptParts;
                const tomlPrompt = `[task]
description = "${promptParts.goal.replace(/"/g, '\\"')}"
format = "${promptParts.returnFormat.replace(/"/g, '\\"')}"
year = "2025"

[constraints]
warning = "${promptParts.warnings.replace(/"/g, '\\"')}"

[context]
dump = "${promptParts.contextDump.replace(/"/g, '\\"')}"

[year_2025]
context = "As of 2025, consider the latest advancements in AI technology and best practices for prompt engineering."

[examples]
input = "${promptParts.inputExample.replace(/"/g, '\\"')}"
output = "${promptParts.outputExample.replace(/"/g, '\\"')}"

[metadata]
created_by = "PromptOS"
version = "2025.1"
generation_method = "AI-enhanced"`;
                
                this.updateOutput(tomlPrompt, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
                if (this.elements.conversionButtons) {
                    this.elements.conversionButtons.style.display = 'none';
                }
            },
            
            convertToContextual() {
                if (!this.state.parsedPromptData) return;
                const data = this.state.parsedPromptData;
                const contextualPrompt = 'You are an expert AI. Your task is to act as instructed in the context and fulfill the following goal: "' + data.promptParts.goal + '".\n\nReferencing the detailed structure below, generate a complete and high-quality response.\n\n' + data.standardFormat + '\n\n**2025 Enhancement:** As of 2025, consider the latest advancements in AI technology and best practices for prompt engineering.';
                this.updateOutput(contextualPrompt, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
                if (this.elements.conversionButtons) {
                    this.elements.conversionButtons.style.display = 'none';
                }
            },
            
            updateOutput(content, isJson = false, isSql = false, isYaml = false, isXml = false, isGraph = false, isMarkdown = false, isCsv = false, isToml = false) {
                this.state.finalPrompt = content;
                this.state.isJsonFormat = isJson;
                this.state.isSqlFormat = isSql;
                this.state.isYamlFormat = isYaml;
                this.state.isXmlFormat = isXml;
                this.state.isGraphFormat = isGraph;
                this.state.isMarkdownFormat = isMarkdown;
                this.state.isCsvFormat = isCsv;
                this.state.isTomlFormat = isToml;
                
                if (this.elements.output) {
                    if (isJson || isSql || isYaml || isXml || isGraph || isMarkdown || isCsv || isToml) {
                        this.elements.output.innerHTML = '<div class="json-output">' + content.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
                    } else {
                        const formattedContent = content
                            .replace(/---\n?/g, '<hr style="border: none; border-top: 1px dashed var(--panel-border); margin: 1rem 0;">')
                            .replace(/🎯 Goal/g, '<strong>🎯 Goal</strong>').replace(/📦 Return Format/g, '<strong>📦 Return Format</strong>')
                            .replace(/⚠️ Warnings/g, '<strong>⚠️ Warnings</strong>').replace(/🗂 Context Dump/g, '<strong>🗂 Context Dump</strong>')
                            .replace(/📅 2025 Context/g, '<strong>📅 2025 Context</strong>')
                            .replace(/\n/g, '<br/>');
                        this.elements.output.innerHTML = formattedContent;
                    }
                }
                
                // Calculate and display quality score
                const qualityScore = this.calculateQualityScore(content);
                if (this.elements.qualityScore) {
                    this.elements.qualityScore.style.display = 'flex';
                }
                if (this.elements.scoreFill) {
                    this.elements.scoreFill.style.width = qualityScore + '%';
                }
                if (this.elements.scoreText) {
                    this.elements.scoreText.textContent = qualityScore + '%';
                }
                
                if (encoding && tokenCountElement) {
                    try {
                        const tokens = encoding.encode(content).length;
                        tokenCountElement.textContent = tokens;
                        if (tokenDisplayElement) {
                            tokenDisplayElement.classList.add('visible');
                        }
                    } catch (e) {
                         console.warn("Token counting failed for current content:", e);
                         if(tokenDisplayElement) tokenDisplayElement.classList.remove('visible');
                    }
                }
                
                this.saveHistory(content, isJson, isSql, isYaml, isXml, isGraph, isMarkdown, isCsv, isToml);
            },
            
            copyPrompt() { 
                if (!this.state.finalPrompt) {
                    this.showNotification("Nothing to copy!");
                    return;
                }
                
                let plainTextPrompt = this.state.finalPrompt;
                
                if (this.state.isJsonFormat || this.state.isSqlFormat || this.state.isYamlFormat || this.state.isXmlFormat || this.state.isGraphFormat || this.state.isMarkdownFormat || this.state.isCsvFormat || this.state.isTomlFormat) {
                    plainTextPrompt = this.state.finalPrompt.replace(/^<div class="json-output">/, '').replace(/<\/div>$/, '');
                } else {
                    plainTextPrompt = this.state.finalPrompt
                        .replace(/<hr style="[^"]*"[^"]*">/g, '').replace(/🎯 Goal<br\/>/g, '🎯 Goal\n').replace(/📦 Return Format<br\/>/g, '📦 Return Format\n')
                        .replace(/⚠️ Warnings<br\/>/g, '⚠️ Warnings\n').replace(/🗂 Context Dump<br\/>/g, '🗂 Context Dump\n')
                        .replace(/📅 2025 Context<br\/>/g, '📅 2025 Context\n')
                        .replace(/<br\/>/g, '\n')
                        .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                        .replace(/<\/?[^>]+>/g, '')
                        .replace(/\n\n\n+/g, '\n\n')
                        .trim();
                }
                
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(plainTextPrompt).then(() => {
                        this.showNotification('Prompt copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy: ', err);
                        this.showNotification('Failed to copy prompt. Please try again.');
                    });
                } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = plainTextPrompt;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    this.showNotification('Prompt copied to clipboard!');
                }
            },
            
            showSearchModal() {
                if (!this.elements.templateModal) return;
                
                // FIXED: Clear and rebuild modal content to ensure it's visible
                this.elements.templateModal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <button class="icon-btn modal-back-btn" id="template-modal-back-btn" title="Back">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <h2 id="modal-title">Search Templates</h2>
                            <button class="icon-btn modal-close-btn" data-modal="template-modal">×</button>
                        </div>
                        <div class="modal-body" id="modal-body">
                            <input type="text" id="template-search-input" placeholder="Search templates..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--panel-border); background: var(--panel-bg); color: var(--text-color); margin-bottom: 1rem;">
                        </div>
                    </div>
                `;
                
                // Add event listeners for the new modal content
                const backBtn = document.getElementById('template-modal-back-btn');
                if (backBtn) {
                    backBtn.addEventListener('click', () => {
                        this.elements.templateModal.classList.remove('active');
                    });
                }
                
                const searchInput = document.getElementById('template-search-input');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        this.renderTemplates(e.target.value, false);
                    });
                    // Focus on the input
                    setTimeout(() => searchInput.focus(), 100);
                }
                
                const closeBtn = this.elements.templateModal.querySelector('.modal-close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        this.elements.templateModal.classList.remove('active');
                    });
                }
                
                this.renderTemplates('', false);
                this.elements.templateModal.classList.add('active');
            },
            
            showCategoryModal() {
                if (!this.elements.templateModal) return;
                
                this.elements.templateModal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <button class="icon-btn modal-back-btn" id="template-modal-back-btn" title="Back">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <h2 id="modal-title">Browse Categories</h2>
                            <button class="icon-btn modal-close-btn" data-modal="template-modal">×</button>
                        </div>
                        <div class="modal-body" id="modal-body"></div>
                    </div>
                `;
                
                // Add event listeners for the new modal content
                const backBtn = document.getElementById('template-modal-back-btn');
                if (backBtn) {
                    backBtn.addEventListener('click', () => {
                        this.elements.templateModal.classList.remove('active');
                    });
                }
                
                const closeBtn = this.elements.templateModal.querySelector('.modal-close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        this.elements.templateModal.classList.remove('active');
                    });
                }
                
                this.renderCategories();
                this.elements.templateModal.classList.add('active');
            },
            
            hideModal() { 
                if (this.elements.templateModal) {
                    this.elements.templateModal.classList.remove('active'); 
                }
            },
            
            showModal() { 
                if (this.elements.templateModal) {
                    this.elements.templateModal.classList.add('active'); 
                }
            },
            
            renderCategories() {
                const modalBody = document.getElementById('modal-body');
                if (!modalBody) return;
                
                modalBody.innerHTML = Object.keys(this.templateDB).map(cat => '<div class="category-item" data-category="' + cat + '">' + cat + '</div>').join('');
                
                modalBody.querySelectorAll('.category-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        this.renderTemplates(e.currentTarget.dataset.category, true);
                    });
                });
            },
            
            renderTemplates(filter, isCategory = false) {
                const modalBody = document.getElementById('modal-body');
                if (!modalBody) return;
                
                let html = '';
                const renderList = (category, templates) => {
                    html += '<div class="category-list"><div class="category-title">' + category + '</div>';
                    html += templates.map(t => '<div class="template-item" data-idea="' + (t.idea || '') + '">' + t.name + '</div>').join('');
                    html += '</div>';
                };
                
                if (isCategory) { 
                    renderList(filter, this.templateDB[filter]); 
                } else { 
                    for (const [category, templates] of Object.entries(this.templateDB)) { 
                        const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(filter.toLowerCase())); 
                        if (filteredTemplates.length > 0) { 
                            renderList(category, filteredTemplates); 
                        } 
                    } 
                }
                
                modalBody.innerHTML = html;
                this.addTemplateClickListeners(modalBody);
            },
            
            addTemplateClickListeners(container) {
                if (!container) return;
                
                container.querySelectorAll('.template-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const idea = e.currentTarget.dataset.idea;
                        if (idea && this.elements.canvas) {
                            this.elements.canvas.value = idea; 
                            this.hideModal(); 
                            this.generateFullPrompt(); 
                        }
                    });
                });
            },
            
            toggleHistoryPanel(show) {
                if (!this.elements.historyPanel) return;
                
                const panel = this.elements.historyPanel;
                if(show && !panel.querySelector('#history-list-container')) {
                    panel.innerHTML = `
                        <div class="modal-header" style="padding: 1rem; border-bottom: 1px solid var(--panel-border);">
                            <button class="icon-btn modal-back-btn" id="history-back-btn" title="Back">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <h2 style="flex-grow: 1; text-align: center;">History</h2>
                            <div style="width: 48px;"></div>
                        </div>
                        <div class="modal-body" id="history-list-container" style="flex-grow: 1; overflow-y: auto;"></div>
                        <div style="padding: 0.5rem; border-top: 1px solid var(--panel-border);">
                            <button id="clear-history-btn" class="conversion-btn" style="width: 100%; background-color: rgba(192, 57, 43, 0.3); color: #e74c3c;">Clear All History</button>
                        </div>
                    `;
                    
                    panel.querySelector('#history-back-btn').addEventListener('click', () => {
                        this.toggleHistoryPanel(false);
                    });
                    
                    panel.querySelector('#clear-history-btn').addEventListener('click', () => {
                        this.clearHistory();
                    });
                }
                
                if(show) this.renderHistory();
                panel.classList.toggle('active', show);
            },
            
            saveHistory(prompt, isJson = false, isSql = false, isYaml = false, isXml = false, isGraph = false, isMarkdown = false, isCsv = false, isToml = false) {
                if(this.state.history.length > 0 && this.state.history[0].prompt === prompt) return; 
                this.state.history.unshift({ 
                    id: Date.now(), 
                    prompt,
                    isJson,
                    isSql,
                    isYaml,
                    isXml,
                    isGraph,
                    isMarkdown,
                    isCsv,
                    isToml
                });
                if (this.state.history.length > 50) this.state.history.pop();
                localStorage.setItem('promptOSHistory', JSON.stringify(this.state.history));
                if (this.elements.historyPanel && this.elements.historyPanel.classList.contains('active')) {
                    this.renderHistory();
                }
            },
            
            loadHistory() {
                const saved = localStorage.getItem('promptOSHistory');
                if (saved) { 
                    this.state.history = JSON.parse(saved); 
                }
            },
            
            renderHistory() {
                const historyListContainer = this.elements.historyPanel.querySelector('#history-list-container');
                if (!historyListContainer) return;
                
                if(this.state.history.length === 0) {
                    historyListContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 1rem;">No history yet.</p>';
                    return;
                }
                
                historyListContainer.innerHTML = this.state.history.map(item => {
                     let shortPrompt;
                     let formatType = '';
                     
                     if (item.isJson) {
                         try {
                             const jsonPrompt = JSON.parse(item.prompt);
                             shortPrompt = jsonPrompt.request.task_description || "JSON Prompt";
                             formatType = '(JSON)';
                         } catch (e) {
                             shortPrompt = "JSON Prompt (parse error)";
                             formatType = '(JSON)';
                         }
                     } else if (item.isSql) {
                         shortPrompt = "SQL Prompt";
                         formatType = '(SQL)';
                     } else if (item.isYaml) {
                         shortPrompt = "YAML Prompt";
                         formatType = '(YAML)';
                     } else if (item.isXml) {
                         shortPrompt = "XML Prompt";
                         formatType = '(XML)';
                     } else if (item.isGraph) {
                         shortPrompt = "Graph Prompt";
                         formatType = '(Graph)';
                     } else if (item.isMarkdown) {
                         shortPrompt = "Markdown Prompt";
                         formatType = '(Markdown)';
                     } else if (item.isCsv) {
                         shortPrompt = "CSV Prompt";
                         formatType = '(CSV)';
                     } else if (item.isToml) {
                         shortPrompt = "TOML Prompt";
                         formatType = '(TOML)';
                     } else {
                         const goalMatch = item.prompt.match(/🎯 Goal\n([\s\S]*?)(?=\n---|$)/);
                         shortPrompt = goalMatch ? goalMatch[1].trim() : (item.prompt.substring(0,40) + '...');
                     }
                     
                     return '<div class="template-item" data-history-id="' + item.id + '">' + shortPrompt.substring(0, 40) + (shortPrompt.length > 40 ? '...' : '') + ' ' + formatType + '</div>';
                 }).join('');
                 
                 historyListContainer.querySelectorAll('.template-item').forEach(item => {
                     item.addEventListener('click', (e) => {
                         const historyId = Number(e.currentTarget.dataset.historyId);
                         const historyItem = this.state.history.find(h => h.id === historyId);
                         if (historyItem) {
                             this.updateOutput(historyItem.prompt, historyItem.isJson, historyItem.isSql, historyItem.isYaml, historyItem.isXml, historyItem.isGraph, historyItem.isMarkdown, historyItem.isCsv, historyItem.isToml);
                             this.state.parsedPromptData = { standardFormat: historyItem.prompt, promptParts: this.parsePrompt(historyItem.prompt) };
                             if (this.elements.conversionButtons) {
                                 this.elements.conversionButtons.style.display = 'flex';
                             }
                             this.toggleHistoryPanel(false);
                         }
                     });
                 });
            },
            
            parsePrompt(promptText) {
                const data = { goal: '', returnFormat: '', warnings: '', contextDump: '', fullText: promptText };
                const sections = promptText.split(/\n---\n/);
                sections.forEach(section => {
                    if (section.startsWith('🎯 Goal')) data.goal = section.replace('🎯 Goal\n', '').trim();
                    else if (section.startsWith('📦 Return Format')) data.returnFormat = section.replace('📦 Return Format\n', '').trim();
                    else if (section.startsWith('⚠️ Warnings')) data.warnings = section.replace('⚠️ Warnings\n', '').trim();
                    else if (section.startsWith('🗂 Context Dump')) data.contextDump = section.replace('🗂 Context Dump\n', '').trim();
                });
                return data;
            },
            
            clearHistory() {
                if(confirm("Are you sure you want to clear all prompt history? This cannot be undone.")) {
                    this.state.history = [];
                    localStorage.removeItem('promptOSHistory');
                    this.renderHistory();
                }
            },
            
            showNotification(message, type = 'success') {
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.textContent = message;
                notification.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--primary-accent);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    z-index: 10000;
                    transition: all 0.3s ease;
                `;
                
                if (type === 'success') {
                    notification.style.background = 'var(--success-color)';
                } else if (type === 'error') {
                    notification.style.background = 'var(--error-color)';
                } else if (type === 'warning') {
                    notification.style.background = 'var(--warning-color)';
                }
                
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.style.opacity = '0';
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }, 3000);
            },
            
            showShareModal() {
                if (!this.elements.shareModal) return;
                
                const shareUrl = 'https://promptos-new-dls8.vercel.app/';
                if (this.elements.shareLink) {
                    this.elements.shareLink.value = shareUrl;
                }
                this.elements.shareModal.classList.add('active');
            },
            
            hideShareModal() {
                if (this.elements.shareModal) {
                    this.elements.shareModal.classList.remove('active');
                }
            },
            
            sharePrompt(platform) {
                const shareUrl = 'https://promptos-new-dls8.vercel.app/';
                const shareText = "🚀 Discover PromptOS: The Ultimate AI Prompt Generator!\n\nTransform your ideas into expert-level prompts for GPT-4, Claude, Midjourney, and more. Try it now and supercharge your AI interactions in 2025.";
                
                let url;
                switch(platform) {
                    case 'facebook':
                        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent("Discover PromptOS: The Ultimate AI Prompt Generator for GPT-4, Claude & Midjourney | 2025")}`;
                        break;
                    case 'twitter':
                        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("🚀 Discover PromptOS: The Ultimate AI Prompt Generator! Transform ideas into expert prompts for GPT-4, Claude, Midjourney. Try it now in 2025!")}`;
                        break;
                    case 'whatsapp':
                        url = `https://wa.me/?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;
                        break;
                    case 'linkedin':
                        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent("PromptOS: The Ultimate AI Prompt Generator")}&summary=${encodeURIComponent("Transform your ideas into expert-level prompts with our intelligent AI engine for GPT-4, Claude, Midjourney, and more.")}`;
                        break;
                    case 'copy':
                        if (navigator.clipboard) {
                            navigator.clipboard.writeText(shareText + "\n\n" + shareUrl).then(() => {
                                this.showNotification('Promotional message copied to clipboard!');
                            }).catch(err => {
                                console.error('Failed to copy: ', err);
                                this.showNotification('Failed to copy. Please try again.');
                            });
                        } else {
                            const textArea = document.createElement('textarea');
                            textArea.value = shareText + "\n\n" + shareUrl;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            
                            this.showNotification('Promotional message copied to clipboard!');
                        }
                        return;
                    default:
                        return;
                }
                
                const width = 600;
                const height = 400;
                const left = (window.innerWidth - width) / 2;
                const top = (window.innerHeight - height) / 2;
                
                window.open(url, 'shareWindow', `width=${width},height=${height},left=${left},top=${top}`);
            },
            
            isElementInViewport(el) {
                const rect = el.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            }
        };
        
        PromptOS.init();
        
        // Helper function to check if element is in viewport
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
        
        // Utility functions
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
        
    } catch (err) {
        console.error("Critical error on initialization:", err);
        document.body.innerHTML = '<div style="color: white; text-align: center; padding: 50px;"><h1>Oops!</h1><p>Something went wrong while loading the application. Please try refreshing the page. If the problem persists, check the browser console for errors.</p></div>';
    }
});