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
