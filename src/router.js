function navigateTo(page, data = null) {
    document.body.classList.remove('signed-out');
    currentPage = page;
    renderSidebar();
    document.querySelectorAll('.sidebar-nav a[data-page]').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });

    const titles = {
        dashboard: 'Head node overview',
        labs: 'Cluster node map',
        myreports: 'My node reports',
        report: 'Report a node fault',
        faults: 'Cluster fault management',
        monitoring: 'Cluster overview',
        computers: 'Node management',
        users: 'User access',
        analytics: 'Cluster analytics',
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;
    document.getElementById('pageBreadcrumb').textContent = `LabConnect Agent / ${titles[page] || page}`;

    const container = document.getElementById('pages');
    if (page === 'dashboard') renderDashboard(container);
    else if (page === 'labs') renderLabs(container);
    else if (page === 'myreports') renderMyReports(container);
    else if (page === 'report') renderReportForm(container);
    else if (page === 'faults') renderFaults(container);
    else if (page === 'monitoring') renderMonitoring(container);
    else if (page === 'computers') renderComputers(container);
    else if (page === 'users') renderUsers(container);
    else if (page === 'analytics') renderAnalytics(container);
    else container.innerHTML = `<div class="alert alert-info">Page: ${page} — coming soon.</div>`;
}
