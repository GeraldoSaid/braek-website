
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
