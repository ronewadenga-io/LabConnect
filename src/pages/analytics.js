function renderAnalytics(container) {
    if (currentUser.role !== 'ADMIN') {
        container.innerHTML = `<div class="alert alert-info">Admin only.</div>`;
        return;
    }
    const total = computers.length;
    const healthy = computers.filter(c => c.status === 'HEALTHY').length;
    const faulty = computers.filter(c => c.status === 'FAULT_REPORTED').length;
    const offline = computers.filter(c => c.status === 'OFFLINE').length;
    const openFaults = faults.filter(f => f.status !== 'RESOLVED' && f.status !== 'CLOSED').length;

    let html = `
        <h3 class="section-title">Cluster analytics</h3>
        <div class="stats-row">
            <div class="stat-card"><div class="stat-label">Total Computers</div><div class="stat-value">${total}</div></div>
            <div class="stat-card"><div class="stat-label">Healthy</div><div class="stat-value" style="color:#666b20;">${healthy}</div></div>
            <div class="stat-card"><div class="stat-label">Faulty / Offline</div><div class="stat-value" style="color:#bb521e;">${faulty + offline}</div></div>
            <div class="stat-card"><div class="stat-label">Open Faults</div><div class="stat-value" style="color:#666b20;">${openFaults}</div></div>
        </div>
        <div class="card"><h4>Faults by Category</h4>
            <div class="flex gap-2" style="flex-wrap:wrap;">
                ${FAULT_TYPES.map(t => {
                    const count = faults.filter(f => f.faultType === t).length;
                    return `<span class="text-sm">${t}: ${count}</span>`;
                }).join(' &middot; ')}
            </div>
        </div>
        <div class="card mt-2"><h4>Most Problematic Computers</h4>
            <div class="flex gap-2" style="flex-wrap:wrap;">
                ${computers.slice(0, 10).map(c => {
                    const count = faults.filter(f => f.computerId === c.id).length;
                    return `<span class="text-sm">${c.number}: ${count} faults</span>`;
                }).join(' &middot; ')}
            </div>
        </div>
    `;
    container.innerHTML = html;
}
