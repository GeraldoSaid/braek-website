
// ─── Global Settings ───────────────────────────────────────
async function loadSettings() {
    const data = await api(API.settings.get);
    if (!data.success) return;

    const s = data.settings || {};

    const whatsapp = document.getElementById('setting-whatsapp');
    const instagram = document.getElementById('setting-instagram');
    const linkedin = document.getElementById('setting-linkedin');

    if (whatsapp && s.whatsapp) whatsapp.value = s.whatsapp;
    if (instagram && s.instagram) instagram.value = s.instagram;
    if (linkedin && s.linkedin) linkedin.value = s.linkedin;
}

async function saveSettings(e) {
    if (e) {
        e.preventDefault();
        const btn = e.target;
        const originalText = btn.textContent;
        btn.innerHTML = 'Salvando...';
        btn.disabled = true;

        const payload = {
            whatsapp: document.getElementById('setting-whatsapp')?.value || '',
            instagram: document.getElementById('setting-instagram')?.value || '',
            linkedin: document.getElementById('setting-linkedin')?.value || ''
        };

        const data = await api(API.settings.update, payload);

        btn.disabled = false;
        btn.innerHTML = originalText;

        if (data.success) {
            showToast('Configurações salvas sucesso!', 'success');
        } else {
            showToast(data.error || 'Erro ao salvar.', 'error');
        }
    }
}
