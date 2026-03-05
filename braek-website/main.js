document.addEventListener('DOMContentLoaded', () => {

    // 0. Hero Title: Jumpy Block Animation (Flawless DOM Splitting)
    // We split the text nodes character by character for the JumpyText FX without destroying <br> or <strong> tags.
    // Raw spaces remain text nodes so the browser handles word wrapping naturally.
    const jumpyTitles = document.querySelectorAll('.jumpy-trigger');
    jumpyTitles.forEach(title => {
        let globalLetterIndex = 0;

        function splitNode(node, container) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                // We split by every character, preserving raw spaces for line wrapping
                const chars = text.split('');
                chars.forEach(char => {
                    if (/\s/.test(char)) {
                        // Inherit raw space so kerning and native wrapping work
                        container.appendChild(document.createTextNode(char));
                    } else {
                        const span = document.createElement('span');
                        span.className = 'char-anim';
                        span.textContent = char;
                        span.style.animationDelay = `${globalLetterIndex * 0.04}s`;
                        container.appendChild(span);
                        globalLetterIndex++;
                    }
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR') {
                    container.appendChild(document.createElement('br'));
                } else {
                    const clone = node.cloneNode(false);
                    container.appendChild(clone);
                    Array.from(node.childNodes).forEach(child => splitNode(child, clone));
                }
            }
        }

        const originalNodes = Array.from(title.childNodes);
        title.innerHTML = '';
        originalNodes.forEach(child => splitNode(child, title));
    });


    // 1. Initial Load Animations
    // Smoothly reveal navbar and hero elements on page load
    setTimeout(() => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.style.opacity = '1';
            // Preserve the horizontal centering from CSS while resetting any vertical offset
            navbar.style.transform = 'translate(-50%, 0)';
        }
    }, 100);

    // 2. Intersection Observer for 'Framer-like' Scroll Animations
    // Now configured to both ENTER and EXIT for re-triggering animations
    const observerOptions = {
        root: null,
        rootMargin: '-50px 0px -50px 0px', // Trigger slightly inside the viewport
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the 'active' class to trigger CSS transition entering screen
                entry.target.classList.add('active');
            } else {
                // Remove the 'active' class to reset transition when leaving screen
                // This allows the element to animate again when scrolled back
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-up, .jumpy-trigger, .reveal-blur');
    revealElements.forEach(el => {
        observer.observe(el);
    });

    // 3. Navbar scroll effect (add blur/bg when scrolling down)
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 4. Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Mouse tracking glow cards
    const glowCards = document.querySelectorAll('.glow-mouse-card');
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position relative to card boundaries
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 6. GSAP ScrollTrigger - character reveal for .gsap-reveal-title
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const gsapTitles = document.querySelectorAll('.gsap-reveal-title');

        gsapTitles.forEach(el => {
            // Capture computed styles BEFORE clearing the element
            const computed = window.getComputedStyle(el);
            const styles = {
                fontSize: computed.fontSize,
                fontFamily: computed.fontFamily,
                fontWeight: computed.fontWeight,
                lineHeight: computed.lineHeight,
                letterSpacing: computed.letterSpacing,
                color: computed.color,
                textTransform: computed.textTransform,
                display: 'inline-block',
            };

            // Walk child nodes BEFORE clearing innerHTML so we can honour <br> tags
            const originalNodes = Array.from(el.childNodes);
            el.innerHTML = '';

            const allCharSpans = [];

            // Helper: split a text segment into word-wrapped char spans
            function appendWords(text, container) {
                const words = text.split(' ');
                words.forEach((word, wordIndex) => {
                    if (word.length === 0) return;

                    // Word wrapper prevents mid-word line breaks
                    const wordWrap = document.createElement('span');
                    wordWrap.style.display = 'inline-block';
                    wordWrap.style.whiteSpace = 'nowrap';

                    [...word].forEach(char => {
                        const span = document.createElement('span');
                        Object.assign(span.style, styles);
                        span.style.opacity = '0';
                        span.textContent = char;
                        wordWrap.appendChild(span);
                        allCharSpans.push(span);
                    });

                    container.appendChild(wordWrap);

                    // Space between words (outside nowrap wrapper = natural break point)
                    if (wordIndex < words.length - 1) {
                        const space = document.createElement('span');
                        Object.assign(space.style, styles);
                        space.style.opacity = '1';
                        space.innerHTML = '&nbsp;';
                        container.appendChild(space);
                    }
                });
            }

            originalNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    appendWords(node.textContent, el);
                } else if (node.nodeName === 'BR') {
                    // Preserve the line break exactly as written in HTML
                    el.appendChild(document.createElement('br'));
                }
            });

            const chars = allCharSpans;

            gsap.fromTo(chars,
                { opacity: 0 },
                {
                    opacity: 1,
                    ease: 'none',
                    stagger: 0.03,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 75%',
                        end: 'bottom 40%',
                        scrub: true,
                        once: false,
                    }
                }
            );
        });
    }

    // 7. Dynamic Project Engine (API-powered)
    const PROJECTS_API = 'api/projects/get.php';

    async function fetchProjects() {
        try {
            const response = await fetch(PROJECTS_API);
            if (!response.ok) throw new Error('API error');
            return await response.json();
        } catch (error) {
            console.error('Error loading projects:', error);
            return { projects: [] };
        }
    }

    function createProjectCard(project, isLarge = false) {
        const categorySlug = (project.category || '').toLowerCase();
        const link = project.pageLink || `project-details?id=${project.id}`;

        if (isLarge) {
            return `
                <div class="project-card large reveal-up" data-category="${categorySlug}">
                    <img src="${project.heroImage}" alt="${project.title}" class="project-img">
                    <div class="project-overlay"></div>
                    <div class="project-content">
                        <div class="project-top">
                            <span class="project-badge">${project.category}</span>
                            <button class="project-arrow-btn" aria-label="Ver projeto" onclick="window.location.href='${link}'">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            </button>
                        </div>
                        <div class="project-bottom">
                            <div class="project-info">
                                <h3>${project.title}</h3>
                                <p>${project.subtitle}</p>
                            </div>
                            <span class="project-year">${project.year}</span>
                        </div>
                    </div>
                    <div class="project-hover-bar">
                        <p>${project.about || ''}</p>
                        <a href="${link}">Ver Projeto ↗</a>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="project-card medium reveal-up" data-category="${categorySlug}">
                    <img src="${project.heroImage}" alt="${project.title}" class="project-img">
                    <div class="project-overlay"></div>
                    <div class="project-content">
                        <div class="project-top">
                            <span class="project-badge">${project.category}</span>
                            <button class="project-arrow-btn" aria-label="Ver projeto" onclick="window.location.href='${link}'">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            </button>
                        </div>
                        <div class="project-bottom">
                            <div class="project-info">
                                <h3>${project.title}</h3>
                                <p>${project.subtitle}</p>
                            </div>
                            <span class="project-year">${project.year}</span>
                        </div>
                    </div>
                    <div class="project-hover-bar">
                        <p>${project.about || ''}</p>
                        <a href="${link}">Ver Projeto ↗</a>
                    </div>
                </div>
            `;
        }
    }

    async function initProjectEngine() {
        const data = await fetchProjects();
        const projects = data.projects || [];

        // ─── Home Page: Featured Projects ────────────────────────────
        const homeGrid = document.getElementById('home-projects-container');
        if (homeGrid && projects.length > 0) {
            const featured = projects.filter(p => p.featured).slice(0, 3);
            const display = featured.length > 0 ? featured : projects.slice(0, 3);

            if (display.length > 0) {
                let cardsHTML = '';
                cardsHTML += createProjectCard(display[0], true);

                if (display.length > 1) {
                    cardsHTML += '<div class="projects-row">';
                    for (let i = 1; i < display.length; i++) {
                        cardsHTML += createProjectCard(display[i], false);
                    }
                    cardsHTML += '</div>';
                }

                homeGrid.innerHTML = cardsHTML;
            }
        }

        // ─── Portfolio Page: Dynamic Cards + Filters ────────────────────────
        const portfolioGrid = document.getElementById('portfolio-projects-grid');
        const portfolioLoading = document.getElementById('portfolio-loading');
        const filterControls = document.getElementById('portfolio-filter-controls');
        const countDisplay = document.getElementById('count-value');

        if (portfolioGrid) {
            // 2. Build unique filter buttons from categories API (ALWAYS DO THIS, EVEN IF 0 PROJECTS)
            if (filterControls) {
                try {
                    const catRes = await fetch('api/categories/get.php');
                    const catData = await catRes.json();
                    if (catData.categories) {
                        catData.categories.forEach(cat => {
                            const btn = document.createElement('button');
                            btn.className = 'filter-btn';
                            btn.setAttribute('data-filter', cat.name.toLowerCase());
                            // If category is empty, we still show the button so the UX doesn't completely break
                            btn.textContent = cat.name;
                            filterControls.appendChild(btn);
                        });
                    }
                } catch (e) {
                    console.error('Failed to load categories', e);
                }
            }

            if (projects.length === 0) {
                if (portfolioLoading) portfolioLoading.textContent = 'Nenhum projeto encontrado.';
            } else {
                // 1. Build cards HTML
                // First project = large, remaining paired into projects-row (2-col grid)
                let cardsHTML = '';
                cardsHTML += createProjectCard(projects[0], true);

                let i = 1;
                while (i < projects.length) {
                    const a = projects[i];
                    const b = projects[i + 1];
                    if (b) {
                        cardsHTML += `<div class="projects-row">${createProjectCard(a, false)}${createProjectCard(b, false)}</div>`;
                        i += 2;
                    } else {
                        cardsHTML += createProjectCard(a, false);
                        i += 1;
                    }
                }

                portfolioGrid.innerHTML = cardsHTML;
                portfolioGrid.style.display = '';
                if (portfolioLoading) portfolioLoading.style.display = 'none';

                // 3. Set initial count
                if (countDisplay) countDisplay.textContent = projects.length;

                // 4. Wire up filters
                initDynamicFilters(projects);
                filtersInitialized = true;

                // 5. Re-observe newly created reveal elements
                const allRevealElements = document.querySelectorAll('.reveal-up, .jumpy-trigger');
                allRevealElements.forEach(el => observer.observe(el));
            }
        }
    }

    // ─── Handle Project Details Template ────────────────────────────────
    if (window.location.pathname.includes('project-details.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        const project = projects.find(p => p.id === projectId);
        if (project) {
            updateProjectDetailsUI(project);
        }
    }
}

function updateProjectDetailsUI(project) {
        // Hero Section
        const heroImg = document.querySelector('.pd-hero-media img');
        if (heroImg) heroImg.src = project.heroImage;

        const badge = document.querySelector('.pd-hero-content .project-badge');
        if (badge) badge.textContent = project.category;

        const h1 = document.querySelector('.pd-hero-content h1');
        if (h1) h1.textContent = project.title;

        const p = document.querySelector('.pd-hero-content p');
        if (p) p.textContent = project.subtitle;

        // Info Items
        const infoValues = document.querySelectorAll('.pd-sidebar-card .pd-info-value');
        if (infoValues.length >= 3) {
            infoValues[0].textContent = project.role;
            infoValues[1].textContent = project.client;
            infoValues[2].textContent = project.year;
        }

        // About & Challenge
        const descSections = document.querySelectorAll('.pd-content .pd-section');
        descSections.forEach(section => {
            const h2 = section.querySelector('h2');
            const p = section.querySelector('p');
            if (h2 && p) {
                if (h2.textContent.includes('OVERVIEW') || h2.textContent.includes('Sobre')) {
                    p.innerHTML = project.about;
                } else if (h2.textContent.includes('Desafio')) {
                    p.innerHTML = project.challenge;
                }
            }
        });

        // Gallery
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid) {
            galleryGrid.innerHTML = project.gallery.map(img => `
                <div class="gallery-item reveal-up">
                    <img src="${img}" alt="Gallery Image">
                </div>
            `).join('');
        }
    }

function initDynamicFilters(projects) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const countDisplay = document.getElementById('count-value');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterValue = btn.getAttribute('data-filter');

                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Support both .projects-grid (portfolio page) and .portfolio-grid-inner (legacy)
                const projectCards = document.querySelectorAll('.projects-grid .project-card, .portfolio-grid-inner .project-card');

                let count = 0;
                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        card.style.display = 'block';
                        card.classList.remove('filtered-out');
                        count++;
                    } else {
                        card.style.display = 'none';
                        card.classList.add('filtered-out');
                    }
                });

                if (countDisplay) countDisplay.textContent = count;
                if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            });
        });
    }

// Static filter init: only runs if portfolio is NOT dynamically loaded via JSON
// (prevents double-init when initProjectEngine also calls initDynamicFilters)
let filtersInitialized = false;
const staticFilterBtns = document.querySelectorAll('.filter-btn');
if (staticFilterBtns.length > 0 && !filtersInitialized) {
    initDynamicFilters([]);
}

initProjectEngine();

// ─── Contact Form (Leads API) ──────────────────────────────────
const leadForm = document.getElementById('lead-form');
if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('lead-submit-btn');
        const status = document.getElementById('lead-status');
        const originalText = btn.textContent;

        btn.disabled = true;
        btn.textContent = 'Enviando...';
        status.style.display = 'none';

        const payload = {
            name: document.getElementById('lead-name').value,
            email: document.getElementById('lead-email').value,
            phone: document.getElementById('lead-phone').value,
            message: `[Assunto: ${document.getElementById('lead-subject').value}] \n\n${document.getElementById('lead-message').value}`
        };

        try {
            const res = await fetch('api/leads/create.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                status.style.display = 'block';
                status.style.color = '#10b981'; // Tailwind emerald-500
                status.textContent = 'Mensagem enviada com sucesso! Entraremos em contato.';
                leadForm.reset();
            } else {
                status.style.display = 'block';
                status.style.color = '#ef4444'; // Tailwind red-500
                status.textContent = data.error || 'Erro ao enviar. Tente novamente.';
            }
        } catch (error) {
            status.style.display = 'block';
            status.style.color = '#ef4444';
            status.textContent = 'Ocorreu um erro de rede.';
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
}



// ─── Testimonials API ──────────────────────────────────────
async function initTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    try {
        const res = await fetch('api/testimonials/get.php');
        const data = await res.json();
        const tests = data.testimonials || [];

        if (tests.length === 0) return;

        const col1 = tests.filter(t => parseInt(t.column_id) === 1);
        const col2 = tests.filter(t => parseInt(t.column_id) !== 1);

        // If everything is in one column, auto-distribute
        if (col1.length > 0 && col2.length === 0) {
            while (col1.length > tests.length / 2) {
                col2.push(col1.pop());
            }
        } else if (col2.length > 0 && col1.length === 0) {
            while (col2.length > tests.length / 2) {
                col1.push(col2.pop());
            }
        }

        // To ensure the marquee works correctly, it needs enough items to fill the screen width.
        // If there's only 1 or 2 items, we must clone them inside the array to make the tick loop seamless.
        const minItems = 5;
        while (col1.length > 0 && col1.length < minItems) col1.push(...col1.slice(0, minItems - col1.length));
        while (col2.length > 0 && col2.length < minItems) col2.push(...col2.slice(0, minItems - col2.length));

        const buildCard = (t) => `
                <div class="testimonial-card glow-mouse-card">
                    <div class="tc-top">
                        <div class="tc-author">
                            <div class="author-img" style="border-radius:50%; width:48px; height:48px; background:var(--accent-red); display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; overflow:hidden;">
                                ${t.avatar ? `<img src="${t.avatar}" style="width:100%; height:100%; object-fit:cover;">` : t.name.charAt(0).toUpperCase()}
                            </div>
                            <div class="tc-info">
                                <h4>${t.name}</h4>
                                <span>${t.role}</span>
                            </div>
                        </div>
                        <div class="tc-logo">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 10H8V14H4V10ZM10 10H14V14H10V10ZM16 10H20V14H16V10Z" />
                                <path d="M4 6H8V18H4V6ZM16 6H20V18H16V6Z" opacity="0.5" />
                            </svg>
                        </div>
                    </div>
                    <div class="tc-quote-box">
                        <p>"${t.message}"</p>
                    </div>
                </div>
            `;

        let html = '';

        // Row 1
        if (col1.length > 0) {
            const cardsHtml = col1.map(buildCard).join('');
            html += `
                    <div class="ticker-wrapper mt-5 reveal-up">
                        <div class="ticker">${cardsHtml}</div>
                        <div class="ticker" aria-hidden="true">${cardsHtml}</div>
                    </div>
                `;
        }

        // Row 2 (Reverse)
        if (col2.length > 0) {
            const cardsHtml = col2.map(buildCard).join('');
            html += `
                    <div class="ticker-wrapper reverse mt-5 reveal-up" style="transition-delay: 0.1s;">
                        <div class="ticker">${cardsHtml}</div>
                        <div class="ticker" aria-hidden="true">${cardsHtml}</div>
                    </div>
                `;
        }

        container.innerHTML = html;

        // Re-observe new reveal elements
        const newReveals = container.querySelectorAll('.reveal-up');
        newReveals.forEach(el => {
            if (typeof observer !== 'undefined') observer.observe(el);
        });

        // Attach glow mouse effect logic to the new cards
        setTimeout(() => {
            document.querySelectorAll('.glow-mouse-card').forEach(card => {
                card.addEventListener('mousemove', e => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    card.style.setProperty('--mouse-x', x + 'px');
                    card.style.setProperty('--mouse-y', y + 'px');
                });
            });
        }, 100);

    } catch (e) {
        console.error('Failed to load testimonials:', e);
    }
}

// Initialize fetching dynamic testimonials
initTestimonials();

});


// ─── Global Settings (Social Links & WhatsApp) ─────────────
async function applyGlobalSettings() {
    try {
        const res = await fetch('api/settings/get.php');
        const data = await res.json();
        if (!data.success || !data.settings) return;

        const s = data.settings;

        // Update WhatsApp Links
        if (s.whatsapp) {
            // Include both cta-whatsapp (footer) and btn-whatsapp (navbar)
            const waLinks = document.querySelectorAll('.cta-whatsapp, .btn-whatsapp');
            waLinks.forEach(link => {
                link.href = s.whatsapp;
                link.target = "_blank";
            });

            // Also update the hero button or any other general #contato link that has specific text
            const contactBtns = document.querySelectorAll('a[href="#contato"]');
            contactBtns.forEach(btn => {
                const text = btn.textContent.toLowerCase();
                if (text.includes('orçamento') || text.includes('whatsapp') || text.includes('fale conosco') || text.includes('contato')) {
                    btn.href = s.whatsapp;
                    btn.target = "_blank";
                }
            });
        }

        // Update Instagram Links
        if (s.instagram) {
            const igLink = document.getElementById('social-instagram');
            if (igLink) {
                igLink.href = s.instagram;
                igLink.target = "_blank";
            }
        }

        // Update LinkedIn Links
        if (s.linkedin) {
            const inLink = document.getElementById('social-linkedin');
            if (inLink) {
                inLink.href = s.linkedin;
                inLink.target = "_blank";
            }
        }

    } catch (e) {
        console.error('Failed to apply global settings:', e);
    }
}

// Make sure it runs fully
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGlobalSettings);
} else {
    applyGlobalSettings();
}



// ─── Visitor Tracking ──────────────────────────────────────────
async function trackVisit() {
    try {
        // Only track once per session
        if (!sessionStorage.getItem('braek_visited')) {
            const res = await fetch('api/track/visit.php', { method: 'POST' });
            if (res.ok) {
                sessionStorage.setItem('braek_visited', 'true');
            }
        }
    } catch (e) {
        // Silent fail for tracking
    }
}
trackVisit();


