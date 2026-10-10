function showAuthError(message) { const target = document.getElementById('authError'); if (target) target.innerHTML = `<div class="alert alert-danger">${message}</div>`; }

function showLogin(mode = 'login') {
    document.body.classList.add('signed-out');
    document.getElementById('pageTitle').textContent = mode === 'signup' ? 'Create your workspace' : 'Welcome back';
    document.getElementById('pageBreadcrumb').textContent = `LabConnect / ${mode === 'signup' ? 'Create account' : 'Sign in'}`;
    document.getElementById('sidebarNav').innerHTML = '';
    document.querySelector('.topbar-right').innerHTML = '';
    const container = document.getElementById('pages');
    container.innerHTML = `<div class="login-layout"><section class="login-story"><span class="eyebrow">A connected cluster</span><h2>Head node control.<br>Compute node insight.</h2><p>A private workspace for your head node, compute nodes and support workflows.</p><div class="story-footer"><i class="fas fa-circle-nodes" aria-hidden="true"></i> &nbsp; Your data stays in this browser</div></section><div class="card auth-card"><div class="auth-tabs"><button class="auth-tab ${mode === 'login' ? 'active' : ''}" data-auth-mode="login">Sign in</button><button class="auth-tab ${mode === 'signup' ? 'active' : ''}" data-auth-mode="signup">Create account</button></div><h3>${mode === 'signup' ? 'Create your account' : 'Sign in to LabConnect'}</h3><p class="text-sm text-muted">${mode === 'signup' ? 'Start with a private browser workspace.' : 'Continue to your local cluster workspace.'}</p><form id="authForm" novalidate><div class="form-group"><label for="authName" ${mode === 'login' ? 'hidden' : ''}>Full name</label><input class="form-control" id="authName" autocomplete="name" ${mode === 'signup' ? 'required' : 'hidden'}></div><div class="form-group"><label for="authEmail">Email</label><input class="form-control" id="authEmail" type="email" autocomplete="email" required></div><div class="form-group"><label for="authPassword">Password</label><input class="form-control" id="authPassword" type="password" autocomplete="new-password" minlength="8" required></div>${mode === 'signup' ? '<div class="form-group"><label for="authRole">Workspace role</label><select class="form-control" id="authRole"><option value="STUDENT">Student</option><option value="LECTURER">Lecturer</option><option value="TECHNICIAN">Lab technician</option><option value="ADMIN">IT administrator</option></select></div>' : ''}<button class="btn btn-teal auth-submit" type="submit"><i class="fas fa-${mode === 'signup' ? 'user-plus' : 'sign-in-alt'}"></i> ${mode === 'signup' ? 'Create account' : 'Sign in'}</button></form><div id="authError" class="mt-2"></div><p class="auth-storage-note"><i class="fas fa-lock"></i> Passwords are hashed locally. No server or demo account is connected.</p></div></div>`;
    const form = document.getElementById('authForm');
    const emailInput = document.getElementById('authEmail');
    document.querySelectorAll('[data-auth-mode]').forEach(button => button.onclick = () => showLogin(button.dataset.authMode));
    emailInput.addEventListener('input', () => {
        const errorEl = document.getElementById('authError');
        if (errorEl) errorEl.innerHTML = '';
    });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        const password = document.getElementById('authPassword').value;
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            showAuthError('Please enter a valid email address.');
            emailInput.focus();
            return;
        }
        if (!password || password.length < 8) {
            showAuthError('Password must be at least 8 characters long.');
            document.getElementById('authPassword').focus();
            return;
        }
        const records = authRecords();
        if (mode === 'signup') {
            const name = document.getElementById('authName').value.trim();
            if (!name) {
                showAuthError('Please enter your full name.');
                document.getElementById('authName').focus();
                return;
            }
            if (records.some(record => record.email === email)) return showAuthError('An account with this email already exists.');
            const user = { id: crypto.randomUUID(), name, email, role: document.getElementById('authRole').value, initials: name.charAt(0).toUpperCase(), onboarded: false };
            records.push({ ...user, passwordHash: await hashPassword(password) });
            users.push(user); saveAuth(records); syncWorkspace(); currentUser = user; saveSession(user); showOnboarding();
            return;
        }
        const record = records.find(candidate => candidate.email === email);
        if (!record || record.passwordHash !== await hashPassword(password)) return showAuthError('Email or password is incorrect.');
        currentUser = users.find(user => user.id === record.id) || record;
        saveSession(currentUser); document.body.classList.remove('signed-out'); renderSignedInChrome();
        if (!currentUser.onboarded) showOnboarding(); else navigateTo('dashboard');
    });
}
