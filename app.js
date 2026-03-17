const STORAGE_KEY = 'blogapp_auth_v1';

export function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function requireAuthOrRedirect() {
  const auth = getAuth();
  if (!auth?.token) {
    window.location.href = '/login.html';
    return null;
  }
  return auth;
}

export function requireAdminOrDeny({ redirectTo = '/index.html' } = {}) {
  const auth = requireAuthOrRedirect();
  if (!auth) return null;
  if (auth?.user?.role !== 'Admin') {
    // Keep a small signal for the UI (if the page wants to read it)
    sessionStorage.setItem('blogapp_last_denied', 'Access denied: Admins only');
    window.location.href = redirectTo;
    return null;
  }
  return auth;
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body != null) headers['Content-Type'] = 'application/json';

  const session = getAuth();
  if (auth && session?.token) headers.Authorization = `Bearer ${session.token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined
  });

  const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    const message = data?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function setNotice(el, { message, type = 'info' } = {}) {
  if (!el) return;
  if (!message) {
    el.textContent = '';
    el.className = 'notice';
    el.hidden = true;
    return;
  }
  el.textContent = message;
  el.className = `notice${type === 'error' ? ' error' : ''}`;
  el.hidden = false;
}

export function mountTopbar() {
  const auth = getAuth();
  const userLabel = auth?.user?.email ? `${auth.user.email} (${auth.user.role})` : 'Guest';

  const el = document.getElementById('topbar');
  if (!el) return;

  el.innerHTML = `
    <div class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="/index.html" aria-label="Go to dashboard">
          <span class="brand-badge" aria-hidden="true"></span>
          <span>BlogApp</span>
        </a>
        <div class="nav" id="nav"></div>
      </div>
    </div>
  `;

  const nav = document.getElementById('nav');
  if (!nav) return;

  const common = `
    <a href="/index.html">Dashboard</a>
    ${
      auth?.token
        ? `<a href="/myposts.html">My Posts</a><a class="primary" href="/create.html">Create</a>${
            auth?.user?.role === 'Admin' ? `<a href="/manage.html">Manage</a>` : ''
          }`
        : ''
    }
  `;

  nav.innerHTML = `
    ${common}
    <span class="chip" title="Current session">${escapeHtml(userLabel)}</span>
    ${
      auth?.token
        ? `<button type="button" id="logoutBtn">Logout</button>`
        : `<a class="primary" href="/login.html">Login</a><a href="/register.html">Register</a>`
    }
  `;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearAuth();
      window.location.href = '/login.html';
    });
  }
}

