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
                // Split by spaces but preserve the spaces as individual segments
                const segments = text.split(/(\s+)/);
                segments.forEach(segment => {
                    if (/^\s+$/.test(segment)) {
                        // It's just whitespace, add as text node so native wrapping works between words
                        container.appendChild(document.createTextNode(segment));
                    } else if (segment.length > 0) {
                        // It's a word. Group characters in a nowrap span so the word never breaks mid-line!
                        const wordSpan = document.createElement('span');
                        wordSpan.className = 'word-wrap';
                        wordSpan.style.display = 'inline-block';
                        wordSpan.style.whiteSpace = 'nowrap';

                        const chars = segment.split('');
                        chars.forEach(char => {
                            const span = document.createElement('span');
                            span.className = 'char-anim';
                            span.textContent = char;
                            span.style.animationDelay = `${globalLetterIndex * 0.04}s`;
                            wordSpan.appendChild(span);
                            globalLetterIndex++;
                        });
                        container.appendChild(wordSpan);
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

    // 5. Mobile Menu Logic with GSAP
    function initMobileMenu() {
        const toggle = document.querySelector('.menu-toggle');
        const close = document.querySelector('.menu-close');
        const menu = document.querySelector('.mobile-menu');
        const links = document.querySelectorAll('.mobile-nav-links a');
        const footer = document.querySelector('.mobile-menu-footer');

        if (!toggle || !menu) return;

        const tl = gsap.timeline({ paused: true });

        tl.to(menu, {
            display: 'block',
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
        })
            .to(links, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power3.out'
            }, '-=0.2')
            .to(footer, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power3.out'
            }, '-=0.3');

        toggle.addEventListener('click', () => {
            menu.classList.add('active');
            tl.play();
        });
        close.addEventListener('click', () => {
            tl.reverse().eventCallback('onReverseComplete', () => {
                menu.classList.remove('active');
            });
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                tl.reverse().eventCallback('onReverseComplete', () => {
                    menu.classList.remove('active');
                });
            });
        });
    }
    initMobileMenu();

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
                    wordWrap.className = 'word-wrap';
                    wordWrap.style.display = 'inline-block';
                    wordWrap.style.whiteSpace = 'nowrap';
                    wordWrap.style.wordBreak = 'normal';
                    wordWrap.style.hyphens = 'none';

                    [...word].forEach(char => {
                        const span = document.createElement('span');
                        span.className = 'char-anim';
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
                        space.className = 'word-space';
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
                    ease: 'power3.out',
                    stagger: 0.04,
                    duration: 1,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });
    }

    // 7. Dynamic Project Engine (API-powered)
    const PROJECTS_API = '/api/projects/get.php';

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
        const link = `/projeto/${project.id}`;

        // Ensure absolute path for images to work on dynamic routes
        const absHero = project.heroImage.startsWith('/') ? project.heroImage : '/' + project.heroImage;

        if (isLarge) {
            return `
                <div class="project-card large reveal-up" data-category="${categorySlug}">
                    <img src="${absHero}" alt="${project.title}" class="project-img">
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
                    <img src="${absHero}" alt="${project.title}" class="project-img">
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
            // Robust check for featured (handles "0", "1", 0, 1, true, false)
            const featured = projects.filter(p => p.featured && p.featured !== "0" && p.featured !== 0).slice(0, 3);
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

                // Re-observe newly created reveal elements for home page
                const newRev = homeGrid.querySelectorAll('.reveal-up');
                newRev.forEach(el => observer.observe(el));
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
                    const catRes = await fetch('/api/categories/get.php');
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

        // ─── Handle Project Details Template ────────────────────────────────
        if (window.location.pathname.includes('project-details.html') ||
            window.location.pathname.includes('/projeto/')) {

            const urlParams = new URLSearchParams(window.location.search);
            let projectId = urlParams.get('id');

            console.log('[Project Engine] Path:', window.location.pathname);
            console.log('[Project Engine] Query ID:', projectId);

            // If ID is not in query, try to get it from path like /projeto/enix
            if (!projectId && window.location.pathname.includes('/projeto/')) {
                const cleanPath = window.location.pathname.replace(/\/$/, ''); // Remove trailing slash
                const parts = cleanPath.split('/');
                projectId = parts[parts.length - 1];

                // If the last part is "projeto" or "details", we might need the one before or it's invalid
                if (projectId === 'projeto' || projectId === 'project-details.html') {
                    projectId = null;
                }
            }

            console.log('[Project Engine] Final ID:', projectId);

            if (projectId && projectId !== 'details') {
                // Fetch ONLY this project for efficiency
                try {
                    const apiUrl = `${PROJECTS_API}?id=${projectId}`;
                    console.log('[Project Engine] Fetching:', apiUrl);

                    const res = await fetch(apiUrl);
                    const singleData = await res.json();

                    // The API returns { projects: [...] }
                    const project = (singleData.projects || []).find(p => p.id === projectId);

                    if (project) {
                        updateProjectDetailsUI(project);
                        initLightbox();
                        initNextProjects(projects, project.id);

                        // SEO: Update page title and description
                        document.title = `${project.title} | Braek`;
                        const metaDesc = document.querySelector('meta[name="description"]');
                        if (metaDesc) metaDesc.content = project.subtitle || `Detalhes do projeto ${project.title} pela Braek.`;
                    } else {
                        // Project not found - redirect or show message
                        const heroContent = document.querySelector('.pd-hero-content');
                        if (heroContent) {
                            heroContent.innerHTML = `<h1>PROJETO NÃO ENCONTRADO</h1><p>O projeto que você está procurando não existe ou foi removido.</p><a href="/portfolio" class="btn-primary mt-4">Ver Portfólio</a>`;
                        }
                    }
                } catch (e) {
                    console.error('Error loading project details:', e);
                }
            }
        }
    }

    function initLightbox() {
        const lightbox = document.getElementById('project-lightbox');
        if (!lightbox) return;

        const content = lightbox.querySelector('.pd-lightbox-content');
        const closeBtn = lightbox.querySelector('.pd-lightbox-close');
        const galleryItems = document.querySelectorAll('.gallery-item img, .gallery-item video');

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                content.innerHTML = '';
                const clone = item.cloneNode(true);
                if (clone.tagName === 'VIDEO') {
                    clone.controls = true;
                    clone.autoplay = true;
                }
                content.appendChild(clone);
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { content.innerHTML = ''; }, 400);
        };

        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
        });
    }

    function initNextProjects(allProjects, currentId) {
        const container = document.querySelector('.featured-projects-grid');
        if (!container) return;

        // Filter out current project and pick 2-3 others
        const nextOnes = allProjects.filter(p => p.id !== currentId).slice(0, 3);

        if (nextOnes.length > 0) {
            container.innerHTML = nextOnes.map(p => createProjectCard(p, false)).join('');

            // Observe for animations
            const reveals = container.querySelectorAll('.reveal-up');
            reveals.forEach(el => observer.observe(el));
        }
    }

    function updateProjectDetailsUI(project) {
        // Hero Section
        const heroImg = document.querySelector('.pd-hero-media img');
        if (heroImg) {
            const absoluteHero = (project.heroImage || '').startsWith('/') ? project.heroImage : '/' + project.heroImage;
            if (project.heroImage) {
                heroImg.src = absoluteHero;
                heroImg.style.display = 'block';
                heroImg.alt = project.title || 'Hero Image';
            }
        }

        const badge = document.querySelector('.pd-hero-content .project-badge');
        if (badge) badge.textContent = project.category;

        const h1 = document.querySelector('.pd-hero-content h1');
        if (h1) h1.textContent = project.title;

        const p = document.querySelector('.pd-hero-content p');
        if (p) p.textContent = project.subtitle;

        // Info Items
        const infoValues = document.querySelectorAll('.pd-sidebar-card .pd-info-value');
        if (infoValues.length >= 4) {
            infoValues[0].textContent = project.role || '—';
            infoValues[1].textContent = project.client || '—';
            infoValues[2].textContent = project.duration || '—';
            infoValues[3].textContent = project.year || '—';
        }

        // Visit Button
        const sidebarCard = document.querySelector('.pd-sidebar-card');
        if (sidebarCard) {
            // Remove existing button if any
            const existingBtn = sidebarCard.querySelector('.btn-visit-project');
            if (existingBtn) existingBtn.remove();

            if (project.visit_url || project.pageLink) {
                const link = project.visit_url || project.pageLink;
                const btn = document.createElement('a');
                btn.href = link;
                btn.target = '_blank';
                btn.className = 'btn-primary w-100 mt-4 btn-visit-project';
                btn.style.marginTop = '20px';
                btn.style.display = 'flex';
                btn.style.alignItems = 'center';
                btn.style.justifyContent = 'center';
                btn.style.gap = '10px';
                btn.innerHTML = `Visit project <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`;
                sidebarCard.appendChild(btn);
            }
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
            galleryGrid.innerHTML = project.gallery.map(file => {
                const isVideo = file.match(/\.(mp4|webm|ogg)$/i);
                const absoluteFile = file.startsWith('/') ? file : '/' + file;
                if (isVideo) {
                    return `
                        <div class="gallery-item reveal-up">
                            <video src="${absoluteFile}" controls muted loop style="width:100%; border-radius:12px;"></video>
                        </div>
                    `;
                }
                return `
                    <div class="gallery-item reveal-up">
                        <img src="${absoluteFile}" alt="Gallery Image">
                    </div>
                `;
            }).join('');
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
                const res = await fetch('/api/leads/create.php', {
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
            const res = await fetch('/api/testimonials/get.php');
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
                                ${t.avatar ? `<img src="${t.avatar.startsWith('/') ? t.avatar : '/' + t.avatar}" style="width:100%; height:100%; object-fit:cover;">` : t.name.charAt(0).toUpperCase()}
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
                    <div class="reveal-up mt-5">
                        <div class="ticker-wrapper">
                            <div class="ticker">${cardsHtml}</div>
                            <div class="ticker" aria-hidden="true">${cardsHtml}</div>
                        </div>
                    </div>
                `;
            }

            // Row 2 (Reverse)
            if (col2.length > 0) {
                const cardsHtml = col2.map(buildCard).join('');
                html += `
                    <div class="reveal-up mt-5" style="transition-delay: 0.1s;">
                        <div class="ticker-wrapper reverse">
                            <div class="ticker">${cardsHtml}</div>
                            <div class="ticker" aria-hidden="true">${cardsHtml}</div>
                        </div>
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
        const res = await fetch('/api/settings/get.php');
        const data = await res.json();
        if (!data.success || !data.settings) return;

        const s = data.settings;

        // Update WhatsApp CTA Buttons - IDs set directly in index.html
        if (s.whatsapp) {
            ['cta-whatsapp-nav', 'cta-whatsapp-hero', 'cta-whatsapp-footer'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.href = s.whatsapp;
                    el.target = '_blank';
                    el.rel = 'noopener noreferrer';
                }
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
            const res = await fetch('/api/track/visit.php', { method: 'POST' });
            if (res.ok) {
                sessionStorage.setItem('braek_visited', 'true');
            }
        }
    } catch (e) {
        // Silent fail for tracking
    }
}
trackVisit();




