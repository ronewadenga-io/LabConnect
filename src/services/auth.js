function isSupport() { return currentUser && ['TECHNICIAN','ADMIN'].includes(currentUser.role); }
async function hashPassword(password) {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}
function authRecords() { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]'); } catch { return []; } }
function saveAuth(records) { localStorage.setItem(AUTH_KEY, JSON.stringify(records)); }
function saveSession(user) { localStorage.setItem(SESSION_KEY, String(user.id)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }
function restoreSession() {
    const sessionId = localStorage.getItem(SESSION_KEY); const record = authRecords().find(user => user.id === sessionId);
    currentUser = record ? users.find(user => user.id === record.id) || record : null;
    if (!currentUser) return showLogin();
    renderSignedInChrome(); if (!currentUser.onboarded) showOnboarding(); else navigateTo('dashboard');
}
