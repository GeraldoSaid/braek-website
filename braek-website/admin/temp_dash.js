
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
