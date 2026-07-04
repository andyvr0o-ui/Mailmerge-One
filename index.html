// ============================================================
//  MAIL MERGE PWA — app.js
//  Talks to the Apps Script backend via fetch(). See
//  MailMergePWA_Code.gs for the matching API.
// ============================================================

const LS_API_URL = 'mm_api_url';
const LS_DRAFT    = 'mm_draft';

// ── API HELPER ────────────────────────────────────────────────
// Sent as text/plain to avoid a CORS preflight request, which
// Apps Script Web Apps don't handle. The backend still parses
// the body as JSON.
async function apiCall(action, payload = {}) {
  const url = localStorage.getItem(LS_API_URL);
  if (!url) throw new Error('API URL not configured.');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, payload })
  });
  if (!res.ok) throw new Error('Network error: ' + res.status);
  return res.json();
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

// ── SETUP SCREEN ──────────────────────────────────────────────

function checkSetup() {
  const url = localStorage.getItem(LS_API_URL);
  if (url) {
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('apiUrlSetting').value = url;
    initApp();
  } else {
    document.getElementById('setupScreen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
}

function saveSetupUrl() {
  const url = document.getElementById('setupApiUrl').value.trim();
  if (!url) {
    setHTML('setupResult', ib('info-red', 'Paste your Apps Script Web App URL first.'));
    return;
  }
  if (!url.includes('script.google.com')) {
    setHTML('setupResult', ib('info-yellow', 'That doesn\'t look like a script.google.com URL — continuing anyway.'));
  }
  localStorage.setItem(LS_API_URL, url);
  checkSetup();
}

function saveApiUrlFromSettings() {
  const url = document.getElementById('apiUrlSetting').value.trim();
  if (!url) { setHTML('apiUrlResult', ib('info-red', 'Enter a URL.')); return; }
  localStorage.setItem(LS_API_URL, url);
  setHTML('apiUrlResult', ib('info-green', '✅ API URL updated.'));
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
  document.getElementById('headerSub').textContent = 'Active sheet: ' + name;
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
    if (d.b) { document.getElementById('body').value = d.b; growTextarea(document.getElementById('body')); }
    if (d.s || d.b) document.getElementById('draftIndicator').textContent = '💾 Restored ' + (d.t || '');
  } catch (e) {}
}
function growTextarea(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

// ── SHEETS ────────────────────────────────────────────────────

async function loadSheets() {
  setHTML('sheetList', sp() + 'Loading…');
  try {
    const r = await apiCall('getSheets');
    if (!r.ok) { setHTML('sheetList', ib('info-red', '❌ ' + esc(r.error))); return; }
    renderSheets(r.list);
  } catch (e) { setHTML('sheetList', ib('info-red', '❌ ' + esc(e.message))); }
}

function renderSheets(list) {
  if (!list || !list.length) {
    setHTML('sheetList', '<p class="hint">No sheets yet. Link an existing one or create a new one below.</p>');
    document.getElementById('headerSub').textContent = 'No sheet selected';
    return;
  }
  let h = '';
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

  document.querySelectorAll('#sheetList input[type=radio]').forEach(r =>
    r.addEventListener('change', () => activateSheet(parseInt(r.dataset.idx)))
  );
  document.querySelectorAll('#sheetList .list-row-delete').forEach(b =>
    b.addEventListener('click', () => deleteSheet(parseInt(b.dataset.idx)))
  );
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
  setHTML('folderList', sp() + 'Loading…');
  try {
    const r = await apiCall('getFolders');
    if (!r.ok) { setHTML('folderList', ib('info-red', '❌ ' + esc(r.error))); return; }
    renderFolders(r.list);
  } catch (e) { setHTML('folderList', ib('info-red', '❌ ' + esc(e.message))); }
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
  setHTML('templateGrid', sp() + 'Loading…');
  try {
    const r = await apiCall('getAllTemplates');
    if (!r.ok) { setHTML('templateGrid', ib('info-red', '❌ ' + esc(r.error))); return; }
    renderTemplates(r.list, r.activeId);
  } catch (e) { setHTML('templateGrid', ib('info-red', '❌ ' + esc(e.message))); }
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
    setHTML('countResult', r.ok
      ? ib('info-blue', `👥 <strong>${r.pending}</strong> pending · <strong style="color:var(--success)">${r.sent}</strong> sent`)
      : ib('info-red', '❌ ' + esc(r.error)));
  } catch (e) { setHTML('countResult', ib('info-red', '❌ ' + esc(e.message))); }
}

// ── SEND / TEST ───────────────────────────────────────────────

function buildSendParams(testMode) {
  const subject = document.getElementById('subject').value.trim();
  const body    = document.getElementById('body').value.trim();
  if (!subject) { showComposeAlert('info-red', 'Please enter a subject.'); switchTab('compose'); return null; }
  if (!body)    { showComposeAlert('info-red', 'Please enter a message.'); switchTab('compose'); return null; }
  return {
    subject, body,
    folderIds: activeFolderIds(),
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
  try {
    const r = await apiCall('getSignature');
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

// ── NOTIFY EMAIL ──────────────────────────────────────────────

async function loadNotifyEmail() {
  try {
    const r = await apiCall('getNotifyEmail');
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
  document.getElementById('body').addEventListener('input', function () { growTextarea(this); queueDraft(); });
  document.getElementById('btnPreviewEmail').addEventListener('click', openPreviewModal);
  document.getElementById('btnPreview').addEventListener('click', doPreviewRecipients);
  document.getElementById('btnTest').addEventListener('click', doTest);
  document.getElementById('btnSend').addEventListener('click', doSend);
  document.getElementById('btnAhAdd').addEventListener('click', addAdhoc);

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

  // Contacts
  document.getElementById('btnLinkSheet').addEventListener('click', linkExistingSheet);
  document.getElementById('btnCreateSheet').addEventListener('click', createNewSheet);
  document.getElementById('csvFile').addEventListener('change', function () { handleCSVImport(this); });
  document.getElementById('btnAddRecipient').addEventListener('click', addRecipient);
  document.getElementById('btnLoadRecipients').addEventListener('click', loadRecipientList);
  document.getElementById('btnCount').addEventListener('click', doCount);
  document.getElementById('btnResetStatuses').addEventListener('click', doResetStatuses);

  // Settings
  document.getElementById('btnSigSave').addEventListener('click', saveSignature);
  document.getElementById('btnNotifySave').addEventListener('click', saveNotifyEmail);
  document.getElementById('btnApiUrlSave').addEventListener('click', saveApiUrlFromSettings);

  // Load initial data
  loadDraft();
  loadSheets();
  loadFolders();
  loadTemplates();
  loadSignature();
  loadNotifyEmail();
  renderAdhoc();
}

// ── BOOTSTRAP ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnSetupSave').addEventListener('click', saveSetupUrl);
  checkSetup();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
