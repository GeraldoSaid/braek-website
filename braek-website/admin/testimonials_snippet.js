
// ─── Testimonials ────────────────────────────────────────────────
async function loadTestimonials() {
    const tbody = document.querySelector('#tab-testimonials table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#666;padding:24px;">Carregando...</td></tr>';

    const data = await api(API.testimonials.get);
    const tests = data.testimonials || [];

    if (tests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#666;padding:24px;">Nenhum depoimento cadastrado.</td></tr>';
        return;
    }

    tbody.innerHTML = tests.map(t => `
        <tr id="test-${t.id}">
            <td>
                <div class="avatar" style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-red); color: white; display:flex; align-items:center; justify-content:center; font-weight: bold; overflow:hidden;">
                    ${t.avatar ? `<img src="${t.avatar}" style="width:100%; height:100%; object-fit:cover;">` : t.name.charAt(0).toUpperCase()}
                </div>
            </td>
            <td><strong>${t.name}</strong><br><span style="color:var(--text-secondary);font-size:12px;">${t.role}</span></td>
            <td><span class="badge" style="background: rgba(255,255,255,0.05); border-color:transparent;">Coluna ${t.column_id}</span></td>
            <td>${t.message.substring(0, 40)}${t.message.length > 40 ? '...' : ''}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon danger" title="Excluir" onclick="deleteTestimonial('${t.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openTestimonialModal() {
    document.getElementById('testimonial-form').reset();
    document.getElementById('modal-testimonial').classList.add('active');
}

async function saveTestimonial(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    const payload = {
        name: document.getElementById('test-name').value,
        role: document.getElementById('test-role').value,
        message: document.getElementById('test-message').value,
        column_id: document.getElementById('test-column').value,
        avatar: document.getElementById('test-avatar').value
    };

    try {
        const data = await api(API.testimonials.create, payload);
        if (data.success) {
            closeModals();
            showToast('Depoimento criado com sucesso!', 'success');
            loadTestimonials();
        } else {
            showToast(data.error || 'Erro ao criar.', 'error');
        }
    } catch (err) {
        showToast('Erro de conexao.', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

async function deleteTestimonial(id) {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;
    try {
        const data = await api(API.testimonials.delete, { id });
        if (data.success) {
            document.getElementById(`test-${id}`)?.remove();
            showToast('Depoimento excluído.', 'success');
            loadTestimonials();
        } else {
            showToast(data.error || 'Erro ao excluir.', 'error');
        }
    } catch (err) {
        showToast('Erro de conexao.', 'error');
    }
}
