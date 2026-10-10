// Browser-only persistence. Replace this service with an API when adding a backend.
localStorage.removeItem('labconnect-agent-faults-v1');
try {
    const saved = JSON.parse(localStorage.getItem(DATA_KEY) || 'null');
    if (saved && Array.isArray(saved.users)) users = saved.users;
    if (saved && Array.isArray(saved.labs)) LABS.push(...saved.labs);
    if (saved && Array.isArray(saved.computers)) computers = saved.computers;
    if (saved && Array.isArray(saved.faults)) faults = saved.faults;
    faultId = faults.length ? Math.max(...faults.map(f => f.id)) + 1 : 1;
} catch { reportsPersisted = false; }

function saveData() {
    try { localStorage.setItem(DATA_KEY, JSON.stringify({ users, labs: LABS, computers, faults })); reportsPersisted=true; }
    catch { reportsPersisted=false; }
}
function saveFaults() { saveData(); }
if (!LABS.length && computers.length) {
    LABS.push({ id: 1, name: 'My cluster workspace', building: 'Local workspace', room: 'Cluster', total: computers.length });
    saveData();
}
function syncWorkspace() { saveData(); }
