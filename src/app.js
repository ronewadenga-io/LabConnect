// Start only after all page, component, and service scripts have loaded.
document.getElementById('logoutBtn').addEventListener('click', () => {
    currentUser = null;
    selectedLabId = null;
    selectedComputerId = null;
    renderSidebar();
    showLogin();
});


document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && !e.target.closest('#sidebarToggle')) {
        sidebar.classList.remove('open');
    }
});



window.navigateTo = navigateTo;
window.selectLab = selectLab;
window.selectComputer = selectComputer;
window.reportFaultForComputer = reportFaultForComputer;
STATUS_MAP.HEALTHY.label = 'Checks passed';
STATUS_MAP.WARNING.label = 'Needs attention';
restoreSession();
