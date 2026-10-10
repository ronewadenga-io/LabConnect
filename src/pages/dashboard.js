function renderDashboard(container) {
    const c = computers.find(c => c.role === 'HEAD') || computers[0];
    if (!c) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="fas fa-circle-nodes"></i></div><h3>Connect your first cluster</h3><p>Your workspace is ready. Complete onboarding to name the head node and connect your compute nodes.</p><button class="btn btn-teal" onclick="showOnboarding()">Set up workspace</button></div>`;
        return;
    }
    const computeNodes = computers.filter(node => node.role !== 'HEAD');
    const healthy = computers.filter(c => c.status === 'HEALTHY').length;
    const attention = computers.length - healthy;
    const openReports = faults.filter(f => !['RESOLVED', 'CLOSED'].includes(f.status));
    const recent = faults.filter(f => isSupport() || f.reportedBy === currentUser.id).sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt)).slice(0, 6);
    const checks = [
        ['fa-server', 'Head node status', 'Online', 'The head node is running and coordinating the cluster'],
        ['fa-wifi', 'Compute node network', 'Connected', 'Laboratory network access is reachable'],
        ['fa-hard-drive', 'Storage capacity', c.freeGB === null ? 'Not collected' : `${c.freeGB} <span>GB free</span>`, c.freeGB === null ? 'Connect an agent to collect capacity data' : 'Reported by the head node agent'],
        ['fa-heart-pulse', 'Cluster health', 'Responding', `Last heartbeat at ${agentTime(c.lastSeen)}`]
    ];
    container.innerHTML = `
            <div class="dashboard-intro"><div><h3>Head node overview</h3><p>This head node controls the lab fleet while each other system is treated as a cluster node.</p></div><span class="campus-label"><i class="fas fa-building-columns" aria-hidden="true"></i> ${LABS.length} clusters &middot; ${computeNodes.length} compute nodes</span></div>
        <div class="overview">
            <section class="overview-card citrus"><h3>Cluster conditions <i class="fas fa-desktop" aria-hidden="true"></i></h3><div class="metric">${healthy}<span style="font-size:18px;letter-spacing:0"> / ${computers.length}</span></div><p>Compute nodes and the head node passing their automatic checks</p><div class="mini-bars" aria-hidden="true"><span></span><span></span><span></span></div></section>
            <section class="overview-card apricot"><h3>Needs attention <i class="fas fa-sliders" aria-hidden="true"></i></h3><div class="metric">${attention}</div><p>${computers.filter(c => c.status === 'WARNING').length} warnings &middot; ${computers.filter(c => !c.online).length} offline nodes</p></section>
            <section class="overview-card dark"><h3>Cluster command</h3><strong>Head node active.<br>Compute nodes managed.</strong><p>Checks look fine but something is wrong? Tell laboratory support.</p><button class="btn btn-teal" onclick="reportFaultForComputer(${c.id})">Report a fault <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></button></section>
        </div>
        <div class="flex-between mb-2" style="gap:12px;flex-wrap:wrap"><div><h3 class="section-title" style="margin:0">This head node &mdash; ${c.hostname}</h3><p class="text-xs text-muted mt-1">Head node cluster controller &middot; ${LABS.find(l => l.id === c.labId).name} &middot; Local readings</p></div><button class="btn btn-sm" id="refreshPreview"><i class="fas fa-rotate" aria-hidden="true"></i> Refresh readings</button></div>
        <section class="agent-checks" aria-label="Automatic health checks">${checks.map(([icon, label, value, note], i) => `<article class="card agent-check"><div class="agent-check-head"><span class="agent-check-label">${label}</span><i class="fas ${icon} agent-icon" aria-hidden="true"></i></div><div class="agent-check-value">${value}</div>${i === 2 && c.freeGB !== null ? `<div class="agent-storage" role="meter" aria-label="Free storage in GB" aria-valuemin="0" aria-valuemax="${c.totalGB}" aria-valuenow="${c.freeGB}"><span style="width:${Math.min(100, c.freeGB / c.totalGB * 100)}%"></span></div>` : ''}<small>${note}</small></article>`).join('')}</section>
        <h3 class="section-title">Compute node health by laboratory</h3><div class="grid-2">${LABS.map(lab => {
            const list = computers.filter(c => c.labId === lab.id);
            const passed = list.filter(c => c.status === 'HEALTHY').length;
            const warning = list.filter(c => c.status === 'WARNING').length;
            const offline = list.filter(c => !c.online).length;
            return `<button class="card lab-summary" onclick="previewLabFilter='${lab.id}';previewConditionFilter='ALL';previewSearch='';navigateTo('monitoring')"><div class="flex-between"><div><strong>${lab.name}</strong> <span class="text-muted text-sm">${lab.building}, ${lab.room}</span></div><span class="status-badge ${passed / list.length > .9 ? 'healthy' : 'warning'}"><span class="dot"></span> ${Math.round(passed / list.length * 100)}% checks passed</span></div><div class="flex gap-2 mt-1 text-sm"><span><span class="status-mark" aria-hidden="true"></span>${passed} Healthy nodes</span><span><span class="status-mark faulty" aria-hidden="true"></span>${warning} Warning nodes</span><span><span class="status-mark offline" aria-hidden="true"></span>${offline} Offline nodes</span></div><div class="text-xs text-muted mt-1">${list.length} compute nodes</div></button>`;
        }).join('')}</div>
        <div class="flex-between mt-3"><h3 class="section-title">${isSupport() ? 'Recent fault reports' : 'My recent fault reports'}</h3><button class="agent-link" onclick="navigateTo('${isSupport() ? 'faults' : 'myreports'}')">View all reports &rarr;</button></div>
        <div class="table-wrap"><table><thead><tr><th>ID</th><th>Node</th><th>Lab</th><th>Problem</th><th>Status</th><th>Source</th></tr></thead><tbody>${recent.map(f => `<tr><td>#LC-${f.id}</td><td>${f.computerNumber}</td><td>${f.labName}</td><td>${htmlEscape(f.faultType)}</td><td>${getFaultStatusBadge(f.status)}</td><td>${f.source === 'AUTO' ? 'Automatic' : 'User report'}</td></tr>`).join('') || '<tr><td colspan="6" class="text-center text-muted">No reports from you yet.</td></tr>'}</tbody></table></div>
        <div class="agent-notice">Automatic checks and user reports work together. A passed check does not mean every part of the clustered node is working. ${openReports.length} open reports across this workspace.</div>
        <div class="agent-footer"><span id="previewMessage" role="status">Local workspace data only. Connect an agent to receive live readings.</span><span>LabConnect Agent</span></div>`;
    document.getElementById('refreshPreview').onclick = () => { document.getElementById('previewMessage').textContent = 'Readings refreshed from the local workspace.'; };
}
