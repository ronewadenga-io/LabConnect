function getStatusInfo(status) {
    return STATUS_MAP[status] || STATUS_MAP.HEALTHY;
}

function getStatusBadge(status) {
    const info = getStatusInfo(status);
    return `<span class="status-badge ${info.cls}"><span class="dot"></span> ${info.label}</span>`;
}

function getFaultStatusBadge(status) {
    const cls = status.toLowerCase().replace('_', '-');
    return `<span class="status-badge ${cls}"><span class="dot"></span> ${status.replace('_', ' ')}</span>`;
}
