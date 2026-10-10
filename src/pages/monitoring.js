function renderMonitoring(container) {
    container.innerHTML = `<div class="agent-intro"><div><div class="agent-eyebrow">Head node cluster view</div><h3>Every compute node under one control plane.</h3><p>Basic conditions across ${LABS.length} laboratories and ${computers.length} compute nodes.</p></div></div>
    <div class="stats-row">${[
        ['Compute nodes online', computers.filter(c => c.online).length],
        ['Network connected', computers.filter(c => c.network === 'CONNECTED').length],
        ['Low storage · below 25 GB', computers.filter(c => c.freeGB !== null && c.freeGB < 25).length],
        ['Services responding', computers.filter(c => c.agent === 'RESPONDING').length]
    ].map(([label, value]) => `<div class="stat-card"><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div>`).join('')}</div>
    <div class="agent-notice">Sample data · Missing readings are shown as unknown. Offline means no recent contact; it does not confirm a compute node is powered off.</div>
    <div class="agent-filter"><select id="previewLab" class="form-control" aria-label="Filter laboratory"><option value="ALL">All laboratories</option>${LABS.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}</select><select id="previewCondition" class="form-control" aria-label="Filter condition"><option value="ALL">All conditions</option><option value="HEALTHY">Checks passed</option><option value="ATTENTION">Needs attention</option></select><input id="previewSearch" class="form-control" aria-label="Search computer" placeholder="Search compute node name…" value="${htmlEscape(previewSearch)}"></div>
    <div class="table-wrap"><table><thead><tr><th>Compute node</th><th>Node status</th><th>Network</th><th>Storage free</th><th>Service</th><th>Last contact</th><th>Action</th></tr></thead><tbody id="previewRows"></tbody></table></div><p id="previewCount" class="text-sm text-muted mt-2" aria-live="polite"></p><div id="previewDetail"></div>`;
    document.getElementById('previewLab').value = previewLabFilter;
    document.getElementById('previewCondition').value = previewConditionFilter;
    document.getElementById('previewLab').onchange = e => { previewLabFilter = e.target.value; renderMonitoringRows(); };
    document.getElementById('previewCondition').onchange = e => { previewConditionFilter = e.target.value; renderMonitoringRows(); };
    document.getElementById('previewSearch').oninput = e => { previewSearch = e.target.value; renderMonitoringRows(); };
    renderMonitoringRows();
}
function renderMonitoringRows() {
    const list = computers.filter(c => (previewLabFilter === 'ALL' || c.labId === Number(previewLabFilter)) && (previewConditionFilter === 'ALL' || (previewConditionFilter === 'HEALTHY' ? c.status === 'HEALTHY' : c.status !== 'HEALTHY')) && c.hostname.toLowerCase().includes(previewSearch.toLowerCase()));
    document.getElementById('previewRows').innerHTML = list.map(c => `
        <tr>
            <td>
                <button class="agent-link" onclick="showPreviewComputer(${c.id})">${c.hostname}</button>
                <div class="text-xs text-muted">${c.id === localComputerId ? 'Head node' : 'Compute node'} · ${LABS.find(l => l.id === c.labId).name}</div>
            </td>
            <td>${c.online ? 'Online' : 'Offline'}</td>
            <td>${c.network === 'CONNECTED' ? 'Connected' : c.network === 'UNKNOWN' ? 'Unknown' : 'Unavailable'}</td>
            <td>${c.freeGB === null ? 'Unknown' : `${c.freeGB} GB / ${c.totalGB} GB`}</td>
            <td>${c.agent === 'RESPONDING' ? 'Responding' : c.agent === 'UNKNOWN' ? 'Unknown' : 'No response'}</td>
            <td>${agentTime(c.lastSeen)}</td>
            <td><button class="btn btn-sm" onclick="reportFaultForComputer(${c.id})">Report fault</button></td>
        </tr>`).join('') || '<tr><td colspan="7" class="text-center text-muted">No compute nodes match your filters.</td></tr>';
    document.getElementById('previewCount').textContent = `Showing ${list.length} of ${computers.length} compute nodes`;
    document.getElementById('previewDetail').innerHTML = '';
}
function showPreviewComputer(id) { const c = computers.find(c => c.id === id); if (c) { document.getElementById('previewDetail').innerHTML = renderComputerDetail(c); document.getElementById('previewDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } }
