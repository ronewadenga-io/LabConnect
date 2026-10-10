function renderComputers(container) {
    if (currentUser.role !== 'ADMIN') {
        container.innerHTML = `<div class="alert alert-info">Admin only.</div>`;
        return;
    }
    let html = `
        <h3 class="section-title">Node management</h3>
        <form class="manage-form" id="addComputerForm">
            <div class="form-group">
                <label for="newCompLab">Laboratory</label>
                <select class="form-control" id="newCompLab">${LABS.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}</select>
            </div>
            <div class="form-group">
                <label for="newCompHostname">Hostname *</label>
                <input class="form-control" id="newCompHostname" placeholder="e.g. compute-05" required />
            </div>
            <button type="submit" class="btn btn-teal btn-sm"><i class="fas fa-plus" aria-hidden="true"></i> Add computer</button>
        </form>
        <div class="flex gap-2 mb-2">
            <label class="sr-only" for="compSearch">Search nodes</label>
            <input class="form-control" style="width:auto;min-width:200px;" placeholder="Search nodes..." id="compSearch" />
            <button class="btn btn-teal btn-sm" onclick="filterComputers()"><i class="fas fa-search" aria-hidden="true"></i> Search</button>
        </div>
        <div class="table-wrap"><table><thead><tr><th>#</th><th>Lab</th><th>Hostname</th><th>IP</th><th>Status</th><th>OS</th></tr></thead><tbody id="compTableBody">`;
    const comps = computers.slice(0, 30);
    comps.forEach(c => {
        const lab = LABS.find(l => l.id === c.labId);
        html += `<tr><td>${c.number}</td><td>${lab?.name || ''}</td><td>${c.hostname}</td><td>${c.ip}</td><td>
            <label class="sr-only" for="status-${c.id}">Status for ${htmlEscape(c.hostname)}</label>
            <select class="form-control" id="status-${c.id}" style="min-width:150px;" onchange="setComputerStatus(${c.id}, this.value)">
                ${STATUSES.map(s => `<option value="${s}" ${s === c.status ? 'selected' : ''}>${getStatusInfo(s).label}</option>`).join('')}
            </select>
        </td><td class="text-xs">${c.os}</td></tr>`;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;

    window.filterComputers = function() {
        const search = document.getElementById('compSearch')?.value?.toLowerCase() || '';
        const tbody = document.getElementById('compTableBody');
        if (!tbody) return;
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(search) ? '' : 'none';
        });
    };

    window.setComputerStatus = function(id, status) {
        const c = computers.find(c => c.id === id);
        if (!c || !STATUSES.includes(status)) return;
        c.status = status;
        c.online = status !== 'OFFLINE';
        saveFaults();
    };

    document.getElementById('addComputerForm').addEventListener('submit', e => {
        e.preventDefault();
        const labId = parseInt(document.getElementById('newCompLab').value);
        const hostname = document.getElementById('newCompHostname').value.trim();
        if (!labId || !hostname) return;
        const nextId = computers.length ? Math.max(...computers.map(c => c.id)) + 1 : 1;
        computers.push({ id: nextId, labId, number: `NODE-${String(nextId).padStart(2, '0')}`, hostname, role: 'COMPUTE', os: 'Unregistered', status: 'HEALTHY', online: true, network: 'UNKNOWN', agent: 'UNKNOWN', freeGB: null, totalGB: null, lastSeen: new Date().toISOString() });
        saveFaults();
        renderComputers(container);
    });
}


