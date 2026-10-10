function renderFaults(container) {
    const isTech = currentUser && ['TECHNICIAN','ADMIN'].includes(currentUser.role);
    const isAdmin = currentUser && currentUser.role === 'ADMIN';
    if (!isTech && !isAdmin) {
        container.innerHTML = `<div class="alert alert-info">Fault management is available to Technicians and Administrators.</div>`;
        return;
    }
    const technicians = users.filter(u => u.role === 'TECHNICIAN');

    let html = `
        <h3 class="section-title">${isTech ? 'Active node faults' : 'All node faults'}</h3>
        <div class="flex gap-2 mb-2" style="flex-wrap:wrap;">
            <label class="sr-only" for="faultFilterStatus">Filter by status</label>
            <select class="form-control" style="width:auto;min-width:140px;" id="faultFilterStatus" aria-label="Filter by status">
                <option value="ALL">All status</option>
                ${FAULT_STATUSES.map(s => `<option value="${s}">${s.replace('_',' ')}</option>`).join('')}
            </select>
            <label class="sr-only" for="faultFilterSource">Filter by source</label>
            <select class="form-control" style="width:auto;min-width:140px;" id="faultFilterSource" aria-label="Filter by source">
                <option value="ALL">All sources</option>
                ${FAULT_SOURCES.map(s => `<option value="${s}">${s === 'AUTO' ? 'Automatic' : s === 'MANUAL' ? 'User report' : s}</option>`).join('')}
            </select>
            <label class="sr-only" for="faultFilterLab">Filter by laboratory</label>
            <select class="form-control" style="width:auto;min-width:140px;" id="faultFilterLab" aria-label="Filter by laboratory">
                <option value="ALL">All labs</option>
                ${LABS.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
            </select>
            <label class="sr-only" for="faultFilterPriority">Filter by priority</label>
            <select class="form-control" style="width:auto;min-width:140px;" id="faultFilterPriority" aria-label="Filter by priority">
                <option value="ALL">All priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
            </select>
            <label class="sr-only" for="faultSearch">Search node or fault type</label>
            <input class="form-control" style="width:auto;min-width:160px;" placeholder="Search node..." id="faultSearch" aria-label="Search node or fault type" />
            <button class="btn btn-teal btn-sm" onclick="applyFaultFilters()"><i class="fas fa-search" aria-hidden="true"></i> Filter</button>
        </div>
        <div class="table-wrap">
            <table>
                <thead><tr><th>#</th><th>Computer</th><th>Lab</th><th>Fault</th><th>Source</th><th>Status</th><th>Priority</th>${isAdmin ? '<th>Assigned to</th>' : ''}<th>Actions</th></tr></thead>
                <tbody id="faultTableBody">
                </tbody>
            </table>
        </div>
        <div id="faultDetail" aria-live="polite"></div>
        <dialog id="faultStatusDialog" aria-labelledby="faultStatusTitle">
            <form id="faultStatusForm">
                <h3 id="faultStatusTitle">Update fault status</h3>
                <label for="faultStatusNote" id="faultStatusNoteLabel">Update note</label>
                <textarea class="form-control" id="faultStatusNote" rows="4" maxlength="1000"></textarea>
                <p id="faultStatusError" class="text-sm text-danger" role="alert"></p>
                <div class="flex gap-2 mt-2">
                    <button class="btn btn-teal" type="submit">Confirm update</button>
                    <button class="btn btn-outline" type="button" onclick="document.getElementById('faultStatusDialog').close()">Cancel</button>
                </div>
            </form>
        </dialog>
    `;

    container.innerHTML = html;

    function renderFaultTable() {
        const statusFilter = document.getElementById('faultFilterStatus')?.value || 'ALL';
        const sourceFilter = document.getElementById('faultFilterSource')?.value || 'ALL';
        const labFilter = document.getElementById('faultFilterLab')?.value || 'ALL';
        const priorityFilter = document.getElementById('faultFilterPriority')?.value || 'ALL';
        const search = document.getElementById('faultSearch')?.value?.toLowerCase() || '';

        let list = faults;
        if (statusFilter !== 'ALL') list = list.filter(f => f.status === statusFilter);
        if (sourceFilter !== 'ALL') list = list.filter(f => f.source === sourceFilter);
        if (labFilter !== 'ALL') list = list.filter(f => f.labId === parseInt(labFilter));
        if (priorityFilter !== 'ALL') list = list.filter(f => f.priority === priorityFilter);
        if (search) list = list.filter(f => f.computerNumber.toLowerCase().includes(search) || f.faultType.toLowerCase().includes(search));

        const tbody = document.getElementById('faultTableBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${isAdmin ? 9 : 8}" class="text-muted text-center">No faults found.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.slice().reverse().map(f => {
            const actions = isTech ? (FAULT_ACTIONS[f.status] || []) : [];
            const assignedTech = users.find(u => u.id === f.assignedTechnician);
            return `
            <tr>
                <td>#${f.id}</td>
                <td>${f.computerNumber}${f.confirmations && f.confirmations.length > 1 ? ` <span class="text-xs text-muted" title="Confirmed by ${f.confirmations.length} people">(${f.confirmations.length}x)</span>` : ''}</td>
                <td>${f.labName}</td>
                <td>${htmlEscape(f.faultType)}</td>
                <td><span class="text-xs">${f.source === 'AUTO' ? 'Automatic' : 'User report'}</span></td>
                <td>${getFaultStatusBadge(f.status)}</td>
                <td><span class="status-badge ${f.priority === 'CRITICAL' ? 'critical' : f.priority === 'HIGH' ? 'warning' : 'healthy'}"><span class="dot"></span> ${f.priority}</span></td>
                ${isAdmin ? `<td>
                    <label class="sr-only" for="assign-${f.id}">Assign technician for report ${f.id}</label>
                    <select class="form-control" style="min-width:120px;" id="assign-${f.id}" onchange="assignFaultTo(${f.id}, this.value)">
                        <option value="">Unassigned</option>
                        ${technicians.map(t => `<option value="${t.id}" ${assignedTech && assignedTech.id === t.id ? 'selected' : ''}>${htmlEscape(t.name)}</option>`).join('')}
                    </select>
                </td>` : ''}
                <td>
                    <button class="btn btn-sm btn-primary" aria-label="View report ${f.id} details" title="View details" onclick="viewFault(${f.id})"><i class="fas fa-eye" aria-hidden="true"></i></button>
                    ${actions.map(([newStatus, label, icon, cls, noteRequired]) => `
                        <button class="btn btn-sm ${cls}" aria-label="${label} report ${f.id}" title="${label}" onclick="updateFaultStatus(${f.id},'${newStatus}',${noteRequired})"><i class="fas ${icon}" aria-hidden="true"></i></button>
                    `).join('')}
                </td>
            </tr>
        `;
        }).join('');
    }

    window.applyFaultFilters = renderFaultTable;

    window.viewFault = function(id) {
        const f = faults.find(f => f.id === id);
        if (!f) return;
        const detail = document.getElementById('faultDetail');
        detail.innerHTML = `<section class="card mt-2">
            <div class="flex-between"><h4>Report #${f.id} &middot; ${htmlEscape(f.faultType)}</h4>${getFaultStatusBadge(f.status)}</div>
            <p class="text-sm text-muted mt-1">${f.computerNumber} &middot; ${f.labName} &middot; Reported by ${htmlEscape(getUserName(f.reportedBy))} on ${new Date(f.reportedAt).toLocaleString()}</p>
            <p class="mt-1">${htmlEscape(f.description)}</p>
            <h5 class="mt-2">History</h5>
            <ul class="history-list">
                ${f.history.slice().reverse().map(h => `<li><strong>${h.status.replace('_',' ')}</strong> by ${htmlEscape(h.actorName || getUserName(h.by))} &middot; <span class="text-xs text-muted">${new Date(h.at).toLocaleString()}</span>${h.note ? `<br><span class="text-sm">${htmlEscape(h.note)}</span>` : ''}</li>`).join('')}
            </ul>
            <button class="btn btn-sm btn-outline mt-2" onclick="document.getElementById('faultDetail').innerHTML=''">Close</button>
        </section>`;
        detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    window.updateFaultStatus = function(id, newStatus, noteRequired) {
        const f = faults.find(f => f.id === id);
        if (!f || !isSupport()) return;
        const dialog = document.getElementById('faultStatusDialog');
        const noteField = document.getElementById('faultStatusNote');
        dialog.dataset.faultId = String(id);
        dialog.dataset.newStatus = newStatus;
        dialog.dataset.noteRequired = String(noteRequired);
        document.getElementById('faultStatusTitle').textContent = `Update report #${id} to ${newStatus.replace('_', ' ')}`;
        document.getElementById('faultStatusNoteLabel').textContent = noteRequired
            ? (newStatus === 'REOPENED' ? 'Why did the repair fail?' : 'Repair note')
            : 'Update note (optional)';
        noteField.required = noteRequired;
        noteField.value = '';
        noteField.setCustomValidity('');
        document.getElementById('faultStatusError').textContent = '';
        dialog.showModal();
        noteField.focus();
    };

    document.getElementById('faultStatusForm').onsubmit = event => {
        event.preventDefault();
        const dialog = document.getElementById('faultStatusDialog');
        const noteField = document.getElementById('faultStatusNote');
        const note = noteField.value.trim();
        const noteRequired = dialog.dataset.noteRequired === 'true';
        noteField.setCustomValidity(noteRequired && !note ? 'Add a note before confirming this update.' : '');
        if (!noteField.reportValidity()) return;
        const fault = faults.find(item => item.id === Number(dialog.dataset.faultId));
        const result = fault && changeFaultStatus(fault, dialog.dataset.newStatus, currentUser, note);
        if (!result || !result.ok) {
            document.getElementById('faultStatusError').textContent = result?.error || 'This report could not be updated.';
            return;
        }
        dialog.close();
        saveFaults();
        renderFaultTable();
    };

    window.assignFaultTo = function(id, technicianId) {
        const f = faults.find(f => f.id === id);
        if (!f || !isAdmin) return;
        if (!technicianId) { f.assignedTechnician = null; saveFaults(); return; }
        const result = assignFault(f, technicianId, currentUser);
        if (!result.ok) { alert(result.error); return; }
        saveFaults();
        renderFaultTable();
    };

    renderFaultTable();
}

