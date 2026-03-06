// ============================================================
// admin/admin.js — Admin Panel powered by real PHP/MySQL API
// ============================================================

const API = {
    check: '../api/auth/check.php',
    logout: '../api/auth/logout.php',
    projects: {
        get: '../api/projects/get.php',
        create: '../api/projects/create.php',
        update: '../api/projects/update.php',
        delete: '../api/projects/delete.php',
    },
    categories: {
        get: '../api/categories/get.php',
        create: '../api/categories/create.php',
        delete: '../api/categories/delete.php',
    },
    leads: {
        get: '../api/leads/get.php',
        update: '../api/leads/update.php',
    },
    upload: '../api/upload.php',
    dashboard: '../api/dashboard/get.php',
    testimonials: {
        get: '../api/testimonials/get.php',
        create: '../api/testimonials/create.php',
        delete: '../api/testimonials/delete.php',
    },
    settings: {
        get: '../api/settings/get.php',
        update: '../api/settings/update.php',
    }
};

// ─── Auth Guard ─────────────────────────────────────────────
async function checkAuth() {
    try {
        const res = await fetch(API.check);
        if (!res.ok) {
            if (res.status === 401) window.location.href = 'login.html';
            return;
        }
        const text = await res.text();
        if (!text || !text.trim().startsWith('{')) return;
        const data = JSON.parse(text);
        if (!data.authenticated) {
            window.location.href = 'login.html';
        } else {
            const nameEl = document.querySelector('.user-profile span');
            if (nameEl && data.user) nameEl.textContent = data.user.name;
        }
    } catch (e) {
        console.warn('checkAuth error:', e);
        // Don't redirect on network/parse errors
    }
}

// ─── Generic fetch helper ────────────────────────────────────
async function api(url, body = null) {
    const opts = body
        ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : { method: 'GET' };
    const res = await fetch(url, opts);
    return res.json();
}

// ─── Tab Switching ───────────────────────────────────────────
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    const tabViews = document.querySelectorAll('.tab-view');
    const pageTitle = document.getElementById('pageTitle');
    const titles = {
        overview: 'Visão Geral',
        projects: 'Gerenciar Projetos',
        categories: 'Categorias',
        leads: 'Caixa de Entrada (Leads)',
        testimonials: 'Depoimentos dos Clientes',
        settings: 'Configurações Globais'
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const tab = item.getAttribute('data-tab');
            tabViews.forEach(t => t.classList.remove('active'));
            document.getElementById(`tab-${tab}`)?.classList.add('active');
            if (pageTitle && titles[tab]) pageTitle.textContent = titles[tab];

            // Load tab data on switch
            if (tab === 'overview') loadDashboardStats();
            if (tab === 'projects') loadProjects();
            if (tab === 'categories') loadCategories();
            if (tab === 'leads') loadLeads();
            if (tab === 'testimonials') loadTestimonials();
            if (tab === 'settings') loadSettings();
        });
    });

    // Load overview stats on initial load
    loadDashboardStats();
}

// ─── Dashboard Stats ─────────────────────────────────────────

// ─── Dashboard Stats ─────────────────────────────────────────
async function loadDashboardStats() {
    try {
        const data = await api(API.dashboard);
        if (data.success && data.stats) {
            document.getElementById('stat-total-projects').textContent = data.stats.total_projects;
            document.getElementById('stat-featured').textContent = data.stats.featured_projects;
            document.getElementById('stat-leads').textContent = data.stats.new_leads;
            document.getElementById('stat-visits').textContent = data.stats.visits.toLocaleString('pt-BR');
            document.getElementById('stat-whatsapp').textContent = data.stats.whatsapp_clicks.toLocaleString('pt-BR');
        }

        // 1. Update Chart
        const chartBars = document.getElementById('dashboard-chart-bars');
        if (chartBars && data.chart) {
            let chartHtml = '';
            const max = data.chart_max || 1;

            data.chart.forEach((day, index) => {
                let heightStr = '5%';
                if (max > 0) {
                    const pct = Math.max(5, Math.round((day.visits / max) * 100));
                    heightStr = `${pct}%`;
                }
                const activeClass = (index === data.chart.length - 1) ? 'active' : '';
                chartHtml += `
                    <div class="bar-col" title="${day.visits} visitas">
                        <div class="bar ${activeClass}" style="height: ${heightStr}"></div>
                        <span>${day.day}</span>
                    </div>
                `;
            });
            chartBars.innerHTML = chartHtml;
        }

        // 2. Update Activities
        const actList = document.getElementById('dashboard-activities');
        if (actList && data.activities) {
            let actHtml = '';
            if (data.activities.length === 0) {
                actHtml = '<p style="color:var(--text-secondary); padding: 20px; text-align:center;">Nenhuma atividade recente.</p>';
            } else {
                data.activities.forEach(act => {
                    const dateRaw = new Date(act.created_at);
                    const isToday = new Date().toDateString() === dateRaw.toDateString();
                    const displayTime = isToday
                        ? `Hoje às ${dateRaw.getHours().toString().padStart(2, '0')}:${dateRaw.getMinutes().toString().padStart(2, '0')}`
                        : `${dateRaw.getDate().toString().padStart(2, '0')}/${(dateRaw.getMonth() + 1).toString().padStart(2, '0')} às ${dateRaw.getHours().toString().padStart(2, '0')}:${dateRaw.getMinutes().toString().padStart(2, '0')}`;

                    if (act.type === 'lead') {
                        actHtml += `
                            <div class="activity-item">
                                <div class="act-dot red"></div>
                                <div class="act-text">
                                    <p><strong>Novo contato:</strong> Mensagem de ${act.title}.</p>
                                    <span>${displayTime}</span>
                                </div>
                            </div>
                        `;
                    } else if (act.type === 'project') {
                        actHtml += `
                            <div class="activity-item">
                                <div class="act-dot"></div>
                                <div class="act-text">
                                    <p><strong>Projeto:</strong> ${act.title}.</p>
                                    <span>${displayTime}</span>
                                </div>
                            </div>
                        `;
                    }
                });
            }
            actList.innerHTML = actHtml;
        }
    } catch (e) {
        console.error('Falha ao carregar dashboard', e);
    }
}


// ─── Projects ────────────────────────────────────────────────
async function loadProjects() {
    const tbody = document.querySelector('#tab-projects table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;padding:24px;">Carregando...</td></tr>';

    const data = await api(API.projects.get);
    const projects = data.projects || [];

    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;padding:24px;">Nenhum projeto cadastrado.</td></tr>';
        return;
    }

    tbody.innerHTML = projects.map(p => `
        <tr id="proj-${p.id}">
            <td><div class="td-flex"><img src="../${p.heroImage}" class="td-img" alt="Capa" onerror="this.style.opacity='.2'"></div></td>
            <td><strong>${p.title}</strong><br><span style="color:var(--text-secondary);font-size:12px;">${p.subtitle}</span></td>
            <td>${p.category}</td>
            <td>${p.year}</td>
            <td><span class="badge ${p.featured ? 'success' : ''}">${p.featured ? 'Destaque' : 'Normal'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" title="Editar" onclick="openEditProject('${p.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                    </button>
                    <button class="btn-icon danger" title="Excluir" onclick="deleteProject('${p.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function deleteProject(id) {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    const data = await api(API.projects.delete, { id });
    if (data.success) {
        document.getElementById(`proj - ${id} `)?.remove();
        showToast('Projeto excluído.', 'success');
    } else {
        showToast(data.error || 'Erro ao excluir.', 'error');
    }
}

// ─── Create/Edit Project Form ────────────────────────────────
let editingProjectId = null;
let galleryFiles = [];
let heroImageIndex = 0;
let currentTags = [];

function openProjectModal() {
    editingProjectId = null;
    galleryFiles = [];
    heroImageIndex = 0;
    currentTags = [];

    document.getElementById('modal-project-title').textContent = 'Criar Novo Projeto';
    document.getElementById('project-form').reset();
    renderGalleryPreviews();
    renderTags();
    loadCategoriesIntoSelect();
    document.getElementById('modal-project').classList.add('active');
}

async function openEditProject(id) {
    editingProjectId = id;
    const data = await api(API.projects.get + '?id=' + id);
    const project = (data.projects || []).find(p => p.id === id);
    if (!project) return;

    document.getElementById('modal-project-title').textContent = 'Editar Projeto';
    await loadCategoriesIntoSelect(project.category);

    document.getElementById('proj-title').value = project.title || '';
    document.getElementById('proj-subtitle').value = project.subtitle || '';
    document.getElementById('proj-year').value = project.year || '';
    document.getElementById('proj-client').value = project.client || '';
    document.getElementById('proj-role').value = project.role || '';
    document.getElementById('proj-duration').value = project.duration || '';
    document.getElementById('proj-link').value = project.pageLink || '';
    document.getElementById('proj-about').value = project.about || '';
    document.getElementById('proj-challenge').value = project.challenge || '';
    document.getElementById('proj-featured').checked = project.featured;

    // Load gallery and hero
    galleryFiles = [];
    currentTags = project.tags || [];

    if (project.gallery && Array.isArray(project.gallery)) {
        galleryFiles.push(...project.gallery);
    }

    if (project.heroImage) {
        const hIdx = galleryFiles.indexOf(project.heroImage);
        if (hIdx === -1) {
            galleryFiles.unshift(project.heroImage);
            heroImageIndex = 0;
        } else {
            heroImageIndex = hIdx;
        }
    } else {
        heroImageIndex = 0;
    }

    renderGalleryPreviews();
    renderTags();
    document.getElementById('modal-project').classList.add('active');
}

async function saveProject() {
    const btn = document.getElementById('save-project-btn');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = 'Trabalhando nas Imagens...';

    // 1. Upload new File objects
    const finalGalleryUrls = [];
    for (let i = 0; i < galleryFiles.length; i++) {
        const item = galleryFiles[i];
        if (item instanceof File) {
            const formData = new FormData();
            formData.append('image', item);
            try {
                const upRes = await fetch(API.upload, { method: 'POST', body: formData });
                const upData = await upRes.json();
                if (upData.url) {
                    finalGalleryUrls.push(upData.url);
                } else {
                    showToast(upData.error || 'Erro no upload da imagem.', 'error');
                    btn.disabled = false; btn.textContent = 'Salvar Projeto';
                    return;
                }
            } catch (e) {
                showToast('Erro de conexão no upload.', 'error');
                btn.disabled = false; btn.textContent = 'Salvar Projeto';
                return;
            }
        } else {
            finalGalleryUrls.push(item);
        }
    }

    btn.textContent = 'Salvando Dados...';

    // 2. Identify hero image
    let heroImage = '';
    if (finalGalleryUrls.length > 0) {
        heroImage = finalGalleryUrls[heroImageIndex] || finalGalleryUrls[0];
    }

    const payload = {
        title: document.getElementById('proj-title').value,
        subtitle: document.getElementById('proj-subtitle').value,
        category: document.getElementById('proj-category').value,
        year: document.getElementById('proj-year').value,
        client: document.getElementById('proj-client').value,
        role: document.getElementById('proj-role').value,
        duration: document.getElementById('proj-duration').value,
        pageLink: document.getElementById('proj-link').value,
        about: document.getElementById('proj-about').value,
        challenge: document.getElementById('proj-challenge').value,
        heroImage: heroImage,
        gallery: finalGalleryUrls,
        tags: currentTags,
        featured: document.getElementById('proj-featured').checked ? 1 : 0,
    };

    const url = editingProjectId ? API.projects.update : API.projects.create;
    if (editingProjectId) payload.id = editingProjectId;

    try {
        const data = await api(url, payload);
        btn.disabled = false; btn.textContent = 'Salvar Projeto';

        if (data.success) {
            closeModals();
            loadProjects();
            showToast(editingProjectId ? 'Projeto atualizado!' : 'Projeto criado!', 'success');
        } else {
            showToast(data.error || 'Erro ao salvar projeto.', 'error');
        }
    } catch (e) {
        showToast('Erro ao salvar projeto.', 'error');
        btn.disabled = false; btn.textContent = 'Salvar Projeto';
    }
}

// ─── Categories ──────────────────────────────────────────────
async function loadCategories() {
    const tbody = document.querySelector('#tab-categories table tbody');
    if (!tbody) return;

    const data = await api(API.categories.get);
    const cats = data.categories || [];

    tbody.innerHTML = cats.map(c => `
        < tr id = "cat-${c.id}" >
            <td><span style="color:var(--text-secondary);font-size:13px;font-family:monospace;">${c.slug}</span></td>
            <td><strong>${c.name}</strong></td>
            <td>${c.total ?? 0}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon danger" title="Excluir" onclick="deleteCategory(${c.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        </tr >
        `).join('') || '<tr><td colspan="4" style="text-align:center;color:#666;padding:24px;">Nenhuma categoria.</td></tr>';
}

async function loadCategoriesIntoSelect(selected = '') {
    const select = document.getElementById('proj-category');
    if (!select) return;
    const data = await api(API.categories.get);
    const cats = data.categories || [];
    select.innerHTML = '<option value="">Selecione...</option>' +
        cats.map(c => `< option value = "${c.name}" ${c.name === selected ? 'selected' : ''}> ${c.name}</option > `).join('');
}

async function saveCategory() {
    const input = document.getElementById('new-category-name');
    const name = input?.value?.trim();
    if (!name) return;

    const data = await api(API.categories.create, { name });
    if (data.success) {
        closeModals();
        loadCategories();
        showToast('Categoria criada!', 'success');
    } else {
        showToast(data.error || 'Erro ao criar categoria.', 'error');
    }
}

async function deleteCategory(id) {
    if (!confirm('Excluir esta categoria?')) return;
    const data = await api(API.categories.delete, { id });
    if (data.success) {
        document.getElementById(`cat - ${id} `)?.remove();
        showToast('Categoria excluída.', 'success');
    } else {
        showToast(data.error || 'Erro ao excluir.', 'error');
    }
}

// ─── Leads ───────────────────────────────────────────────────
async function loadLeads() {
    const tbody = document.querySelector('#tab-leads table tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;padding:24px;">Carregando...</td></tr>';

    const data = await api(API.leads.get);
    const leads = data.leads || [];

    if (leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;padding:24px;">Nenhum lead recebido.</td></tr>';
        return;
    }

    tbody.innerHTML = leads.map(l => `
        < tr id = "lead-${l.id}" >
            <td><span class="badge ${l.status === 'unread' ? 'danger' : ''}">${l.status === 'unread' ? 'Não Lido' : 'Lido'}</span></td>
            <td><strong>${l.name}</strong></td>
            <td>${l.email}<br><span style="color:var(--text-secondary);font-size:12px;">${l.phone}</span></td>
            <td>"${(l.message || '').substring(0, 60)}..."</td>
            <td>${new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
            <td>
                <button class="btn-admin btn-admin-outline" style="padding:6px 12px;font-size:12px;width:auto;"
                    onclick="openLeadDetail(${l.id}, '${l.name.replace(/'/g, "\\'")}', '${l.email}', '${l.phone}', \`${(l.message || '').replace(/`/g, '\\`')}\`)">
                    Ler Mensagem
                </button>
            </td >
        </tr >
        `).join('');

    // Update overview unread count
    const unreadEl = document.querySelector('#tab-overview .stat-card:nth-child(3) h3');
    if (unreadEl) unreadEl.textContent = leads.filter(l => l.status === 'unread').length;
}

function openLeadDetail(id, name, email, phone, message) {
    document.getElementById('lead-detail-name').textContent = name;
    document.getElementById('lead-detail-email').textContent = email;
    document.getElementById('lead-detail-phone').textContent = phone || '—';
    document.getElementById('lead-detail-msg').textContent = message;
    document.getElementById('lead-detail-id').value = id;
    document.getElementById('modal-lead').classList.add('active');

    // Mark as read
    markLeadRead(id);
}

async function markLeadRead(id) {
    await api(API.leads.update, { id, status: 'read' });
    const badge = document.querySelector(`#lead - ${id} .badge.danger`);
    if (badge) { badge.textContent = 'Lido'; badge.classList.remove('danger'); }
}

// ─── Image preview / Gallery Management ─────────────────────
function initImagePreview() {
    const fileInput = document.getElementById('proj-image');
    if (fileInput) {
        fileInput.addEventListener('change', () => {
            const files = Array.from(fileInput.files);
            if (files.length === 0) return;

            galleryFiles.push(...files);
            renderGalleryPreviews();
            fileInput.value = ''; // Reset input so it fires change again
        });
    }

    // Sub-init Tags
    const tagInput = document.getElementById('proj-tags-input');
    if (tagInput) {
        tagInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = tagInput.value.trim();
                if (val && !currentTags.includes(val)) {
                    currentTags.push(val);
                    renderTags();
                }
                tagInput.value = '';
            }
        });
    }
}

function renderGalleryPreviews() {
    const container = document.getElementById('gallery-preview-container');
    if (!container) return;

    if (galleryFiles.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);font-size:13px;grid-column:1/-1;text-align:center;">Nenhuma imagem adicionada.</p>';
        return;
    }

    if (heroImageIndex >= galleryFiles.length) {
        heroImageIndex = 0;
    }

    container.innerHTML = galleryFiles.map((item, index) => {
        const src = (item instanceof File) ? URL.createObjectURL(item) : '../' + item;
        const isHero = index === heroImageIndex;

        return `
            <div class="preview-card ${isHero ? 'hero' : ''}">
                <img src="${src}" alt="Preview">
                <div class="preview-actions">
                    <span class="${isHero ? 'hero-badge' : 'set-hero-btn'}" 
                          title="${isHero ? 'Imagem de Capa (Hero)' : 'Definir como Capa'}"
                          onclick="setHeroImage(${index})">
                        <svg viewBox="0 0 24 24" fill="${isHero ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </span>
                    <button type="button" class="btn-icon danger" onclick="removeGalleryImage(${index})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function setHeroImage(index) {
    heroImageIndex = index;
    renderGalleryPreviews();
}

function removeGalleryImage(index) {
    galleryFiles.splice(index, 1);
    renderGalleryPreviews();
}

function renderTags() {
    const list = document.getElementById('proj-tags-list');
    if (!list) return;
    list.innerHTML = currentTags.map((tag, i) => `
        <span class="custom-tag">${tag} <button type="button" onclick="removeTag(${i})">&times;</button></span>
    `).join('');
}

function removeTag(index) {
    currentTags.splice(index, 1);
    renderTags();
}

// ─── Toast notifications ─────────────────────────────────────
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z - index: 9999;
    padding: 14px 20px; border - radius: 10px; font - size: .875rem;
    font - family: Inter, sans - serif; font - weight: 500;
    background:${type === 'success' ? '#1a3a1a' : '#3a1a1a'};
    border: 1px solid ${type === 'success' ? '#2d6a2d' : '#6a2d2d'};
    color:${type === 'success' ? '#4ade80' : '#f87171'};
    box - shadow: 0 8px 32px rgba(0, 0, 0, .4);
    animation: slideIn .25s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ─── Modals ───────────────────────────────────────────────────
function openCategoryModal() {
    document.getElementById('modal-category').classList.add('active');
}
function openLeadModal() { /* used inline */ }
function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModals(); });
});

// ─── Logout ───────────────────────────────────────────────────
function logout() {
    fetch(API.logout, { method: 'POST' }).finally(() => { window.location.href = 'login.html'; });
}

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initTabs();
    initImagePreview();

    // Load initial data for Overview tab
    loadProjects();
    loadLeads();
});


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










