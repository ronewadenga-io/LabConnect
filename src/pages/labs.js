function renderLabs(container) {
    if (selectedLabId) {
        renderLabDetail(container);
        return;
    }

    const isAdmin = currentUser && currentUser.role === 'ADMIN';
    let html = `<h3 class="section-title">All cluster groups</h3>`;
    if (isAdmin) {
        html += `<form class="manage-form" id="addLabForm">
            <div class="form-group"><label for="newLabName">Laboratory name *</label><input class="form-control" id="newLabName" placeholder="e.g. Computer Lab 5" required /></div>
            <div class="form-group"><label for="newLabBuilding">Building</label><input class="form-control" id="newLabBuilding" placeholder="e.g. Science Block" /></div>
            <div class="form-group"><label for="newLabRoom">Room</label><input class="form-control" id="newLabRoom" placeholder="e.g. F003" /></div>
            <button type="submit" class="btn btn-teal btn-sm"><i class="fas fa-plus" aria-hidden="true"></i> Add laboratory</button>
        </form>`;
    }
    html += `<div class="grid-2">`;
    LABS.forEach(lab => {
        const labComps = computers.filter(c => c.labId === lab.id);
        const totalL = labComps.length;
        const healthyL = labComps.filter(c => c.status === 'HEALTHY').length;
        const pct = totalL ? Math.round(healthyL / totalL * 100) : 0;
        const faultyL = labComps.filter(c => c.status === 'FAULT_REPORTED' || c.status === 'WARNING').length;
        const offlineL = labComps.filter(c => c.status === 'OFFLINE').length;
        html += `
            <div class="card" style="cursor:pointer;" onclick="selectLab(${lab.id})">
                <div class="flex-between">
                    <div><strong>${lab.name}</strong> <span class="text-muted text-sm">${lab.building}, ${lab.room}</span></div>
                    <span class="status-badge ${pct > 90 ? 'healthy' : pct > 70 ? 'warning' : 'critical'}">
                        <span class="dot"></span> ${pct}% Health
                    </span>
                </div>
                <div class="flex gap-2 mt-1 text-sm">
                    <span><span class="status-mark " aria-hidden="true"></span> ${healthyL} Available</span>
                    <span><span class="status-mark faulty" aria-hidden="true"></span> ${faultyL} Faulty</span>
                    <span><span class="status-mark offline" aria-hidden="true"></span> ${offlineL} Offline</span>
                </div>
                <div class="text-xs text-muted mt-1">${totalL} compute nodes</div>
                <button class="btn btn-sm btn-teal mt-1" onclick="event.stopPropagation();selectLab(${lab.id})">View group <i class="fas fa-arrow-right"></i></button>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;

    if (isAdmin) {
        document.getElementById('addLabForm').addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('newLabName').value.trim();
            const building = document.getElementById('newLabBuilding').value.trim() || 'Unassigned building';
            const room = document.getElementById('newLabRoom').value.trim() || 'Unassigned room';
            if (!name) return;
            const nextId = LABS.length ? Math.max(...LABS.map(l => l.id)) + 1 : 1;
            LABS.push({ id: nextId, name, building, room, total: 0 });
            saveFaults();
            renderLabs(container);
        });
    }
}

function selectLab(labId) {
    selectedLabId = labId;
    selectedComputerId = null;
    navigateTo('labs');
}

function renderLabDetail(container) {
    const lab = LABS.find(l => l.id === selectedLabId);
    if (!lab) { selectedLabId = null; renderLabs(container); return; }

    const labComps = computers.filter(c => c.labId === lab.id);
    const healthyL = labComps.filter(c => c.status === 'HEALTHY').length;
    const pct = labComps.length ? Math.round(healthyL / labComps.length * 100) : 0;

    let html = `
        <div class="flex-between mb-2">
            <div>
                <h3 class="section-title" style="margin-bottom:0;">${lab.name}</h3>
                <span class="text-muted text-sm">${lab.building}, ${lab.room} &middot; ${labComps.length} compute nodes &middot; ${pct}% healthy</span>
            </div>
            <div>
                <button class="btn btn-sm btn-outline" onclick="selectedLabId=null;navigateTo('labs')"><i class="fas fa-arrow-left"></i> Back</button>
            </div>
        </div>
        <div class="flex gap-2 mb-2" style="flex-wrap:wrap;">
            <span class="status-badge healthy"><span class="dot"></span> Healthy</span>
            <span class="status-badge warning"><span class="dot"></span> Warning</span>
            <span class="status-badge critical"><span class="dot"></span> Faulty</span>
            <span class="status-badge maintenance"><span class="dot"></span> Maintenance</span>
            <span class="status-badge offline"><span class="dot"></span> Offline</span>
        </div>
        <div class="computer-grid">
    `;

    labComps.forEach(c => {
        const info = getStatusInfo(c.status);
        html += `
            <div class="computer-tile ${info.cls}" onclick="selectComputer(${c.id})">
                <div class="pc-id">${c.number}</div>
                <div class="pc-status"><span class="dot-sm" style="background:${info.color};"></span> ${info.label}</div>
                <div class="text-xs text-muted">${c.hostname}</div>
            </div>
        `;
    });

    html += `</div>`;

    if (selectedComputerId) {
        const comp = computers.find(c => c.id === selectedComputerId);
        if (comp) {
            html += renderComputerDetail(comp);
        }
    }

    container.innerHTML = html;
}

function selectComputer(compId) {
    selectedComputerId = compId;
    navigateTo('labs');
}
