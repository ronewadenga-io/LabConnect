const htmlEscape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function agentTime(value) { return new Date(value).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }
function getUserName(id) {
    if (id === 0) return 'System';
    const u = users.find(u => u.id === id);
    return u ? u.name : 'Unknown';
}
