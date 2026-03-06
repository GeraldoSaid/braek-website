// socials.js - Isola links sociais c/ clonagem para evitar conflitos com ouvintes nativos
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/settings/get.php');
        if (!res.ok) return;

        const data = await res.json();
        if (!data.success || !data.settings) return;

        const s = data.settings;

        // Função utilitária para clonar, limpar listeners antigos e atualizar o link
        const safeLinkReplace = (elementId, newHref) => {
            const oldEl = document.getElementById(elementId);
            if (oldEl) {
                // Clona o elemento copiando todo o visual (true = Deep Clone)
                const newEl = oldEl.cloneNode(true);
                // Aplica as novas propriedades seguras
                newEl.href = newHref;
                newEl.target = '_blank';
                newEl.rel = 'noopener noreferrer';
                // Substitui o antigo pelo novo (destruindo listeners antigos presos ao nó)
                oldEl.parentNode.replaceChild(newEl, oldEl);
            }
        };

        // 1. Aplicar links do WhatsApp com substituição total de nós
        if (s.whatsapp) {
            safeLinkReplace('cta-whatsapp-nav', s.whatsapp);
            safeLinkReplace('cta-whatsapp-hero', s.whatsapp);
            safeLinkReplace('cta-whatsapp-footer', s.whatsapp);

            // Capturar links genéricos de #contato
            const contactBtns = document.querySelectorAll('a[href="#contato"]');
            contactBtns.forEach(btn => {
                const text = btn.textContent.toLowerCase();
                if (text.includes('orçamento') || text.includes('whatsapp') || text.includes('fale conosco') || text.includes('contato')) {
                    const newBtn = btn.cloneNode(true);
                    newBtn.href = s.whatsapp;
                    newBtn.target = '_blank';
                    newBtn.rel = 'noopener noreferrer';
                    btn.parentNode.replaceChild(newBtn, btn);
                }
            });
        }

        // 2. Instagram
        if (s.instagram) {
            safeLinkReplace('social-instagram', s.instagram);
        }

        // 3. LinkedIn
        if (s.linkedin) {
            safeLinkReplace('social-linkedin', s.linkedin);
        }

    } catch (e) {
        // Falha 100% silenciosa para não poluir o console ou quebrar scripts
    }
});
