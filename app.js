// ============================================================
//  MAIL MERGE PWA — app.js
//  Talks to the Apps Script backend via fetch(). See
//  MailMergePWA_Code.gs for the matching API.
// ============================================================

// The Apps Script backend URL is baked in — it's harmless on its
// own, since every action now requires a real, live Google sign-in
// session (see MailMergePWA_Code.gs doPost). No setup step needed.
const API_URL    = 'https://script.google.com/macros/s/AKfycbxv4Zxy4Pui9-5fU_SvzDfWh8iwvSrq7I09j80H7wVB3jOWW4WLnxsn1fppqZN4H35ebg/exec';
const LS_DRAFT    = 'mm_draft';

// ── API HELPER ────────────────────────────────────────────────
// Sent as text/plain to avoid a CORS preflight request, which
// Apps Script Web Apps don't handle. The signed-in user's email
// travels with every call so the backend can verify a live session.
async function apiCall(action, payload = {}) {
  const callerEmail = localStorage.getItem(LS_GOOGLE_EMAIL);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, payload: { ...payload, callerEmail } })
  });
  if (!res.ok) throw new Error('Network error: ' + res.status);
  return res.json();
}

// ── GOOGLE SIGN-IN (Phase 1) ──────────────────────────────────
const GOOGLE_CLIENT_ID = '849890350871-k7snt2bp3foj63sjenjueu5ekia6q7st.apps.googleusercontent.com';
const LS_GOOGLE_EMAIL  = 'mm_google_email';

// Used by every account-dependent load function to detect and discard
// stale responses — e.g. a request that started before you switched
// accounts, but resolves after a newer request for the new account.
function currentAccountToken() {
  return localStorage.getItem(LS_GOOGLE_EMAIL) || '';
}
const GOOGLE_SCOPES    = 'openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

let googleCodeClient = null;

function initGoogleSignIn() {
  if (!window.google || !google.accounts || !google.accounts.oauth2) {
    setTimeout(initGoogleSignIn, 300); // GIS script may still be loading
    return;
  }
  googleCodeClient = google.accounts.oauth2.initCodeClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: GOOGLE_SCOPES,
    ux_mode: 'popup',
    callback: async (response) => {
      if (response.error) {
        setHTML('googleResult', ib('info-red', '❌ ' + esc(response.error)));
        return;
      }
      setHTML('googleResult', sp() + 'Connecting…');
      try {
        const r = await apiCall('googleAuthExchange', { code: response.code });
        if (r.ok) {
          localStorage.setItem(LS_GOOGLE_EMAIL, r.email);
          updateGoogleStatus(true, r.email);
          setHTML('googleResult', ib('info-green', '✅ Connected as ' + esc(r.email)));
          refreshAllUserData();
        } else {
          setHTML('googleResult', ib('info-red', '❌ ' + esc(r.error)));
        }
      } catch (e) {
        setHTML('googleResult', ib('info-red', '❌ ' + esc(e.message)));
      }
    }
  });
}

// Re-loads every account-specific section of the app. Needed whenever
// the signed-in Google account changes within the same session (e.g.
// disconnect then connect a different account) — without this, every
// panel would keep showing whichever account's data loaded first.
function refreshAllUserData() {
  loadSheets();
  loadFolders();
  loadTemplates();
  loadSignature();
  loadNotifyEmail();
  loadAddressBookStatus();
  loadAliases();
}

function connectGoogle() {
  if (!googleCodeClient) { alert('Google sign-in is still loading — try again in a moment.'); return; }
  googleCodeClient.requestCode();
}

async function checkGoogleStatus() {
  const email = localStorage.getItem(LS_GOOGLE_EMAIL);
  if (!email) { updateGoogleStatus(false); return; }
  try {
    const r = await apiCall('checkGoogleSession', { email });
    updateGoogleStatus(r.connected, email);
  } catch (e) { updateGoogleStatus(false); }
}

function updateGoogleStatus(connected, email) {
  const statusEl = document.getElementById('googleStatus');
  const connectBtn = document.getElementById('btnGoogleConnect');
  const disconnectBtn = document.getElementById('btnGoogleDisconnect');
  if (connected) {
    statusEl.textContent = 'Connected as ' + email;
    statusEl.style.color = 'var(--success)';
    connectBtn.textContent = '🔄 Reconnect Google Account';
    disconnectBtn.style.display = 'block';
  } else {
    statusEl.textContent = 'Not connected';
    statusEl.style.color = '';
    connectBtn.textContent = '🔐 Connect Google Account';
    disconnectBtn.style.display = 'none';
  }
}

async function disconnectGoogle() {
  const email = localStorage.getItem(LS_GOOGLE_EMAIL);
  if (email) { try { await apiCall('disconnectGoogle', { email }); } catch (e) {} }
  localStorage.removeItem(LS_GOOGLE_EMAIL);
  updateGoogleStatus(false);
  setHTML('googleResult', ib('info-blue', 'Disconnected.'));
  refreshAllUserData();
}

function b64dec(s) {
  try {
    return decodeURIComponent(
      atob(s).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch (e) { return s; }
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function ib(cls, msg) { return `<div class="info-box ${cls}">${msg}</div>`; }
function sp() { return '<span class="spinner"></span> '; }
function setHTML(id, html) { document.getElementById(id).innerHTML = html; }

// ── THEME ─────────────────────────────────────────────────────
const LS_THEME = 'mm_theme';

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const darkBtn  = document.getElementById('themeOptionDark');
  const lightBtn = document.getElementById('themeOptionLight');
  if (darkBtn && lightBtn) {
    darkBtn.classList.toggle('active', theme !== 'light');
    lightBtn.classList.toggle('active', theme === 'light');
  }
}

function saveTheme(theme) {
  try { localStorage.setItem(LS_THEME, theme); } catch (e) {}
  applyTheme(theme);
}

function loadTheme() {
  let theme = 'dark';
  try { theme = localStorage.getItem(LS_THEME) || 'dark'; } catch (e) {}
  applyTheme(theme);
}

// ── SETUP SCREEN ──────────────────────────────────────────────
// No URL to enter anymore — the app loads straight away, and
// simply shows a "Connect Google Account" screen until you've
// signed in. Once connected, it stays connected (refresh token).

function checkSetup() {
  const email = localStorage.getItem(LS_GOOGLE_EMAIL);
  document.getElementById('app').style.display = 'block';
  initApp();
  if (!email) {
    switchTab('settings'); // land on Settings so the Connect button is visible
  }
}

// ── TABS ──────────────────────────────────────────────────────

function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
}

// ── ACTIVE STATE ──────────────────────────────────────────────

let activeSheetId = '';
let activeTemplateId = 'default';
let ahList = [];

function setActiveSheetState(id, name) {
  activeSheetId = id;
  document.getElementById('headerSub').textContent = id ? ('Active sheet: ' + name) : 'No sheet — ad-hoc only';
}

function setActiveTemplateState(id, label) {
  activeTemplateId = id;
  document.getElementById('activeTemplateLabel').textContent = label;
}

// ── DRAFT AUTOSAVE ────────────────────────────────────────────

let draftTimer = null;
function queueDraft() {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => {
    const d = {
      s: document.getElementById('subject').value,
      b: document.getElementById('body').value,
      t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem(LS_DRAFT, JSON.stringify(d));
    document.getElementById('draftIndicator').textContent = '💾 Saved ' + d.t;
  }, 800);
}
function loadDraft() {
  try {
    const raw = localStorage.getItem(LS_DRAFT);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (d.s) document.getElementById('subject').value = d.s;
    if (d.b) document.getElementById('body').value = d.b;
    if (d.s || d.b) document.getElementById('draftIndicator').textContent = '💾 Restored ' + (d.t || '');
  } catch (e) {}
}

// ── SHEETS ────────────────────────────────────────────────────

async function loadSheets() {
  const expectedAccount = currentAccountToken();
  setHTML('sheetList', sp() + 'Loading…');
  try {
    const r = await apiCall('getSheets');
    if (currentAccountToken() !== expectedAccount) return; // account changed mid-request
    if (!r.ok) { setHTML('sheetList', ib('info-red', '❌ ' + esc(r.error))); return; }
    renderSheets(r.list);
  } catch (e) {
    if (currentAccountToken() !== expectedAccount) return;
    setHTML('sheetList', ib('info-red', '❌ ' + esc(e.message)));
  }
}

function renderSheets(list) {
  list = list || [];
  const noneActive = !list.some(s => s.active);

  let h = `<div class="list-row">
    <input type="radio" name="sheetRadio" id="sheetRadioNone" ${noneActive ? 'checked' : ''}>
    <div class="list-row-info">
      <div class="list-row-name${noneActive ? ' active-text' : ''}">None — ad-hoc recipients only</div>
      <div class="list-row-sub">Don't use a contact sheet for this send</div>
    </div>
  </div>`;

  list.forEach((s, i) => {
    h += `<div class="list-row">
      <input type="radio" name="sheetRadio" data-idx="${i}" ${s.active ? 'checked' : ''}>
      <div class="list-row-info">
        <div class="list-row-name${s.active ? ' active-text' : ''}">${esc(s.name)}</div>
        <div class="list-row-sub">${esc(s.id)}</div>
      </div>
      <button class="list-row-delete" data-idx="${i}">✕</button>
    </div>`;
  });
  setHTML('sheetList', h);

  const active = list.find(s => s.active);
  if (active) setActiveSheetState(active.id, active.name);
  else setActiveSheetState('', '');

  document.getElementById('sheetRadioNone').addEventListener('change', selectNoSheet);
  document.querySelectorAll('#sheetList input[data-idx]').forEach(r =>
    r.addEventListener('change', () => activateSheet(parseInt(r.dataset.idx)))
  );
  document.querySelectorAll('#sheetList .list-row-delete').forEach(b =>
    b.addEventListener('click', () => deleteSheet(parseInt(b.dataset.idx)))
  );
}

async function selectNoSheet() {
  const r = await apiCall('setNoSheet');
  if (r.ok) renderSheets(r.list); else alert(r.error);
}

async function activateSheet(idx) {
  const r = await apiCall('setActiveSheet', { idx });
  if (r.ok) renderSheets(r.list); else alert(r.error);
}

async function deleteSheet(idx) {
  if (!confirm('Remove this sheet from the list?')) return;
  const r = await apiCall('deleteSheet', { idx });
  if (r.ok) renderSheets(r.list); else alert(r.error);
}

async function linkExistingSheet() {
  const url  = document.getElementById('newSheetUrl').value.trim();
  const name = document.getElementById('newSheetName').value.trim();
  setHTML('linkSheetResult', '');
  if (!url)  { setHTML('linkSheetResult', ib('info-red', 'Paste a Google Sheets URL first.')); return; }
  if (!name) { setHTML('linkSheetResult', ib('info-red', 'Enter a friendly name.')); return; }
  const parts = url.split('spreadsheets/d/');
  const id = parts.length > 1 ? parts[1].split('/')[0].split('?')[0] : url.trim();
  setHTML('linkSheetResult', sp() + 'Verifying…');
  try {
    const r = await apiCall('addSheet', { id, name });
    if (!r.ok) { setHTML('linkSheetResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    document.getElementById('newSheetUrl').value = '';
    document.getElementById('newSheetName').value = '';
    setHTML('linkSheetResult', ib('info-green', '✅ Linked: ' + esc(r.title)));
    renderSheets(r.list);
  } catch (e) { setHTML('linkSheetResult', ib('info-red', '❌ ' + esc(e.message))); }
}

async function createNewSheet() {
  const name = document.getElementById('newSheetCreate').value.trim();
  setHTML('createSheetResult', '');
  if (!name) { setHTML('createSheetResult', ib('info-red', 'Enter a name.')); return; }
  setHTML('createSheetResult', sp() + 'Creating…');
  try {
    const r = await apiCall('createSheet', { name });
    if (!r.ok) { setHTML('createSheetResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    document.getElementById('newSheetCreate').value = '';
    setHTML('createSheetResult', ib('info-green', `✅ Created: <strong>${esc(r.title)}</strong> — <a href="${esc(r.url)}" target="_blank" style="color:#86efac">Open</a>`));
    renderSheets(r.list);
  } catch (e) { setHTML('createSheetResult', ib('info-red', '❌ ' + esc(e.message))); }
}

// ── FOLDERS ───────────────────────────────────────────────────

async function loadFolders() {
  const expectedAccount = currentAccountToken();
  setHTML('folderList', sp() + 'Loading…');
  try {
    const r = await apiCall('getFolders');
    if (currentAccountToken() !== expectedAccount) return;
    if (!r.ok) { setHTML('folderList', ib('info-red', '❌ ' + esc(r.error))); return; }
    renderFolders(r.list);
  } catch (e) {
    if (currentAccountToken() !== expectedAccount) return;
    setHTML('folderList', ib('info-red', '❌ ' + esc(e.message)));
  }
}

function renderFolders(list) {
  if (!list || !list.length) {
    setHTML('folderList', '<p class="hint">No folders yet. Add one below.</p>');
    return;
  }
  let h = '';
  list.forEach((f, i) => {
    h += `<div class="list-row">
      <input type="checkbox" data-idx="${i}" ${f.active ? 'checked' : ''}>
      <div class="list-row-info">
        <div class="list-row-name">${esc(f.name)}</div>
        <div class="list-row-sub">${esc(f.id)}</div>
      </div>
      <button class="list-row-delete" data-idx="${i}">✕</button>
    </div>`;
  });
  setHTML('folderList', h);

  document.querySelectorAll('#folderList input[type=checkbox]').forEach(c =>
    c.addEventListener('change', () => apiCall('toggleFolder', { idx: parseInt(c.dataset.idx), active: c.checked }))
  );
  document.querySelectorAll('#folderList .list-row-delete').forEach(b =>
    b.addEventListener('click', async () => {
      if (!confirm('Remove this folder?')) return;
      const r = await apiCall('deleteFolder', { idx: parseInt(b.dataset.idx) });
      if (r.ok) renderFolders(r.list); else alert(r.error);
    })
  );
}

function activeFolderIds() {
  const ids = [];
  document.querySelectorAll('#folderList input[type=checkbox]').forEach((c, i) => {
    if (c.checked) {
      const row = c.closest('.list-row');
      ids.push(row.querySelector('.list-row-sub').textContent.trim());
    }
  });
  return ids;
}

async function addFolder() {
  const url  = document.getElementById('newFolderUrl').value.trim();
  const name = document.getElementById('newFolderName').value.trim();
  setHTML('addFolderResult', '');
  if (!url)  { setHTML('addFolderResult', ib('info-red', 'Paste a folder URL or ID first.')); return; }
  if (!name) { setHTML('addFolderResult', ib('info-red', 'Enter a friendly name.')); return; }
  const parts = url.split('folders/');
  const id = parts.length > 1 ? parts[1].split('?')[0].split('&')[0] : url.trim();
  setHTML('addFolderResult', sp() + 'Verifying…');
  try {
    const r = await apiCall('addFolder', { id, name });
    if (!r.ok) { setHTML('addFolderResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    document.getElementById('newFolderUrl').value = '';
    document.getElementById('newFolderName').value = '';
    setHTML('addFolderResult', ib('info-green', '✅ Added: ' + esc(r.folderName)));
    renderFolders(r.list);
  } catch (e) { setHTML('addFolderResult', ib('info-red', '❌ ' + esc(e.message))); }
}

// ── TEMPLATES ─────────────────────────────────────────────────

async function loadTemplates() {
  const expectedAccount = currentAccountToken();
  setHTML('templateGrid', sp() + 'Loading…');
  try {
    const r = await apiCall('getAllTemplates');
    if (currentAccountToken() !== expectedAccount) return;
    if (!r.ok) { setHTML('templateGrid', ib('info-red', '❌ ' + esc(r.error))); return; }
    renderTemplates(r.list, r.activeId);
  } catch (e) {
    if (currentAccountToken() !== expectedAccount) return;
    setHTML('templateGrid', ib('info-red', '❌ ' + esc(e.message)));
  }
}

function renderTemplates(list, activeId) {
  let h = '';
  list.forEach(t => {
    const isActive = t.id === activeId;
    if (isActive) setActiveTemplateState(t.id, `${t.icon} ${t.name}`);
    h += `<div class="template-card${isActive ? ' active' : ''}">
      <span class="template-icon">${t.icon}</span>
      <span class="template-name">${esc(t.name)}</span>
      <span class="template-badge">${t.builtin ? 'Built-in' : 'Custom'}</span>
      <div class="template-actions">
        <button class="btn-xs btn-secondary tmpl-use" data-id="${esc(t.id)}" data-name="${esc(t.icon + ' ' + t.name)}">Use</button>
        <button class="btn-xs btn-secondary tmpl-edit" data-id="${esc(t.id)}" data-name="${esc(t.icon + ' ' + t.name)}">Edit</button>
        ${!t.builtin ? `<button class="btn-xs btn-danger tmpl-del" data-id="${esc(t.id)}">✕</button>` : ''}
      </div>
    </div>`;
  });
  setHTML('templateGrid', h);

  document.querySelectorAll('.tmpl-use').forEach(b =>
    b.addEventListener('click', () => useTemplate(b.dataset.id, b.dataset.name))
  );
  document.querySelectorAll('.tmpl-edit').forEach(b =>
    b.addEventListener('click', () => editTemplate(b.dataset.id, b.dataset.name))
  );
  document.querySelectorAll('.tmpl-del').forEach(b =>
    b.addEventListener('click', () => deleteCustomTemplate(b.dataset.id))
  );
}

async function useTemplate(id, name) {
  const r = await apiCall('setActiveTemplate', { id });
  if (r.ok) {
    setActiveTemplateState(id, name);
    loadTemplates();
    setHTML('templateSelectResult', ib('info-green', '✅ Active template set to ' + esc(name)));
  } else {
    setHTML('templateSelectResult', ib('info-red', '❌ ' + esc(r.error)));
  }
}

async function editTemplate(id, name) {
  setHTML('templateEditResult', sp() + 'Loading template…');
  document.getElementById('editingTemplateLabel').textContent = 'Editing: ' + name;
  switchTab('settings');
  try {
    const r = await apiCall('getTemplateById', { id });
    if (!r.ok) { setHTML('templateEditResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    const editor = document.getElementById('templateEditor');
    editor.value = b64dec(r.encoded);
    editor.dataset.editingId = id;
    updateTemplatePreview();
    setHTML('templateEditResult', ib('info-green', '✅ Loaded — editing: ' + esc(name)));
  } catch (e) { setHTML('templateEditResult', ib('info-red', '❌ ' + esc(e.message))); }
}

async function deleteCustomTemplate(id) {
  if (!confirm('Delete this custom template?')) return;
  const r = await apiCall('deleteCustomTemplate', { id });
  if (r.ok) loadTemplates(); else alert(r.error);
}

async function createCustomTemplate() {
  const name = document.getElementById('newTemplateName').value.trim();
  const base = document.getElementById('newTemplateBase').value;
  setHTML('newTemplateResult', '');
  if (!name) { setHTML('newTemplateResult', ib('info-red', 'Enter a name for the template.')); return; }
  setHTML('newTemplateResult', sp() + 'Creating…');
  try {
    const r = await apiCall('createCustomTemplate', { name, baseId: base });
    if (!r.ok) { setHTML('newTemplateResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    document.getElementById('newTemplateName').value = '';
    setHTML('newTemplateResult', ib('info-green', '✅ Created! Tap Edit to customise it.'));
    loadTemplates();
  } catch (e) { setHTML('newTemplateResult', ib('info-red', '❌ ' + esc(e.message))); }
}

// Template editor (split view)
let tmplPreviewTimer = null;
function updateTemplatePreview() {
  clearTimeout(tmplPreviewTimer);
  tmplPreviewTimer = setTimeout(() => {
    const html = document.getElementById('templateEditor').value;
    const sample = 'Dear [Recipient Name],\n\nThis is a preview of your email message.\n\nKind regards';
    const preview = html
      .replace('{{body}}', sample.replace(/\n/g, '<br>'))
      .replace(/\{\{name\}\}/gi, '[Recipient Name]')
      .replace('{{unsubscribe}}', '#');
    document.getElementById('templatePreviewFrame').srcdoc = preview || '<p style="font-family:sans-serif;padding:20px;color:#999">Start typing HTML to see a live preview…</p>';
  }, 300);
}

async function saveTemplate() {
  const html = document.getElementById('templateEditor').value.trim();
  const id = document.getElementById('templateEditor').dataset.editingId;
  if (!id)  { setHTML('templateEditResult', ib('info-red', 'No template selected. Go to Templates tab and tap Edit first.')); return; }
  if (!html) { setHTML('templateEditResult', ib('info-red', 'Template is empty.')); return; }
  setHTML('templateEditResult', sp() + 'Saving…');
  try {
    const r = await apiCall('saveTemplateById', { id, html });
    setHTML('templateEditResult', r.ok ? ib('info-green', '✅ Template saved') : ib('info-red', '❌ ' + esc(r.error)));
  } catch (e) { setHTML('templateEditResult', ib('info-red', '❌ ' + esc(e.message))); }
}

async function resetTemplateToBuiltin() {
  const id = document.getElementById('templateEditor').dataset.editingId;
  if (!id) { setHTML('templateEditResult', ib('info-red', 'No template selected.')); return; }
  if (!confirm('Reset this template to its built-in default? Your edits will be lost.')) return;
  await apiCall('saveTemplateById', { id, html: '__RESET__' });
  const r2 = await apiCall('getTemplateById', { id });
  if (r2.ok) {
    document.getElementById('templateEditor').value = b64dec(r2.encoded);
    updateTemplatePreview();
    setHTML('templateEditResult', ib('info-green', '✅ Reset to built-in default'));
  }
}

function toggleTemplateFullscreen() {
  const editor = document.getElementById('splitEditor');
  editor.classList.toggle('fullscreen');
  const isFs = editor.classList.contains('fullscreen');
  document.getElementById('btnTemplateFullscreen').textContent = isFs ? '⛶ Exit Full Screen' : '⛶ Full Screen';
  document.body.style.overflow = isFs ? 'hidden' : '';
}

function initSplitDivider() {
  const divider = document.getElementById('splitDivider');
  const editor  = document.getElementById('splitEditor');
  const codePane = editor.querySelector('.split-code');
  let dragging = false, startX, startW;

  const start = (x) => { dragging = true; startX = x; startW = codePane.offsetWidth; divider.classList.add('dragging'); };
  const move  = (x) => {
    if (!dragging) return;
    const dx = x - startX;
    const newW = Math.max(120, Math.min(startW + dx, editor.offsetWidth - 130));
    codePane.style.width = newW + 'px';
    codePane.style.flex = 'none';
  };
  const end = () => { dragging = false; divider.classList.remove('dragging'); };

  divider.addEventListener('mousedown', (e) => { start(e.clientX); e.preventDefault(); });
  document.addEventListener('mousemove', (e) => move(e.clientX));
  document.addEventListener('mouseup', end);

  divider.addEventListener('touchstart', (e) => { start(e.touches[0].clientX); }, { passive: true });
  document.addEventListener('touchmove', (e) => move(e.touches[0].clientX));
  document.addEventListener('touchend', end);
}

// ── AD-HOC RECIPIENTS ─────────────────────────────────────────

function renderAdhoc() {
  if (!ahList.length) { setHTML('ahList', '<p class="hint">No ad-hoc recipients added yet.</p>'); return; }
  let h = '';
  ahList.forEach((a, i) => {
    h += `<div class="ah-row">
      <div class="ah-info">
        <div class="ah-name">${esc(a.name || a.email)}</div>
        <div class="ah-email">${esc(a.email)}</div>
      </div>
      <button class="list-row-delete" data-idx="${i}">✕</button>
    </div>`;
  });
  setHTML('ahList', h);
  document.querySelectorAll('#ahList .list-row-delete').forEach(b =>
    b.addEventListener('click', () => { ahList.splice(parseInt(b.dataset.idx), 1); renderAdhoc(); })
  );
}

async function addAdhoc() {
  const name  = document.getElementById('ahName').value.trim();
  const email = document.getElementById('ahEmail').value.trim();
  setHTML('ahResult', '');
  if (!email) { setHTML('ahResult', ib('info-red', 'Enter an email address.')); return; }
  if (ahList.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    setHTML('ahResult', ib('info-red', 'Already in the list.')); return;
  }
  ahList.push({ name, email });
  renderAdhoc();
  const save = document.getElementById('ahSave').checked;
  if (save) {
    try {
      const r = await apiCall('addRecipient', { name, email, sheetId: activeSheetId });
      setHTML('ahResult', r.ok ? ib('info-green', '✅ Saved to sheet') : ib('info-red', '❌ ' + esc(r.error)));
    } catch (e) { setHTML('ahResult', ib('info-red', '❌ ' + esc(e.message))); }
  }
  document.getElementById('ahName').value = '';
  document.getElementById('ahEmail').value = '';
}

// ── RECIPIENTS LIST ───────────────────────────────────────────

async function loadRecipientList() {
  setHTML('recipientList', sp() + 'Loading…');
  try {
    const r = await apiCall('getRecipients', { sheetId: activeSheetId });
    if (!r.ok) { setHTML('recipientList', ib('info-red', '❌ ' + esc(r.error))); return; }
    renderRecipientList(r.list);
  } catch (e) { setHTML('recipientList', ib('info-red', '❌ ' + esc(e.message))); }
}

function renderRecipientList(list) {
  if (!list || !list.length) { setHTML('recipientList', '<p class="hint">No recipients found.</p>'); return; }
  let h = '';
  list.forEach(r => {
    h += `<div class="rc-row">
      <div class="rc-name">${esc(r.name)}</div>
      <div class="rc-email">${esc(r.email)}</div>
      <div class="rc-status">${esc(r.status)}</div>
      <button class="list-row-delete" data-row="${r.row}">✕</button>
    </div>`;
  });
  setHTML('recipientList', h);
  document.querySelectorAll('#recipientList .list-row-delete').forEach(b =>
    b.addEventListener('click', async () => {
      if (!confirm('Remove this recipient?')) return;
      const r = await apiCall('deleteRecipient', { row: parseInt(b.dataset.row), sheetId: activeSheetId });
      if (r.ok) renderRecipientList(r.list); else alert(r.error);
    })
  );
}

async function addRecipient() {
  const name  = document.getElementById('recipientName').value.trim();
  const email = document.getElementById('recipientEmail').value.trim();
  setHTML('addRecipientResult', '');
  if (!email) { setHTML('addRecipientResult', ib('info-red', 'Enter an email address.')); return; }
  setHTML('addRecipientResult', sp() + 'Adding…');
  try {
    const r = await apiCall('addRecipient', { name, email, sheetId: activeSheetId });
    if (!r.ok) { setHTML('addRecipientResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    document.getElementById('recipientName').value = '';
    document.getElementById('recipientEmail').value = '';
    setHTML('addRecipientResult', ib('info-green', '✅ Added!'));
    renderRecipientList(r.list);
  } catch (e) { setHTML('addRecipientResult', ib('info-red', '❌ ' + esc(e.message))); }
}

// ── SHEET PICKER (shared: main sheets + address book) ──────────
let sheetPickerMode = 'main'; // 'main' or 'addressbook'

async function openSheetPickerModal(mode) {
  sheetPickerMode = mode;
  document.getElementById('sheetPickerModal').classList.add('open');
  setHTML('sheetPickerList', sp() + 'Loading…');
  try {
    const r = await apiCall('listMySheets');
    if (!r.ok) { setHTML('sheetPickerList', ib('info-red', '❌ ' + esc(r.error))); return; }
    if (!r.list.length) {
      setHTML('sheetPickerList', '<p class="hint">No sheets created through this app yet. Use "Create New Sheet" first, or paste an existing sheet\'s URL below instead.</p>');
      return;
    }
    renderSheetPickerList(r.list);
  } catch (e) { setHTML('sheetPickerList', ib('info-red', '❌ ' + esc(e.message))); }
}

function renderSheetPickerList(list) {
  let h = '';
  list.forEach(s => {
    const created = s.createdTime ? new Date(s.createdTime).toLocaleDateString() : '';
    h += `<div class="rc-row" style="cursor:pointer" data-id="${esc(s.id)}" data-name="${esc(s.name)}">
      <div style="flex:1;min-width:0">
        <div class="rc-name">${esc(s.name)}</div>
        <div class="hint" style="margin-top:2px">Created ${esc(created)}</div>
      </div>
    </div>`;
  });
  setHTML('sheetPickerList', h);
  document.querySelectorAll('#sheetPickerList .rc-row').forEach(row =>
    row.addEventListener('click', () => selectPickedSheet(row.dataset.id, row.dataset.name))
  );
}

function closeSheetPickerModal() {
  document.getElementById('sheetPickerModal').classList.remove('open');
}

async function selectPickedSheet(id, name) {
  setHTML('sheetPickerList', sp() + 'Linking…');
  try {
    if (sheetPickerMode === 'addressbook') {
      const r = await apiCall('linkAddressBookSheet', { id, name });
      closeSheetPickerModal();
      if (!r.ok) { setHTML('abLinkResult', ib('info-red', '❌ ' + esc(r.error))); return; }
      setHTML('abLinkResult', ib('info-green', '✅ Linked: ' + esc(r.name)));
      loadAddressBookStatus();
    } else {
      const r = await apiCall('addSheet', { id, name });
      closeSheetPickerModal();
      if (!r.ok) { setHTML('linkSheetResult', ib('info-red', '❌ ' + esc(r.error))); return; }
      setHTML('linkSheetResult', ib('info-green', '✅ Linked: ' + esc(r.title)));
      renderSheets(r.list);
    }
  } catch (e) {
    closeSheetPickerModal();
    setHTML(sheetPickerMode === 'addressbook' ? 'abLinkResult' : 'linkSheetResult', ib('info-red', '❌ ' + esc(e.message)));
  }
}

// ── FOLDER PICKER ────────────────────────────────────────────────

async function openFolderPickerModal() {
  document.getElementById('folderPickerModal').classList.add('open');
  setHTML('folderPickerList', sp() + 'Loading…');
  try {
    const r = await apiCall('listMyFolders');
    if (!r.ok) { setHTML('folderPickerList', ib('info-red', '❌ ' + esc(r.error))); return; }
    if (!r.list.length) {
      setHTML('folderPickerList', '<p class="hint">No folders found in your Drive. Create one below.</p>');
      return;
    }
    renderFolderPickerList(r.list);
  } catch (e) { setHTML('folderPickerList', ib('info-red', '❌ ' + esc(e.message))); }
}

function renderFolderPickerList(list) {
  let h = '';
  list.forEach(f => {
    h += `<div class="rc-row" style="cursor:pointer" data-id="${esc(f.id)}" data-name="${esc(f.name)}">
      <div class="rc-name">📁 ${esc(f.name)}</div>
    </div>`;
  });
  setHTML('folderPickerList', h);
  document.querySelectorAll('#folderPickerList .rc-row').forEach(row =>
    row.addEventListener('click', () => selectPickedFolder(row.dataset.id, row.dataset.name))
  );
}

function closeFolderPickerModal() {
  document.getElementById('folderPickerModal').classList.remove('open');
}

async function selectPickedFolder(id, name) {
  setHTML('folderPickerList', sp() + 'Adding…');
  try {
    const r = await apiCall('addFolder', { id, name });
    closeFolderPickerModal();
    if (!r.ok) { setHTML('addFolderResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    setHTML('addFolderResult', ib('info-green', '✅ Added: ' + esc(r.folderName)));
    renderFolders(r.list);
  } catch (e) {
    closeFolderPickerModal();
    setHTML('addFolderResult', ib('info-red', '❌ ' + esc(e.message)));
  }
}

async function createFolderFromPicker() {
  const name = document.getElementById('folderPickerNewName').value.trim();
  setHTML('folderPickerCreateResult', '');
  if (!name) { setHTML('folderPickerCreateResult', ib('info-red', 'Enter a folder name.')); return; }
  setHTML('folderPickerCreateResult', sp() + 'Creating…');
  try {
    const created = await apiCall('createFolderQuick', { name });
    if (!created.ok) { setHTML('folderPickerCreateResult', ib('info-red', '❌ ' + esc(created.error))); return; }
    const r = await apiCall('addFolder', { id: created.id, name: created.name });
    document.getElementById('folderPickerNewName').value = '';
    closeFolderPickerModal();
    if (!r.ok) { setHTML('addFolderResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    setHTML('addFolderResult', ib('info-green', '✅ Created and added: ' + esc(r.folderName)));
    renderFolders(r.list);
  } catch (e) {
    setHTML('folderPickerCreateResult', ib('info-red', '❌ ' + esc(e.message)));
  }
}

// ── ADDRESS BOOK ───────────────────────────────────────────────
let addressBookSheetId = '';

async function loadAddressBookStatus() {
  const expectedAccount = currentAccountToken();
  setHTML('addressBookStatus', sp() + 'Loading…');
  try {
    const r = await apiCall('getAddressBookSheet');
    if (currentAccountToken() !== expectedAccount) return;
    if (r.ok && r.sheet) {
      addressBookSheetId = r.sheet.id;
      setHTML('addressBookStatus', ib('info-green', '📖 Linked: ' + esc(r.sheet.name)));
    } else {
      addressBookSheetId = '';
      setHTML('addressBookStatus', '<p class="hint">No address book set up yet. Link or create one below.</p>');
    }
  } catch (e) {
    if (currentAccountToken() !== expectedAccount) return;
    setHTML('addressBookStatus', ib('info-red', '❌ ' + esc(e.message)));
  }
}

async function linkAddressBook() {
  const url  = document.getElementById('abNewUrl').value.trim();
  const name = document.getElementById('abNewName').value.trim();
  setHTML('abLinkResult', '');
  if (!url)  { setHTML('abLinkResult', ib('info-red', 'Paste a Google Sheets URL first.')); return; }
  if (!name) { setHTML('abLinkResult', ib('info-red', 'Enter a friendly name.')); return; }
  const parts = url.split('spreadsheets/d/');
  const id = parts.length > 1 ? parts[1].split('/')[0].split('?')[0] : url.trim();
  setHTML('abLinkResult', sp() + 'Verifying…');
  try {
    const r = await apiCall('linkAddressBookSheet', { id, name });
    if (!r.ok) { setHTML('abLinkResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    document.getElementById('abNewUrl').value = '';
    document.getElementById('abNewName').value = '';
    setHTML('abLinkResult', ib('info-green', '✅ Linked: ' + esc(r.name)));
    loadAddressBookStatus();
  } catch (e) { setHTML('abLinkResult', ib('info-red', '❌ ' + esc(e.message))); }
}

async function createAddressBook() {
  const name = document.getElementById('abCreateName').value.trim();
  setHTML('abCreateResult', '');
  if (!name) { setHTML('abCreateResult', ib('info-red', 'Enter a name.')); return; }
  setHTML('abCreateResult', sp() + 'Creating…');
  try {
    const r = await apiCall('createAddressBookSheet', { name });
    if (!r.ok) { setHTML('abCreateResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    document.getElementById('abCreateName').value = '';
    setHTML('abCreateResult', ib('info-green', `✅ Created: <strong>${esc(name)}</strong> — <a href="${esc(r.url)}" target="_blank" style="color:#86efac">Open</a>`));
    loadAddressBookStatus();
  } catch (e) { setHTML('abCreateResult', ib('info-red', '❌ ' + esc(e.message))); }
}

async function openAddressBookModal() {
  document.getElementById('addressBookModal').classList.add('open');
  document.getElementById('abSelectAll').checked = false;
  setHTML('abContactList', sp() + 'Loading…');
  try {
    const r = await apiCall('getAddressBookContacts');
    if (!r.ok) { setHTML('abContactList', ib('info-red', '❌ ' + esc(r.error))); return; }
    if (r.noSheet) {
      setHTML('abContactList', '<p class="hint">No address book set up yet. Go to Settings → Address Book to link or create one.</p>');
      return;
    }
    renderAddressBookContacts(r.list);
  } catch (e) { setHTML('abContactList', ib('info-red', '❌ ' + esc(e.message))); }
}

function renderAddressBookContacts(list) {
  if (!list || !list.length) {
    setHTML('abContactList', '<p class="hint">No contacts in your address book yet — add one below.</p>');
    return;
  }
  let h = '';
  list.forEach((c) => {
    const alreadyAdded = ahList.some(a => a.email.toLowerCase() === c.email.toLowerCase());
    h += `<div class="rc-row">
      <input type="checkbox" class="ab-contact-check" data-name="${esc(c.name)}" data-email="${esc(c.email)}" ${alreadyAdded ? 'checked disabled' : ''}>
      <div class="rc-name">${esc(c.name)}</div>
      <div class="rc-email">${esc(c.email)}</div>
      ${alreadyAdded ? '<span style="font-size:11px;color:var(--muted)">Added</span>' : ''}
    </div>`;
  });
  setHTML('abContactList', h);
}

function toggleSelectAllAddressBook() {
  const checked = document.getElementById('abSelectAll').checked;
  document.querySelectorAll('.ab-contact-check:not(:disabled)').forEach(c => { c.checked = checked; });
}

function addSelectedFromAddressBook() {
  const checks = document.querySelectorAll('.ab-contact-check:checked:not(:disabled)');
  let added = 0;
  checks.forEach(c => {
    const name = c.dataset.name, email = c.dataset.email;
    if (!ahList.some(a => a.email.toLowerCase() === email.toLowerCase())) {
      ahList.push({ name, email });
      added++;
    }
  });
  renderAdhoc();
  closeAddressBookModal();
  if (added) setHTML('ahResult', ib('info-green', `✅ Added ${added} contact(s) from Address Book`));
}

function closeAddressBookModal() {
  document.getElementById('addressBookModal').classList.remove('open');
}

async function quickAddToAddressBook() {
  const name  = document.getElementById('abQuickName').value.trim();
  const email = document.getElementById('abQuickEmail').value.trim();
  setHTML('abQuickAddResult', '');
  if (!email) { setHTML('abQuickAddResult', ib('info-red', 'Enter an email address.')); return; }
  if (!addressBookSheetId) { setHTML('abQuickAddResult', ib('info-red', 'Set up an Address Book sheet in Settings first.')); return; }
  setHTML('abQuickAddResult', sp() + 'Adding…');
  try {
    const r = await apiCall('addRecipient', { name, email, sheetId: addressBookSheetId });
    if (!r.ok) { setHTML('abQuickAddResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    document.getElementById('abQuickName').value = '';
    document.getElementById('abQuickEmail').value = '';
    setHTML('abQuickAddResult', ib('info-green', '✅ Added to Address Book'));
    renderAddressBookContacts(r.list);
  } catch (e) { setHTML('abQuickAddResult', ib('info-red', '❌ ' + esc(e.message))); }
}


// ── CSV IMPORT ────────────────────────────────────────────────

function handleCSVImport(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    setHTML('importResult', sp() + 'Importing…');
    try {
      const r = await apiCall('importCSV', { csvText: e.target.result, sheetId: activeSheetId });
      setHTML('importResult', r.ok
        ? ib('info-green', `✅ Added <strong>${r.added}</strong> contact(s)` + (r.skipped ? ` · ${r.skipped} skipped` : ''))
        : ib('info-red', '❌ ' + esc(r.error)));
    } catch (err) { setHTML('importResult', ib('info-red', '❌ ' + esc(err.message))); }
    input.value = '';
  };
  reader.readAsText(file);
}

// ── PREVIEW / COUNT ───────────────────────────────────────────

async function doPreviewRecipients() {
  showComposeAlert('info-blue', sp() + 'Counting…');
  try {
    const r = await apiCall('getCount', { sheetId: activeSheetId });
    if (!r.ok) { showComposeAlert('info-red', '❌ ' + esc(r.error)); return; }
    if (r.noSheet) {
      showComposeAlert('info-blue', 'No sheet selected — sending will only reach your ad-hoc recipients below.');
      document.getElementById('previewCard').style.display = 'none';
      return;
    }
    document.getElementById('statPending').textContent = r.pending;
    document.getElementById('statSent').textContent = r.sent;
    document.getElementById('previewCard').style.display = 'block';
    clearComposeAlert();
  } catch (e) { showComposeAlert('info-red', '❌ ' + esc(e.message)); }
}

async function doCount() {
  setHTML('countResult', ib('info-blue', sp() + 'Counting…'));
  try {
    const r = await apiCall('getCount', { sheetId: activeSheetId });
    if (r.ok && r.noSheet) { setHTML('countResult', ib('info-blue', 'No sheet selected.')); return; }
    setHTML('countResult', r.ok
      ? ib('info-blue', `👥 <strong>${r.pending}</strong> pending · <strong style="color:var(--success)">${r.sent}</strong> sent`)
      : ib('info-red', '❌ ' + esc(r.error)));
  } catch (e) { setHTML('countResult', ib('info-red', '❌ ' + esc(e.message))); }
}

// ── SEND / TEST ───────────────────────────────────────────────

function buildSendParams(testMode) {
  const subject = document.getElementById('subject').value.trim();
  const body    = document.getElementById('body').value.trim();
  const htmlMode = document.getElementById('htmlMode').checked;
  if (!subject) { showComposeAlert('info-red', 'Please enter a subject.'); switchTab('compose'); return null; }
  if (!body)    { showComposeAlert('info-red', 'Please enter a message.'); switchTab('compose'); return null; }
  return {
    subject, body,
    htmlMode,
    folderIds: activeFolderIds(),
    fromAddress: getFromAddress(),
    senderName: document.getElementById('senderName').value.trim(),
    labelName: document.getElementById('labelName').value.trim(),
    skipSent: document.getElementById('skipSent').checked,
    testMode,
    sheetId: activeSheetId,
    adhocList: ahList.slice(),
    templateId: activeTemplateId
  };
}

async function doTest() {
  const p = buildSendParams(true);
  if (!p) return;
  showComposeAlert('info-blue', sp() + 'Running test…');
  try {
    const r = await apiCall('send', p);
    showSendResult(r, true);
  } catch (e) { showComposeAlert('info-red', '❌ ' + esc(e.message)); }
}

async function doSend() {
  const p = buildSendParams(false);
  if (!p) return;
  if (!confirm('Send to all pending recipients? This cannot be undone.')) return;
  document.getElementById('btnSend').disabled = true;
  document.getElementById('progressWrap').style.display = 'block';
  animateProgress();
  showComposeAlert('info-blue', sp() + 'Sending…');
  try {
    const r = await apiCall('send', p);
    stopProgress();
    document.getElementById('btnSend').disabled = false;
    showSendResult(r, false);
  } catch (e) {
    stopProgress();
    document.getElementById('btnSend').disabled = false;
    showComposeAlert('info-red', '❌ ' + esc(e.message));
  }
}

function showSendResult(r, isTest) {
  clearComposeAlert();
  if (!r.ok) { setHTML('sendResult', ib('info-red', '❌ ' + esc(r.error))); return; }
  let msg = `${isTest ? 'Test done' : 'Done'} — Sent: <strong>${r.sent}</strong>`;
  if (r.skipped) msg += ` · Skipped: ${r.skipped}`;
  if (r.failed)  msg += ` · <span style="color:var(--danger)">Failed: ${r.failed}</span>`;
  setHTML('sendResult', ib(r.failed ? 'info-yellow' : 'info-green', msg));
  if (r.errors && r.errors.length) {
    document.getElementById('sendResult').innerHTML += ib('info-red', r.errors.join('<br>'));
  }
}

let progressInterval = null;
function animateProgress() {
  let w = 0;
  progressInterval = setInterval(() => {
    w = Math.min(w + Math.random() * 3, 90);
    document.getElementById('progressBar').style.width = w + '%';
  }, 400);
}
function stopProgress() {
  clearInterval(progressInterval);
  document.getElementById('progressBar').style.width = '100%';
  setTimeout(() => {
    document.getElementById('progressWrap').style.display = 'none';
    document.getElementById('progressBar').style.width = '0%';
  }, 600);
}

function showComposeAlert(cls, msg) { setHTML('composeAlert', ib(cls, msg)); }
function clearComposeAlert() { setHTML('composeAlert', ''); }

async function doResetStatuses() {
  if (!confirm('Reset all Sent/Failed statuses? Everyone will be re-sent to next time.')) return;
  try {
    const r = await apiCall('resetStatuses', { sheetId: activeSheetId });
    setHTML('countResult', r.ok ? ib('info-green', '✅ Statuses cleared.') : ib('info-red', '❌ ' + esc(r.error)));
  } catch (e) { setHTML('countResult', ib('info-red', '❌ ' + esc(e.message))); }
}

// ── PREVIEW MODAL ─────────────────────────────────────────────

function toggleBodyFullscreen() {
  const editor = document.getElementById('bodyEditor');
  editor.classList.toggle('fullscreen');
  const isFs = editor.classList.contains('fullscreen');
  document.body.style.overflow = isFs ? 'hidden' : '';
  if (isFs) document.getElementById('body').focus();
}

function updateHtmlModeUI() {
  const on = document.getElementById('htmlMode').checked;
  const textarea = document.getElementById('body');
  const hint = document.getElementById('bodyModeHint');
  const labelOff = document.getElementById('htmlModeLabelOff');
  const labelOn  = document.getElementById('htmlModeLabelOn');
  labelOff.style.color = on ? 'var(--muted)' : 'var(--accent)';
  labelOff.style.fontWeight = on ? '400' : '700';
  labelOn.style.color = on ? 'var(--accent)' : 'var(--muted)';
  labelOn.style.fontWeight = on ? '700' : '400';
  if (on) {
    textarea.style.fontFamily = "'Courier New', monospace";
    textarea.style.fontSize = '13px';
    textarea.placeholder = 'Paste your complete HTML email here — this replaces the template entirely.\n\nUse {{name}} and {{unsubscribe}} as placeholders.';
    hint.innerHTML = '<strong>Custom HTML</strong> — your template is bypassed. What you type here becomes the entire email exactly as written.';
  } else {
    textarea.style.fontFamily = '';
    textarea.style.fontSize = '';
    textarea.placeholder = 'Dear {{name}},\n\nPlease find the attached document.\n\nKind regards';
    hint.innerHTML = '<strong>Auto-template</strong> — use <strong>{{name}}</strong> to personalise. Your message is automatically placed inside your chosen template.';
  }
}

async function openPreviewModal() {
  const subject = document.getElementById('subject').value.trim();
  const body    = document.getElementById('body').value.trim();
  const htmlMode = document.getElementById('htmlMode').checked;
  if (!subject && !body) { alert('Enter a subject and message first.'); return; }
  document.getElementById('previewSubject').textContent = subject || '(no subject)';
  document.getElementById('previewModal').classList.add('open');
  document.getElementById('previewFrame').srcdoc = '<p style="font-family:sans-serif;padding:20px;color:#555"><em>Loading preview…</em></p>';

  if (htmlMode) {
    document.getElementById('previewFrame').srcdoc = body.replace(/\{\{name\}\}/gi, '[Recipient Name]');
  } else {
    try {
      const r = await apiCall('previewHtml', { body, templateId: activeTemplateId });
      document.getElementById('previewFrame').srcdoc = r.ok ? b64dec(r.encoded) : `<p style="padding:20px">${body.replace(/\n/g, '<br>')}</p>`;
    } catch (e) {
      document.getElementById('previewFrame').srcdoc = `<p style="padding:20px">${body.replace(/\n/g, '<br>')}</p>`;
    }
  }
}
function closePreviewModal() { document.getElementById('previewModal').classList.remove('open'); }

// ── SIGNATURE ─────────────────────────────────────────────────

async function loadSignature() {
  const expectedAccount = currentAccountToken();
  try {
    const r = await apiCall('getSignature');
    if (currentAccountToken() !== expectedAccount) return;
    if (!r.ok) return;
    const s = r.sig;
    document.getElementById('sigName').value    = s.name    || '';
    document.getElementById('sigTitle').value   = s.title   || '';
    document.getElementById('sigChurch').value  = s.church  || '';
    document.getElementById('sigWebsite').value = s.website || '';
  } catch (e) {}
}
async function saveSignature() {
  const sig = {
    name:    document.getElementById('sigName').value.trim(),
    title:   document.getElementById('sigTitle').value.trim(),
    church:  document.getElementById('sigChurch').value.trim(),
    website: document.getElementById('sigWebsite').value.trim(),
    email:   ''
  };
  try {
    const r = await apiCall('saveSignature', { sig });
    setHTML('sigResult', r.ok ? ib('info-green', '✅ Signature saved') : ib('info-red', '❌ ' + esc(r.error)));
  } catch (e) { setHTML('sigResult', ib('info-red', '❌ ' + esc(e.message))); }
}

// ── SEND FROM (Default account address or a verified alias) ────
// No Gmail settings scope needed: we don't fetch the alias list — the user
// picks "Default" (their account address) or types a verified alias, and we
// set it as the From header (gmail.send already permits verified aliases).

function getFromAddress() {
  const sel = document.getElementById('sendFromSelect');
  return sel ? sel.value : '';
}

function refreshSendFromDefault() {
  const email = localStorage.getItem(LS_GOOGLE_EMAIL) || '';
  const opt = document.querySelector('#sendFromSelect option[value=""]');
  if (opt && email) opt.textContent = 'Default — ' + email;
}

// ── SEND-FROM ALIASES (ownership-verified via emailed code) ────
let _aliasPending = '';

async function loadAliases() {
  refreshSendFromDefault();
  try {
    const r = await apiCall('getAliases');
    if (r.ok) renderAliases(r.list || []);
  } catch (e) {}
}

function renderAliases(list) {
  const email = localStorage.getItem(LS_GOOGLE_EMAIL) || 'your Gmail address';
  const sel = document.getElementById('sendFromSelect');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = '<option value="">Default — ' + esc(email) + '</option>'
      + list.map(a => `<option value="${esc(a)}">${esc(a)}</option>`).join('');
    if ([''].concat(list).indexOf(cur) !== -1) sel.value = cur;
  }
  const box = document.getElementById('aliasList');
  if (box) {
    box.innerHTML = list.length
      ? list.map(a => `<div class="alias-row"><span>${esc(a)}</span><button class="alias-remove" data-alias="${esc(a)}" title="Remove">✕</button></div>`).join('')
      : '<p class="hint">No aliases added yet.</p>';
    box.querySelectorAll('.alias-remove').forEach(b =>
      b.addEventListener('click', () => removeAlias(b.dataset.alias)));
  }
}

async function sendAliasCode() {
  const alias = document.getElementById('aliasInput').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alias)) {
    setHTML('aliasResult', ib('info-red', "That doesn't look like a valid email address.")); return;
  }
  setHTML('aliasResult', sp() + 'Sending code…');
  try {
    const r = await apiCall('sendAliasCode', { alias });
    if (!r.ok) { setHTML('aliasResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    _aliasPending = alias;
    document.getElementById('aliasPendingLabel').textContent = alias;
    document.getElementById('aliasCodeArea').style.display = 'block';
    setHTML('aliasResult', ib('info-green', '✅ Code sent to ' + esc(alias) + '. Open that inbox and enter the code below.'));
  } catch (e) { setHTML('aliasResult', ib('info-red', '❌ ' + esc(e.message))); }
}

async function verifyAliasCode() {
  if (!_aliasPending) { setHTML('aliasResult', ib('info-red', 'Send a code first.')); return; }
  const code = document.getElementById('aliasCodeInput').value.trim();
  setHTML('aliasResult', sp() + 'Verifying…');
  try {
    const r = await apiCall('verifyAliasCode', { alias: _aliasPending, code });
    if (!r.ok) { setHTML('aliasResult', ib('info-red', '❌ ' + esc(r.error))); return; }
    setHTML('aliasResult', ib('info-green', '🎉 ' + esc(_aliasPending) + ' verified and added! Make sure it\'s also a "Send mail as" address in your Gmail so sends go out as it.'));
    document.getElementById('aliasInput').value = '';
    document.getElementById('aliasCodeInput').value = '';
    document.getElementById('aliasCodeArea').style.display = 'none';
    _aliasPending = '';
    renderAliases(r.list || []);
  } catch (e) { setHTML('aliasResult', ib('info-red', '❌ ' + esc(e.message))); }
}

async function removeAlias(alias) {
  try {
    const r = await apiCall('removeAlias', { alias });
    if (r.ok) renderAliases(r.list || []);
  } catch (e) {}
}

// ── NOTIFY EMAIL ──────────────────────────────────────────────

async function loadNotifyEmail() {
  const expectedAccount = currentAccountToken();
  try {
    const r = await apiCall('getNotifyEmail');
    if (currentAccountToken() !== expectedAccount) return;
    if (r.ok && r.email) document.getElementById('notifyEmail').value = r.email;
  } catch (e) {}
}
async function saveNotifyEmail() {
  const email = document.getElementById('notifyEmail').value.trim();
  if (!email) { setHTML('notifyResult', ib('info-red', 'Enter your email address.')); return; }
  try {
    const r = await apiCall('saveNotifyEmail', { email });
    setHTML('notifyResult', r.ok ? ib('info-green', '✅ Saved') : ib('info-red', '❌ ' + esc(r.error)));
  } catch (e) { setHTML('notifyResult', ib('info-red', '❌ ' + esc(e.message))); }
}

// ── INIT ──────────────────────────────────────────────────────

function initApp() {
  // Tabs
  document.querySelectorAll('.tab').forEach(t =>
    t.addEventListener('click', () => switchTab(t.dataset.tab))
  );
  document.querySelectorAll('[data-goto-tab]').forEach(b =>
    b.addEventListener('click', () => switchTab(b.dataset.gotoTab))
  );

  // Compose
  document.getElementById('subject').addEventListener('input', queueDraft);
  document.getElementById('body').addEventListener('input', queueDraft);
  document.getElementById('btnPreviewEmail').addEventListener('click', openPreviewModal);
  document.getElementById('btnBodyExpand').addEventListener('click', toggleBodyFullscreen);
  document.getElementById('btnBodyExit').addEventListener('click', toggleBodyFullscreen);
  document.getElementById('htmlMode').addEventListener('change', updateHtmlModeUI);
  updateHtmlModeUI(); // set correct initial state
  document.getElementById('btnPreview').addEventListener('click', doPreviewRecipients);
  document.getElementById('btnTest').addEventListener('click', doTest);
  document.getElementById('btnSend').addEventListener('click', doSend);
  document.getElementById('btnAhAdd').addEventListener('click', addAdhoc);
  document.getElementById('btnOpenAddressBook').addEventListener('click', openAddressBookModal);

  // Labeled emails modal

  // Address Book modal
  document.getElementById('btnAbModalClose').addEventListener('click', closeAddressBookModal);
  document.getElementById('abSelectAll').addEventListener('change', toggleSelectAllAddressBook);
  document.getElementById('btnAbAddSelected').addEventListener('click', addSelectedFromAddressBook);
  document.getElementById('btnAbQuickAdd').addEventListener('click', quickAddToAddressBook);
  document.getElementById('addressBookModal').addEventListener('click', function (e) { if (e.target === this) closeAddressBookModal(); });

  // Preview modal
  document.getElementById('btnModalClose').addEventListener('click', closePreviewModal);
  document.getElementById('btnModalSend').addEventListener('click', () => { closePreviewModal(); doSend(); });
  document.getElementById('btnModalTest').addEventListener('click', () => { closePreviewModal(); doTest(); });
  document.getElementById('previewModal').addEventListener('click', function (e) { if (e.target === this) closePreviewModal(); });

  // Templates
  document.getElementById('btnCreateTemplate').addEventListener('click', createCustomTemplate);
  document.getElementById('btnCopyUnsub').addEventListener('click', () => {
    navigator.clipboard.writeText('{{unsubscribe}}')
      .then(() => setHTML('unsubCopyResult', ib('info-green', '✅ Copied to clipboard')))
      .catch(() => setHTML('unsubCopyResult', ib('info-blue', 'Copy this: {{unsubscribe}}')));
  });

  // Template editor (Settings)
  document.getElementById('templateEditor').addEventListener('input', updateTemplatePreview);
  document.getElementById('templateEditor').addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = this.selectionStart, end = this.selectionEnd;
      this.value = this.value.substring(0, s) + '  ' + this.value.substring(end);
      this.selectionStart = this.selectionEnd = s + 2;
    }
  });
  document.getElementById('btnTemplateSave').addEventListener('click', saveTemplate);
  document.getElementById('btnTemplateReset').addEventListener('click', resetTemplateToBuiltin);
  document.getElementById('btnTemplateFullscreen').addEventListener('click', toggleTemplateFullscreen);
  document.getElementById('btnTemplateExit').addEventListener('click', toggleTemplateFullscreen);
  initSplitDivider();
  document.getElementById('templatePreviewFrame').srcdoc = '<p style="font-family:sans-serif;padding:20px;color:#999">Select a template and tap Edit to load it here…</p>';

  // Attach
  document.getElementById('btnAddFolder').addEventListener('click', addFolder);
  document.getElementById('btnBrowseFolders').addEventListener('click', openFolderPickerModal);
  document.getElementById('btnFolderPickerClose').addEventListener('click', closeFolderPickerModal);
  document.getElementById('btnFolderPickerCreate').addEventListener('click', createFolderFromPicker);
  document.getElementById('folderPickerModal').addEventListener('click', function (e) { if (e.target === this) closeFolderPickerModal(); });

  // Contacts
  document.getElementById('btnLinkSheet').addEventListener('click', linkExistingSheet);
  document.getElementById('btnCreateSheet').addEventListener('click', createNewSheet);
  document.getElementById('btnBrowseSheetsMain').addEventListener('click', () => openSheetPickerModal('main'));
  document.getElementById('csvFile').addEventListener('change', function () { handleCSVImport(this); });
  document.getElementById('btnAddRecipient').addEventListener('click', addRecipient);
  document.getElementById('btnLoadRecipients').addEventListener('click', loadRecipientList);
  document.getElementById('btnCount').addEventListener('click', doCount);
  document.getElementById('btnResetStatuses').addEventListener('click', doResetStatuses);

  // Shared sheet picker modal
  document.getElementById('btnSheetPickerClose').addEventListener('click', closeSheetPickerModal);
  document.getElementById('sheetPickerModal').addEventListener('click', function (e) { if (e.target === this) closeSheetPickerModal(); });

  // Settings
  document.getElementById('btnSigSave').addEventListener('click', saveSignature);
  document.getElementById('btnNotifySave').addEventListener('click', saveNotifyEmail);
  document.getElementById('btnGoogleConnect').addEventListener('click', connectGoogle);
  document.getElementById('btnGoogleDisconnect').addEventListener('click', disconnectGoogle);
  document.getElementById('btnAbLink').addEventListener('click', linkAddressBook);
  document.getElementById('btnAbCreate').addEventListener('click', createAddressBook);
  document.getElementById('btnBrowseSheetsAB').addEventListener('click', () => openSheetPickerModal('addressbook'));
  document.getElementById('themeOptionDark').addEventListener('click', () => saveTheme('dark'));
  document.getElementById('themeOptionLight').addEventListener('click', () => saveTheme('light'));
  loadTheme(); // sets the active highlight on the correct theme button

  // Load initial data
  loadDraft();
  loadSheets();
  loadFolders();
  loadTemplates();
  loadSignature();
  loadNotifyEmail();
  loadAddressBookStatus();
  loadAliases();
  var _bSend=document.getElementById('btnSendAliasCode'); if(_bSend) _bSend.addEventListener('click', sendAliasCode);
  var _bVer=document.getElementById('btnVerifyAliasCode'); if(_bVer) _bVer.addEventListener('click', verifyAliasCode);
  renderAdhoc();
  initGoogleSignIn();
  checkGoogleStatus();
}

// ── BOOTSTRAP ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  checkSetup();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      // Force an immediate check for a newer sw.js every time the app
      // opens, bypassing the browser's normal ~24-hour update throttle.
      reg.update();
    }).catch(() => {});
  }
});
