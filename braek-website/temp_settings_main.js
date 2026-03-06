
// ─── Global Settings (Social Links & WhatsApp) ─────────────
async function applyGlobalSettings() {
    try {
        const res = await fetch('api/settings/get.php');
        const data = await res.json();
        if (!data.success || !data.settings) return;

        const s = data.settings;

        // Update WhatsApp Links
        if (s.whatsapp) {
            const waLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
            waLinks.forEach(link => link.href = s.whatsapp);

            // Also update any explicit "btn" classes if they are meant to be whatsapp
            // For instance, the main CTA might just have href="#" currently
            const contactBtns = document.querySelectorAll('.btn.primary-btn, .btn.secondary-btn');
            contactBtns.forEach(btn => {
                if (btn.textContent.toLowerCase().includes('orçamento') || btn.textContent.toLowerCase().includes('whatsapp') || btn.textContent.toLowerCase().includes('fale conosco')) {
                    btn.href = s.whatsapp;
                }
            });
        }

        // Update Instagram Links
        if (s.instagram) {
            const igLinks = document.querySelectorAll('a[href*="instagram.com"]');
            igLinks.forEach(link => link.href = s.instagram);
        }

        // Update LinkedIn Links
        if (s.linkedin) {
            const inLinks = document.querySelectorAll('a[href*="linkedin.com"]');
            inLinks.forEach(link => link.href = s.linkedin);
        }

    } catch (e) {
        console.error('Failed to apply global settings:', e);
    }
}

applyGlobalSettings();
