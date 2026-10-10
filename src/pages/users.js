function renderUsers(container) {
    if (currentUser.role !== 'ADMIN') {
        container.innerHTML = `<div class="alert alert-info">Admin only.</div>`;
        return;
    }
    let html = `<h3 class="section-title">User access</h3><div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>`;
    users.forEach(u => {
        html += `<tr><td>${u.name}</td><td>${u.email}</td><td><span class="role-badge">${u.role}</span></td></tr>`;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
}
