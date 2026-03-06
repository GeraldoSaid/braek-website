
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
