:root {
  --bg: #0f1923;
  --surface: #1a2535;
  --border: #2a3a50;
  --accent: #3b82f6;
  --success: #22c55e;
  --danger: #ef4444;
  --warn: #f59e0b;
  --text: #e2e8f0;
  --muted: #64748b;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
  font-size: 15px;
  line-height: 1.5;
}

/* Header */
.hdr {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 14px 18px 10px;
  position: sticky;
  top: 0;
  z-index: 10;
}
.hdr h1 { font-size: 19px; font-weight: 700; }
.hdr p { font-size: 12px; color: var(--muted); margin-top: 2px; }

/* Tabs */
.tabs {
  display: flex;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  position: sticky;
  top: 57px;
  z-index: 9;
}
.tabs::-webkit-scrollbar { display: none; }
.tab {
  flex: 1;
  min-width: 68px;
  padding: 10px 4px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  font-family: inherit;
  white-space: nowrap;
}
.tab .icon { display: block; font-size: 17px; margin-bottom: 2px; }
.tab.active { color: var(--accent); border-bottom-color: var(--accent); }

/* Panels */
.panel { display: none; padding: 14px; max-width: 600px; margin: 0 auto; }
.panel.active { display: block; }

/* Cards */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
}
.card-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--muted);
  margin-bottom: 10px;
}

/* Form elements */
label.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  margin: 12px 0 5px;
}
label.field-label:first-child { margin-top: 0; }

input[type=text], input[type=email], textarea, select {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 15px;
  color: var(--text);
  font-family: inherit;
  outline: none;
}
input[type=text]:focus, input[type=email]:focus, textarea:focus, select:focus {
  border-color: var(--accent);
}
textarea { resize: vertical; min-height: 80px; line-height: 1.6; }

.hint { font-size: 12px; color: var(--muted); margin-top: 5px; line-height: 1.5; }

/* Buttons */
.btn {
  display: block;
  width: 100%;
  padding: 13px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  text-align: center;
  margin-top: 10px;
  font-family: inherit;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-secondary { background: var(--surface); color: var(--accent); border: 2px solid var(--accent); }
.btn-danger { background: var(--danger); color: #fff; }
.btn-sm { display: inline-block; width: auto; padding: 8px 14px; font-size: 13px; margin-top: 0; }
.btn-xs { display: inline-block; width: auto; padding: 5px 10px; font-size: 12px; margin-top: 0; border-radius: 6px; }

.row { display: flex; gap: 8px; align-items: flex-start; }
.row input { flex: 1; }

/* Info boxes */
.info-box { border-radius: 8px; padding: 11px 13px; font-size: 13px; line-height: 1.5; margin-top: 8px; }
.info-blue   { background: #1e3a5f; color: #93c5fd; border-left: 3px solid var(--accent); }
.info-green  { background: #14532d; color: #86efac; border-left: 3px solid var(--success); }
.info-red    { background: #450a0a; color: #fca5a5; border-left: 3px solid var(--danger); }
.info-yellow { background: #451a03; color: #fde68a; border-left: 3px solid var(--warn); }

/* Stats */
.stat-row { display: flex; gap: 10px; margin-bottom: 10px; }
.stat { flex: 1; background: var(--bg); border-radius: 8px; padding: 10px; text-align: center; }
.stat-num { font-size: 24px; font-weight: 700; color: var(--accent); }
.stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }

/* Progress */
.progress-wrap { background: var(--border); border-radius: 6px; height: 6px; overflow: hidden; margin: 10px 0; }
.progress-bar { height: 100%; background: var(--accent); border-radius: 6px; transition: width .3s; width: 0; }

/* File upload */
.upload-area {
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 18px;
  text-align: center;
  cursor: pointer;
  color: var(--muted);
  display: block;
}
.upload-area input { display: none; }
.upload-icon { font-size: 26px; display: block; margin-bottom: 5px; }

/* Toggle switch */
.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; margin-top: 10px; }
.toggle { position: relative; width: 44px; height: 26px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; cursor: pointer; inset: 0;
  background: var(--border); border-radius: 13px; transition: background .2s;
}
.slider:before {
  content: ''; position: absolute; height: 20px; width: 20px;
  left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: transform .2s;
}
.toggle input:checked + .slider { background: var(--accent); }
.toggle input:checked + .slider:before { transform: translateX(18px); }

/* Spinner */
.spinner {
  display: inline-block; width: 13px; height: 13px;
  border: 2px solid var(--border); border-top-color: var(--accent);
  border-radius: 50%; animation: spin .7s linear infinite;
  vertical-align: middle; margin-right: 4px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Template grid */
.template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; margin-bottom: 10px; }
.template-card {
  background: var(--bg); border: 2px solid var(--border); border-radius: 10px;
  padding: 12px 8px; text-align: center; cursor: pointer; transition: border-color .15s;
}
.template-card:hover { border-color: var(--accent); }
.template-card.active { border-color: var(--accent); background: #1e3a5f; }
.template-icon { font-size: 24px; display: block; margin-bottom: 6px; }
.template-name { font-size: 12px; font-weight: 600; color: var(--text); display: block; }
.template-badge { font-size: 10px; color: var(--muted); display: block; margin-top: 2px; }
.template-actions { display: flex; gap: 4px; justify-content: center; margin-top: 6px; flex-wrap: wrap; }

/* Simple list rows (sheets, folders) */
.list-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.list-row:last-child { border-bottom: none; }
.list-row input[type=radio], .list-row input[type=checkbox] {
  width: 18px; height: 18px; accent-color: var(--accent); flex-shrink: 0; cursor: pointer;
}
.list-row-info { flex: 1; min-width: 0; }
.list-row-name { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.list-row-name.active-text { color: var(--accent); }
.list-row-sub { font-size: 11px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.list-row-delete { background: none; border: none; color: var(--muted); font-size: 18px; cursor: pointer; padding: 2px 6px; flex-shrink: 0; }

/* Ad-hoc / recipient rows */
.ah-row, .rc-row { display: flex; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
.ah-row:last-child, .rc-row:last-child { border-bottom: none; }
.ah-info { flex: 1; min-width: 0; }
.ah-name, .rc-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0; }
.ah-email, .rc-email { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-email { flex: 1; min-width: 0; font-size: 12px; }
.rc-status { font-size: 11px; color: #94a3b8; flex-shrink: 0; white-space: nowrap; }

.draft-indicator { font-size: 11px; color: var(--warn); margin-top: 4px; min-height: 14px; }

/* Split editor (Settings > Template editor) */
.tmpl-toolbar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.tbtn {
  padding: 7px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  border: 1px solid var(--border); background: var(--bg); color: #94a3b8; cursor: pointer; font-family: inherit;
}
.tbtn:hover { border-color: var(--accent); color: var(--accent); }
.tbtn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.tbtn-primary:hover { background: #2563eb; }

.split-editor {
  display: flex; height: 420px; border: 1px solid var(--border);
  border-radius: 8px; overflow: hidden; position: relative;
}
.split-editor.fullscreen {
  position: fixed; inset: 0; z-index: 200; height: 100vh; border-radius: 0; border: none;
}
.split-code { display: flex; flex-direction: column; width: 50%; min-width: 120px; background: #0a1520; }
.split-preview { display: flex; flex-direction: column; flex: 1; min-width: 120px; background: #fff; }
.split-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px;
  padding: 6px 10px; background: var(--surface); color: var(--muted); border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.split-code .split-label { border-right: 1px solid var(--border); }
.split-preview .split-label { background: #f1f3f4; color: #5f6368; border-bottom: 1px solid #dadce0; }
.split-editor textarea#tmplEditor {
  flex: 1; width: 100%; resize: none; border: none; border-right: 1px solid var(--border);
  outline: none; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6;
  padding: 10px; background: #0a1520; color: var(--text); tab-size: 2; min-height: 0;
}
.split-divider { width: 5px; background: var(--border); cursor: col-resize; flex-shrink: 0; transition: background .15s; }
.split-divider:hover, .split-divider.dragging { background: var(--accent); }
.fullscreen-close { display: none; }
.split-editor.fullscreen .fullscreen-close {
  display: flex; position: absolute; top: 10px; right: 10px; z-index: 10;
  background: var(--danger); color: #fff; border: none; border-radius: 6px;
  padding: 6px 12px; font-size: 13px; font-weight: 700; cursor: pointer;
}

/* Preview modal */
.modal-overlay {
  display: none; position: fixed; inset: 0; background: rgba(0,0,0,.85); z-index: 100; overflow: auto;
}
.modal-overlay.open { display: block; }
.modal-box { max-width: 640px; margin: 20px auto; background: #fff; border-radius: 12px; overflow: hidden; }
.modal-header {
  background: var(--surface); padding: 14px 18px; display: flex;
  justify-content: space-between; align-items: center;
}
.modal-header span { color: var(--text); font-weight: 700; font-size: 15px; }
.modal-header button { background: none; border: none; color: var(--muted); font-size: 22px; cursor: pointer; }
.modal-subject { padding: 14px; background: var(--surface); border-bottom: 1px solid var(--border); }
.modal-subject-label { font-size: 12px; color: var(--muted); }
.modal-subject-text { color: var(--text); font-size: 15px; font-weight: 600; margin-top: 4px; }
.modal-footer { padding: 14px; background: var(--surface); display: flex; gap: 10px; }
.modal-footer .btn { margin: 0; flex: 1; }

/* Setup screen (first run — enter API URL) */
.setup-screen {
  min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.setup-box { max-width: 420px; width: 100%; }
.setup-box h1 { font-size: 22px; margin-bottom: 8px; }
.setup-box p { color: var(--muted); font-size: 14px; margin-bottom: 20px; line-height: 1.6; }
