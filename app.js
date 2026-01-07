// Bossard Fastener Library v.O1.1.2
// Modernized with IndexedDB, Dark Mode, and Toast Notifications

const APP_VERSION = "O1.1.2A";

// ... (rest of file)

function compactDetails(arr) {
  // Filter out empty strings, or strings that are just dashes/dots/whitespace
  const valid = arr.map(s => (s || '').toString().trim())
    .filter(s => s && !/^[-–—\s\.]+$/.test(s));
  while (valid.length < 5) valid.push('\u00A0'); // Blank line
  return valid.slice(0, 5);
}

// ===== Constants & Config =====
const DB_CONFIG = {
  name: 'BossardLibraryDB',
  version: 1,
  stores: {
    users: { keyPath: 'username' },
    items: { keyPath: 'article' }, // Article number is unique ID
    audit: { autoIncrement: true }
  }
};

const LS_KEYS = {
  THEME: 'sb_theme_v1',
  MIGRATED: 'sb_migrated_v1',
  // Legacy keys for migration
  LEGACY_ITEMS: 'sb_items_v47',
  LEGACY_AUDIT: 'sb_audit_v47',
  LEGACY_TOGGLE_SAMPLE: 'sb_onlySample_v47',
  LEGACY_TOGGLE_LOW: 'sb_onlyLow_v47'
};

// ===== Toast Notification System =====
const Toast = {
  container: document.getElementById('toastContainer'),
  show(message, type = 'info') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${this.escape(message)}</span>`;

    // Auto remove
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      setTimeout(() => el.remove(), 300);
    }, 3000);

    this.container.appendChild(el);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); },
  escape(s) { return (s ?? '').toString().replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
};

// ===== IndexedDB Wrapper =====
class StorageManager {
  constructor() {
    this.db = null;
  }

  async open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('users')) {
          const st = db.createObjectStore('users', DB_CONFIG.stores.users);
          st.add({ username: 'admin', passwordHash: this.sha('@Bossard'), role: 'admin' });
        }
        if (!db.objectStoreNames.contains('items')) {
          const st = db.createObjectStore('items', DB_CONFIG.stores.items);
          st.createIndex('category', 'category', { unique: false });
          st.createIndex('location', 'location', { unique: false });
        }
        if (!db.objectStoreNames.contains('audit')) {
          db.createObjectStore('audit', DB_CONFIG.stores.audit);
        }
      };
      req.onsuccess = () => { this.db = req.result; resolve(this.db); };
      req.onerror = () => reject(req.error);
    });
  }

  sha(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return String(h);
  }

  async getAllItems() {
    return this.tx('items', 'readonly', st => st.getAll());
  }

  async saveItem(item) {
    return this.tx('items', 'readwrite', st => st.put(item));
  }

  async deleteItem(article) {
    return this.tx('items', 'readwrite', st => st.delete(article));
  }

  async clearItems() {
    return this.tx('items', 'readwrite', st => st.clear());
  }

  async getUser(username) {
    return this.tx('users', 'readonly', st => st.get(username));
  }

  async saveUser(user) {
    return this.tx('users', 'readwrite', st => st.put(user));
  }

  async addAudit(entry) {
    return this.tx('audit', 'readwrite', st => st.add({ ...entry, ts: Date.now() }));
  }

  async getAuditLogs() {
    // Get all logs, reverse sort by time (newest first)
    // IDB doesn't support reverse getAll natively easily without cursor, 
    // but for simple usage we can fetch all and sort in JS or use cursor.
    // Given the scale, fetching all is likely fine for now.
    const logs = await this.tx('audit', 'readonly', st => st.getAll());
    return logs.sort((a, b) => b.ts - a.ts);
  }

  tx(storeName, mode, callback) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, mode);
      const st = tx.objectStore(storeName);
      const req = callback(st);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
}

// ===== Theme Manager =====
class ThemeManager {
  constructor() {
    this.btn = document.getElementById('themeToggle');
    this.init();
  }

  init() {
    const saved = localStorage.getItem(LS_KEYS.THEME);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);
    this.apply(isDark);

    this.btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark';
      this.apply(!current);
    });
  }

  apply(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem(LS_KEYS.THEME, isDark ? 'dark' : 'light');
    this.updateIcon(isDark);
    this.updateLogo(isDark);
  }

  updateIcon(isDark) {
    // Sun or Moon icon
    const path = isDark
      ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>' // Moon
      : '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'; // Sun

    this.btn.querySelector('svg').innerHTML = path;
  }

  updateLogo(isDark) {
    const appLogo = document.getElementById('appLogo');
    if (appLogo) {
      appLogo.src = isDark ? 'assets/icon-512-dark.png' : 'assets/icon-512.png';
    }
    const headerLogo = document.getElementById('headerLogo');
    if (headerLogo) {
      headerLogo.src = isDark ? 'assets/bossardlogo-dark.png' : 'assets/bossardlogo.png';
    }
  }
}

// ===== App Logic =====
const storage = new StorageManager();
const state = {
  user: { username: 'Guest', role: 'guest' },
  items: [],
  selectedItems: new Set() // Set of article strings
};

// DOM Elements
const els = {
  cards: document.getElementById('cards'),
  btnAdd: document.getElementById('btnAdd'),
  categorySelect: document.getElementById('categorySelect'),
  sortSelect: document.getElementById('sortSelect'),
  searchInput: document.getElementById('searchInput'),
  onlySample: document.getElementById('onlySample'),
  onlyLowStock: document.getElementById('onlyLowStock'),
  onlyLowStock: document.getElementById('onlyLowStock'),
  showDummy: document.getElementById('showDummy'),
  filterQtyLow: document.getElementById('filterQtyLow'),
  qtyLowLimit: document.getElementById('qtyLowLimit'),

  currentUserLabel: document.getElementById('currentUserLabel'),
  totalItems: document.getElementById('totalItems'),
  btnPrepareOrder: document.getElementById('btnPrepareOrder'),
  btnSelectAll: document.getElementById('btnSelectAll'),
  btnHelp: document.getElementById('btnHelp'),
  // Filters
  filters: ['category', 'standard', 'material', 'grade', 'plating', 'head', 'recess', 'dim1', 'dim2', 'location']
    .reduce((acc, id) => ({ ...acc, [id]: document.getElementById('f_' + id) }), {}),
  // Dialogs
  loginDialog: document.getElementById('loginDialog'),
  itemDialog: document.getElementById('itemDialog'),
  noteDialog: document.getElementById('noteDialog'),
  manageDialog: document.getElementById('manageDialog'),
  importDialog: document.getElementById('importDialog'),
  auditDialog: document.getElementById('auditDialog'),
  detailDialog: document.getElementById('detailDialog'),
  compareDialog: document.getElementById('compareDialog'),
  orderDialog: document.getElementById('orderDialog'),
  helpDialog: document.getElementById('helpDialog')
};

// --- Initialization ---
async function init() {
  await storage.open();
  new ThemeManager();

  // Migration Check
  if (!localStorage.getItem(LS_KEYS.MIGRATED)) {
    await migrateData();
  }

  // Load Data
  state.items = await storage.getAllItems();

  // Restore Toggles
  const s = localStorage.getItem(LS_KEYS.LEGACY_TOGGLE_SAMPLE);
  const l = localStorage.getItem(LS_KEYS.LEGACY_TOGGLE_LOW);
  const showD = localStorage.getItem('showDummy');
  const qtyL = localStorage.getItem('filterQtyLow');
  const qtyVal = localStorage.getItem('qtyLowLimit');

  if (s) els.onlySample.checked = (s === '1');
  if (l) els.onlyLowStock.checked = (l === '1');
  if (showD) els.showDummy.checked = (showD === '1');
  if (qtyL) els.filterQtyLow.checked = (qtyL === '1');
  if (qtyVal) els.qtyLowLimit.value = qtyVal;

  render();
  render();
  render();
  setupEventListeners();
  initTooltips();

  // Close dialogs on backdrop click (Improved Sensitivity)
  document.querySelectorAll('dialog').forEach(d => {
    let mouseDownOnBackdrop = false;

    d.addEventListener('mousedown', (e) => {
      if (e.target === d) mouseDownOnBackdrop = true;
      else mouseDownOnBackdrop = false;
    });

    d.addEventListener('click', (e) => {
      if (e.target === d && mouseDownOnBackdrop) d.close();
      mouseDownOnBackdrop = false;
    });
  });
}

async function migrateData() {
  try {
    const rawItems = localStorage.getItem(LS_KEYS.LEGACY_ITEMS);
    if (rawItems) {
      const items = JSON.parse(rawItems);
      for (const item of items) {
        await storage.saveItem(item);
      }
      console.log(`Migrated ${items.length} items to IndexedDB`);
    }

    const rawAudit = localStorage.getItem(LS_KEYS.LEGACY_AUDIT);
    if (rawAudit) {
      const audits = JSON.parse(rawAudit);
      // IDB audit has auto-increment key, so we just add them
      // We reverse to add oldest first if we want to keep order, but TS is there
      for (const a of audits.reverse()) {
        await storage.addAudit(a);
      }
    }

    localStorage.setItem(LS_KEYS.MIGRATED, '1');
    // Optional: Clear legacy data to free space? 
    // localStorage.removeItem(LS_KEYS.LEGACY_ITEMS);
    Toast.success('Data migration to new database completed.');
  } catch (err) {
    console.error('Migration failed', err);
    Toast.error('Data migration failed. Please check console.');
  }
}

// --- Event Listeners ---
function setupEventListeners() {
  // Filters
  els.categorySelect.addEventListener('change', render);
  els.sortSelect.addEventListener('change', render);
  els.searchInput.addEventListener('input', render);
  Object.values(els.filters).forEach(el => el.addEventListener('change', render));

  els.onlySample.addEventListener('change', () => {
    if (els.onlySample.checked) { els.onlyLowStock.checked = false; localStorage.setItem(LS_KEYS.LEGACY_TOGGLE_LOW, '0'); }
    localStorage.setItem(LS_KEYS.LEGACY_TOGGLE_SAMPLE, els.onlySample.checked ? '1' : '0');
    render();
  });

  els.onlyLowStock.addEventListener('change', () => {
    if (els.onlyLowStock.checked) { els.onlySample.checked = false; localStorage.setItem(LS_KEYS.LEGACY_TOGGLE_SAMPLE, '0'); }
    localStorage.setItem(LS_KEYS.LEGACY_TOGGLE_LOW, els.onlyLowStock.checked ? '1' : '0');
    render();
  });

  els.showDummy.addEventListener('change', () => {
    localStorage.setItem('showDummy', els.showDummy.checked ? '1' : '0');
    render();
  });

  const updateQtyFilter = () => {
    localStorage.setItem('filterQtyLow', els.filterQtyLow.checked ? '1' : '0');
    localStorage.setItem('qtyLowLimit', els.qtyLowLimit.value);
    render();
  };
  els.filterQtyLow.addEventListener('change', updateQtyFilter);
  els.qtyLowLimit.addEventListener('input', updateQtyFilter);

  document.getElementById('btnClearFilters').addEventListener('click', () => {
    Object.values(els.filters).forEach(el => el.value = '');
    els.categorySelect.value = '';
    els.searchInput.value = '';
    els.onlySample.checked = false;
    els.onlyLowStock.checked = false;
    els.showDummy.checked = false; // Default: Hide 00 (Unchecked)
    els.filterQtyLow.checked = false;
    localStorage.setItem(LS_KEYS.LEGACY_TOGGLE_SAMPLE, '0');
    localStorage.setItem(LS_KEYS.LEGACY_TOGGLE_LOW, '0');
    localStorage.setItem('showDummy', '0');
    localStorage.setItem('filterQtyLow', '0');
    render();
    Toast.info('Filters cleared');
  });

  // Buttons
  document.getElementById('btnAdd').addEventListener('click', () => openItemDialog());
  document.getElementById('userLoginTrigger').addEventListener('click', () => els.loginDialog.showModal());
  document.getElementById('btnImportExcel').addEventListener('click', () => els.importDialog.showModal());
  document.getElementById('btnExportExcel').addEventListener('click', exportAllExcel);
  document.getElementById('btnExportJSON').addEventListener('click', () => backupData('json'));
  document.getElementById('btnAudit').addEventListener('click', showAuditLog);
  document.getElementById('btnBackup').addEventListener('click', () => backupData('backup'));

  els.btnHelp.addEventListener('click', () => {
    loadHelp('en');
    els.helpDialog.showModal();
  });
  document.getElementById('btnHelpEn').addEventListener('click', () => loadHelp('en'));
  document.getElementById('btnHelpTh').addEventListener('click', () => loadHelp('th'));
  document.getElementById('btnHelpClose').addEventListener('click', () => els.helpDialog.close());

  document.getElementById('btnBackup').addEventListener('click', () => backupData('backup'));

  els.btnSelectAll.addEventListener('click', () => {
    // Select all currently filtered items
    const selections = getCurrentSelections();
    recomputeSidebarOptions(selections); // Ensure options are fresh
    const list = applyFilterPipeline(state.items, selections);

    list.forEach(it => state.selectedItems.add(it.article));
    render();
    Toast.info(`Selected ${list.length} items`);
  });

  els.btnPrepareOrder.addEventListener('click', openOrderDialog);
  document.getElementById('orderClose').addEventListener('click', () => {
    els.orderDialog.close();
    // Reset selection on close/cancel
    state.selectedItems.clear();
    render();
  });
  document.getElementById('orderExport').addEventListener('click', exportOrder);

  // Login
  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value;
    const user = await storage.getUser(u);
    if (user && user.passwordHash === storage.sha(p)) {
      state.user = { username: u, role: user.role };
      els.currentUserLabel.textContent = `User: ${u}`;
      els.loginDialog.close();
      if (user.role === 'admin') document.getElementById('adminDialog').showModal();
      Toast.success(`Welcome, ${u}`);
    } else {
      Toast.error('Invalid credentials');
    }
  });
  document.getElementById('loginCancel').addEventListener('click', () => els.loginDialog.close());

  // Admin
  document.getElementById('adminCreate').addEventListener('click', async e => {
    e.preventDefault();
    const u = document.getElementById('a_username').value.trim();
    const p = document.getElementById('a_password').value;
    const r = document.getElementById('a_role').value;
    if (!u || !p) return Toast.error('Missing fields');
    await storage.saveUser({ username: u, passwordHash: storage.sha(p), role: r });
    Toast.success('User created');
    document.getElementById('adminDialog').close();
  });
  document.getElementById('adminClose').addEventListener('click', () => document.getElementById('adminDialog').close());

  // Item Form
  document.getElementById('itemForm').addEventListener('submit', handleItemSave);
  document.getElementById('itemCancel').addEventListener('click', () => els.itemDialog.close());

  // Note
  document.getElementById('noteSave').addEventListener('click', handleNoteSave);
  document.getElementById('noteCancel').addEventListener('click', () => els.noteDialog.close());

  // Manage
  document.getElementById('manageMinus').addEventListener('click', () => applyManage('minus'));
  document.getElementById('managePlus').addEventListener('click', () => applyManage('plus'));
  document.getElementById('manageCancel').addEventListener('click', () => els.manageDialog.close());

  // Import
  document.getElementById('importMerge').addEventListener('click', () => handleImport('merge'));
  document.getElementById('importReplace').addEventListener('click', () => handleImport('replace'));
  document.getElementById('importCancel').addEventListener('click', () => els.importDialog.close());

  // Export
  document.getElementById('btnExportExcel').addEventListener('click', exportAllExcel);
  document.getElementById('btnExportJSON').addEventListener('click', () => backupData('json'));
  document.getElementById('btnBackup').addEventListener('click', backupData);
  document.getElementById('btnAuditExportTxt').addEventListener('click', exportAuditTxt);
  document.getElementById('btnAuditClose').addEventListener('click', () => els.auditDialog.close());

  // Detail
  document.getElementById('detailClose').addEventListener('click', () => els.detailDialog.close());
  document.getElementById('detailEdit').addEventListener('click', () => {
    const it = state.items.find(x => x.article === window._detailArticle);
    if (it) { openItemDialog(it); els.detailDialog.close(); }
  });
  document.getElementById('detailManage').addEventListener('click', () => {
    const it = state.items.find(x => x.article === window._detailArticle);
    if (it) {
      window._manageArticle = it.article;
      document.getElementById('m_amount').value = 0;
      document.getElementById('manageMeta').textContent = `${it.article} • ${it.name}`;
      // Reset feedback
      document.getElementById('m_calc_feedback').textContent = '';
      els.manageDialog.showModal();
    }
  });
  document.getElementById('detailNote').addEventListener('click', () => {
    const it = state.items.find(x => x.article === window._detailArticle);
    if (it) {
      window._noteArticle = it.article;
      document.getElementById('noteText').value = it.notes || '';
      els.noteDialog.showModal();
    }
  });
  document.getElementById('detailFindEq').addEventListener('click', () => {
    openCompare(window._detailArticle);
  });

  // Compare
  document.getElementById('cmpClose').addEventListener('click', () => els.compareDialog.close());
  document.getElementById('cmpClear').addEventListener('click', () => {
    document.querySelectorAll('#compareDialog select').forEach(s => s.value = '');
    renderCompare();
  });
  document.getElementById('cmpClearDims').addEventListener('click', () => {
    const ids = ['length', 'pitch', 'shank_length', 'head_d', 'head_h', 'af', 'washer_id', 'washer_od', 'washer_t'];
    ids.forEach(id => {
      const el = document.getElementById('cmp_' + id);
      if (el) el.value = '';
    });
    renderCompare();
  });
  document.getElementById('cmpClearMat').addEventListener('click', () => {
    const ids = ['material', 'grade', 'plating', 'function_coat', 'he_risk'];
    ids.forEach(id => {
      const el = document.getElementById('cmp_' + id);
      if (el) el.value = '';
    });
    renderCompare();
  });
  document.querySelectorAll('#compareDialog select').forEach(s => s.addEventListener('change', renderCompare));

  // Manage Dialog Listeners
  const mInput = document.getElementById('m_amount');
  const mRadios = document.querySelectorAll('input[name="m_unit"]');
  if (mInput) mInput.addEventListener('input', updateManageFeedback);
  if (mRadios) mRadios.forEach(r => r.addEventListener('change', updateManageFeedback));
}

function updateManageFeedback() {
  const amt = Math.max(0, Number(val('m_amount') || 0));
  const it = state.items.find(x => x.article === window._manageArticle);
  if (!it) return;

  const unit = document.querySelector('input[name="m_unit"]:checked').value;
  const packSize = Number(it.pack_size) || 1;
  const feedbackEl = document.getElementById('m_calc_feedback');

  if (unit === 'pack') {
    const total = amt * packSize;
    feedbackEl.textContent = `${amt} Packs × ${packSize} pcs = ${total} Pieces`;
    feedbackEl.style.color = 'var(--primary)';
  } else if (unit === 'small') {
    const smallSize = Number(it.small_pack) || packSize;
    const total = amt * smallSize;
    feedbackEl.textContent = `${amt} Small Packs × ${smallSize} pcs = ${total} Pieces`;
    feedbackEl.style.color = 'var(--primary)';
  } else {
    feedbackEl.textContent = `${amt} Pieces`;
    feedbackEl.style.color = 'var(--text-muted)';
  }
}



function openCompare(baseArticle) {
  const base = state.items.find(x => x.article === baseArticle);
  if (!base) return;
  document.getElementById('cmpBase').textContent = `Base: ${base.article}`;

  // Populate dropdowns
  const fields = ['standard', 'head', 'recess', 'thread_size', 'length', 'pitch', 'shank_length', 'head_d', 'head_h', 'af', 'washer_id', 'washer_od', 'washer_t', 'material', 'grade', 'plating', 'function_coat', 'he_risk'];
  fields.forEach(f => {
    const vals = new Set(state.items.map(i => i[f]).filter(Boolean));
    const el = document.getElementById('cmp_' + f);
    if (el) {
      el.innerHTML = '<option value=""></option>' + Array.from(vals).sort().map(v => `<option>${Toast.escape(v)}</option>`).join('');
      // Pre-select if base has value
      if (base[f]) {
        el.value = base[f];
      }
    }
  });

  renderCompare();
  els.compareDialog.showModal();
}

function renderCompare() {
  const criteria = {};
  document.querySelectorAll('#compareDialog select').forEach(s => {
    if (s.value) criteria[s.id.replace('cmp_', '')] = s.value;
  });

  const matches = state.items.filter(it => {
    for (const [k, v] of Object.entries(criteria)) {
      if (String(it[k] || '').trim() !== v) return false;
    }
    return true;
  });

  document.getElementById('compareResult').innerHTML = matches.map(it => {
    const qty = Number(it.qty || 0);
    const status = qty > 0 ? 'success' : 'danger';

    // Image Logic
    let imgHtml = '';
    if (it.photo && String(it.photo).trim()) {
      imgHtml = `<img class="cmp-card-img" src="BNImage/${Toast.escape(String(it.photo).trim())}" onerror="this.src='assets/placeholder.png'">`;
    } else if (it.article) {
      imgHtml = `<img class="cmp-card-img" src="BNImage/${Toast.escape(it.article)}.jpg" onerror="this.src='assets/placeholder.png'">`;
    } else {
      imgHtml = `<div class="cmp-card-img" style="display:flex;align-items:center;justify-content:center;color:#ccc;">No Img</div>`;
    }

    return `
    <div class="cmp-card" onclick="openDetail(state.items.find(x=>x.article==='${it.article}'))">
      ${imgHtml}
      <div class="cmp-card-info">
        <div class="cmp-card-title" title="${Toast.escape(it.name)}" data-tooltip="card_article">${Toast.escape(it.article)}</div>
        <div class="cmp-card-meta">${Toast.escape(it.name)}</div>
        <div class="cmp-card-badges">
          <span class="badge ${status}" data-tooltip="card_qty">Qty ${qty}</span>
          <span class="badge" data-tooltip="card_location">${Toast.escape(it.location === '00' ? '00' : it.location)}</span>
        </div>
      </div>
    </div>
  `}).join('');
}

// Tooltip Logic
let tooltipTimer = null;
let tooltipState = {
  enabled: true,
  lang: 'en'
};

function initTooltips() {
  const tooltipEl = document.getElementById('customTooltip');
  const toggleEl = document.getElementById('toggleTooltips');

  // Set initial state from UI or default
  if (toggleEl) {
    tooltipState.enabled = toggleEl.checked;
    toggleEl.addEventListener('change', () => {
      tooltipState.enabled = toggleEl.checked;
      if (!tooltipState.enabled) hideTooltip();
    });
  }

  document.addEventListener('mouseover', (e) => {
    if (!tooltipState.enabled || typeof UI_TOOLTIPS === 'undefined') return;

    // Find closest element with ID *OR* data-tooltip
    const target = e.target.closest('[id], [data-tooltip]');
    if (!target) return;

    // Prioritize data-tooltip, then ID
    const key = target.dataset.tooltip || target.id;

    if (UI_TOOLTIPS[key]) {
      // Clear existing timer
      clearTimeout(tooltipTimer);

      // Start new timer for 0.5s delay
      tooltipTimer = setTimeout(() => {
        showTooltip(target, UI_TOOLTIPS[key][tooltipState.lang]);
      }, 500);
    }
  });

  document.addEventListener('mouseout', (e) => {
    // If leaving target, clear timer and hide
    const target = e.target.closest('[id], [data-tooltip]');
    if (target) {
      clearTimeout(tooltipTimer);
      hideTooltip();
    }
  });

  // Also hide on click/scroll
  document.addEventListener('click', hideTooltip);
  window.addEventListener('scroll', hideTooltip, { capture: true });
}

function showTooltip(target, text) {
  const tooltipEl = document.getElementById('customTooltip');
  if (!tooltipEl || !text) return;

  const rect = target.getBoundingClientRect();
  tooltipEl.textContent = text;
  tooltipEl.classList.add('show');

  // Position below element
  let top = rect.bottom + 8;
  let left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2);

  // Bounds check (basic)
  if (left < 10) left = 10;
  if (left + tooltipEl.offsetWidth > window.innerWidth - 10) {
    left = window.innerWidth - tooltipEl.offsetWidth - 10;
  }

  // Ensure visible
  if (top + tooltipEl.offsetHeight > window.innerHeight) {
    top = rect.top - tooltipEl.offsetHeight - 8;
  }

  tooltipEl.style.top = `${top + window.scrollY}px`;
  tooltipEl.style.left = `${left + window.scrollX}px`;
}

function hideTooltip() {
  const tooltipEl = document.getElementById('customTooltip');
  if (tooltipEl) {
    tooltipEl.classList.remove('show');
    // Move offscreen to avoid blocking
    tooltipEl.style.top = '-9999px';
  }
}

function loadHelp(lang) {
  const content = document.getElementById('helpContent');
  const btnEn = document.getElementById('btnHelpEn');
  const btnTh = document.getElementById('btnHelpTh');

  // Update tooltip language state
  tooltipState.lang = lang;

  if (lang === 'en') {
    content.innerHTML = typeof MANUAL_EN !== 'undefined' ? MANUAL_EN : '<p>Manual content not loaded.</p>';
    btnEn.classList.remove('btn-ghost');
    btnEn.classList.add('btn-primary');
    btnTh.classList.remove('btn-primary');
    btnTh.classList.add('btn-ghost');
  } else {
    content.innerHTML = typeof MANUAL_TH !== 'undefined' ? MANUAL_TH : '<p>Manual content not loaded.</p>';
    btnEn.classList.remove('btn-primary');
    btnEn.classList.add('btn-ghost');
    btnTh.classList.remove('btn-ghost');
    btnTh.classList.add('btn-primary');
  }
}

// --- Rendering ---
function getCurrentSelections() {
  return {
    categoryTop: els.categorySelect.value || '',
    sortBy: els.sortSelect.value || 'article',
    q: (els.searchInput.value || '').trim().toLowerCase(),
    toggles: {
      sample: !!els.onlySample.checked,
      low: !!els.onlyLowStock.checked,
      showDummy: !!els.showDummy.checked,
      qtyLow: !!els.filterQtyLow.checked,
      qtyLimit: Number(els.qtyLowLimit.value) || 10
    },
    side: Object.fromEntries(Object.keys(els.filters).map(id => [id, els.filters[id].value || '']))
  };
}

function applyFilterPipeline(items, selections) {
  let list = items.slice();
  const { categoryTop, q, toggles, side } = selections;

  if (q) {
    list = list.filter(it => [it.article, it.name, it.bn, it.category, it.standard, it.head, it.recess, it.material, it.grade, it.plating, it.dim1, it.dim2, it.location, it.notes]
      .join(' ').toLowerCase().includes(q));
  }
  if (categoryTop) list = list.filter(it => (it.category || '') === categoryTop);

  for (const id of Object.keys(side)) {
    const v = side[id];
    if (!v) continue;
    if (id === 'location' && v === '00 (Dummy)') { list = list.filter(it => (it.location || '') === '00'); }
    else list = list.filter(it => (it[id] || '') === v);
  }

  if (toggles.sample) list = list.filter(it => Number(it.qty || 0) > 0);
  if (toggles.low) {
    list = list.filter(it => Number(it.pack_size || 0) > 0 && Number(it.qty || 0) < Number(it.pack_size));
  }
  if (!toggles.showDummy) {
    list = list.filter(it => (it.location || '') !== '00');
  }
  if (toggles.qtyLow) {
    list = list.filter(it => Number(it.qty || 0) < toggles.qtyLimit);
  }
  return list;
}

function applySort(list, sortBy) {
  list.sort((a, b) => {
    let valA = '', valB = '';

    if (sortBy === 'article') {
      valA = String(a.article || '').trim();
      valB = String(b.article || '').trim();
    } else if (sortBy === 'bn') {
      valA = String(a.bn || '').trim();
      valB = String(b.bn || '').trim();
    } else if (sortBy === 'location') {
      valA = String(a.location || '').trim();
      valB = String(b.location || '').trim();
      // "00" should be last
      if (valA === '00' && valB !== '00') return 1;
      if (valB === '00' && valA !== '00') return -1;
    }

    return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

function recomputeSidebarOptions(selections) {
  const { categoryTop, q, toggles, side } = selections;

  function itemsExcept(field) {
    const s = { categoryTop, q, toggles, side: { ...side, [field]: '' } };
    return applyFilterPipeline(state.items, s);
  }

  Object.keys(els.filters).forEach(field => {
    const el = els.filters[field];
    const list = itemsExcept(field);
    const values = new Set(list.map(it => {
      if (field === 'location') return (it.location === '00') ? '00 (Dummy)' : (it.location || '');
      return (it[field] || '');
    }).filter(Boolean));

    const keep = el.value;
    el.innerHTML = '<option value=""></option>' + Array.from(values).sort().map(v => {
      return `<option>${Toast.escape(v)}</option>`;
    }).join('');

    if (keep && !values.has(keep)) el.insertAdjacentHTML('afterbegin', `<option>${Toast.escape(keep)}</option>`);
    if (keep) el.value = keep;

    el.classList.toggle('active-filter', !!el.value);
    el.setAttribute('data-nodata', el.options.length > 1 ? '0' : '1');
  });

  // Top Category
  const listForTop = applyFilterPipeline(state.items, { categoryTop: '', q, toggles, side });
  const cats = new Set(listForTop.map(x => x.category).filter(Boolean));
  const keepTop = els.categorySelect.value;
  els.categorySelect.innerHTML = '<option value="">All</option>' + Array.from(cats).sort().map(v => `<option>${Toast.escape(v)}</option>`).join('');
  if (keepTop) els.categorySelect.value = keepTop;

  // Dynamic Refresh Button Color
  const hasActiveFilters =
    !!els.categorySelect.value ||
    !!els.searchInput.value.trim() ||
    els.onlySample.checked ||
    els.onlyLowStock.checked ||
    Object.values(els.filters).some(el => !!el.value);

  const btnClear = document.getElementById('btnClearFilters');
  if (btnClear) {
    if (hasActiveFilters) {
      btnClear.classList.remove('btn-ghost');
      btnClear.classList.add('btn-primary');
    } else {
      btnClear.classList.remove('btn-primary');
      btnClear.classList.add('btn-ghost');
    }
  }
}

function render() {
  try {
    const selections = getCurrentSelections();
    recomputeSidebarOptions(selections);
    const list = applyFilterPipeline(state.items, selections);
    applySort(list, selections.sortBy);

    els.totalItems.textContent = `Filtered: ${list.length} / Total: ${state.items.length}`;
    els.totalItems.textContent = `Filtered: ${list.length} / Total: ${state.items.length}`;

    // Prepare Order Button Visibility
    // Prepare Order / Select All / Add Item Visibility
    if (state.selectedItems.size > 0) {
      els.btnAdd.style.display = 'none';
      els.btnPrepareOrder.style.display = 'inline-flex';
      els.btnSelectAll.style.display = 'inline-flex';
      els.btnPrepareOrder.textContent = `Prepare Order (${state.selectedItems.size})`;
    } else {
      els.btnAdd.style.display = 'inline-flex';
      els.btnPrepareOrder.style.display = 'none';
      els.btnSelectAll.style.display = 'none';
    }

    els.cards.innerHTML = '';

    // Lazy Loading Observer
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            obs.unobserve(img);
          }
        }
      });
    }, { rootMargin: '100px' });

    const fragment = document.createDocumentFragment();
    try {
      for (const it of list) {
        const card = createCard(it, observer);
        fragment.appendChild(card);
      }
      els.cards.appendChild(fragment);
    } catch (err) {
      console.error(err);
      alert('Render Error: ' + err.message);
    }
  } catch (criticalErr) {
    console.error(criticalErr);
    alert('CRITICAL RENDER FAILURE: ' + criticalErr.message + '\n' + criticalErr.stack);
  }
}

function createCard(it, observer) {
  const qty = Number(it.qty || 0), minq = Number(it.pack_size || 0);
  let status = 'success';
  if (qty === 0) status = 'danger';
  else if (qty < minq) status = 'warning';

  const wrap = document.createElement('article');
  wrap.className = 'card';
  if (state.selectedItems.has(it.article)) wrap.classList.add('selected');
  if (qty === 0) wrap.classList.add('out-of-stock');

  const bnNumMatch = String(it.bn || '').match(/\d+/);
  // SP Logic: If BN starts with SP, do not link
  const isSP = String(it.bn || '').trim().toUpperCase().startsWith('SP');
  const bnLink = (!isSP && bnNumMatch && bnNumMatch[0]) ? `https://www.bossard.com/global-en/eshop/search/p/${bnNumMatch[0]}/` : null;
  // Format BN Text: "BN 12345" for standard, "SP 12345" for SP
  let bnText = 'Unknown';
  if (it.bn && String(it.bn).trim()) {
    const raw = String(it.bn).trim();
    if (isSP) {
      bnText = raw;
    } else {
      // If standard BN, ensure it starts with "BN "
      bnText = raw.toUpperCase().startsWith('BN') ? raw : `BN ${raw}`;
    }
  }

  const articleTrim = String(it.article || '').trim();
  let imgSrc = '';
  let imgHtml = '';

  if (it.photo && String(it.photo).trim()) {
    imgSrc = `BNImage/${Toast.escape(String(it.photo).trim())}`;
    imgHtml = `<img class="card-img" data-src="${imgSrc}" src="assets/placeholder.png" alt="photo" onerror="this.onerror=null; this.src='assets/placeholder.png'">`;
  } else if (articleTrim) {
    imgSrc = `BNImage/${Toast.escape(articleTrim)}.jpg`;
    imgHtml = `<img class="card-img" data-src="${imgSrc}" src="assets/placeholder.png" alt="photo" onerror="tryNextImageExt(this, 'BNImage/${Toast.escape(articleTrim)}')" data-exts="jpg,png,webp,jpeg">`;
  } else {
    imgHtml = `<div class="img-fallback">${Toast.escape(it.name || it.article)}</div>`;
  }

  wrap.innerHTML = `
    <div class="card-check">✓</div>
    <div class="card-header">
      <div class="card-title" title="${Toast.escape(it.name)}">${Toast.escape(it.article)}</div>
      <div class="card-badges">
        <span class="badge ${status}" data-tooltip="card_qty">Qty ${qty}</span>
        <span class="badge" data-tooltip="card_location">${Toast.escape(it.location === '00' ? '00 (Dummy)' : it.location)}</span>
      </div>
    </div>
    <div class="card-img-container" data-tooltip="card_img">
      ${imgHtml}
    </div>
    <div class="card-title" style="font-size: 13px; font-weight: 500;">${Toast.escape(it.name)}</div>
    <div style="display:flex; justify-content:space-between; align-items:center;">
      ${bnLink ? `<a class="card-bn" target="_blank" rel="noopener" href="${bnLink}">${Toast.escape(bnText)}</a>` : `<span class="card-bn">${Toast.escape(bnText)}</span>`}
    </div>
    <ul class="card-specs">
      ${compactDetails([it.recess, it.head, joinDim(it.thread_size || it.dim1, it.length || it.dim2), it.standard, joinMaterial(it.material, it.grade, it.plating)]).map(s => `<li>${Toast.escape(s)}</li>`).join('')}
    </ul>
    <div class="card-actions">
      <button class="btn btn-sm btn-ghost" data-action="manage" data-tooltip="card_btn_manage">Manage</button>
      <button class="btn btn-sm ${it.notes ? 'btn-primary' : 'btn-ghost'}" data-action="note" data-tooltip="card_btn_note">Note</button>
      <button class="btn btn-sm btn-ghost" data-action="edit" data-tooltip="card_btn_edit">Edit</button>
      <button class="btn btn-sm btn-danger" data-action="delete" data-tooltip="card_btn_del">Del</button>
    </div>
  `;

  // Observers
  const img = wrap.querySelector('img');
  if (img) observer.observe(img);

  // Events
  wrap.querySelector('.card-img-container').addEventListener('click', () => openDetail(it));
  // Toggle Selection on Title Click
  wrap.querySelector('.card-title').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSelection(it.article);
  });

  wrap.querySelector('[data-action="manage"]').addEventListener('click', () => {
    window._manageArticle = it.article;
    document.getElementById('m_amount').value = 0;
    document.getElementById('manageMeta').textContent = `${it.article} • ${it.name}`;
    // Reset feedback
    document.getElementById('m_calc_feedback').textContent = '';
    els.manageDialog.showModal();
  });
  wrap.querySelector('[data-action="note"]').addEventListener('click', () => {
    window._noteArticle = it.article;
    document.getElementById('noteText').value = it.notes || '';
    els.noteDialog.showModal();
  });
  wrap.querySelector('[data-action="edit"]').addEventListener('click', () => openItemDialog(it));
  wrap.querySelector('[data-action="delete"]').addEventListener('click', async () => {
    if (confirm(`Delete ${it.article}?`)) {
      await storage.deleteItem(it.article);
      state.items = state.items.filter(x => x.article !== it.article);
      await storage.addAudit({ action: 'delete', article: it.article, user: state.user.username });
      render();
      Toast.success('Item deleted');
    }
  });

  return wrap;
}

// --- Actions ---
async function handleItemSave(e) {
  e.preventDefault();
  const form = document.getElementById('itemForm');
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const file = document.getElementById('f_photo').files[0];
  const photoFilename = file ? file.name.trim() : '';
  const selLoc = val('f_location2');
  const selArt = val('f_article');

  if (selLoc && selLoc !== '00') {
    const clash = state.items.find(x => String(x.location).trim() === selLoc && String(x.article).trim() !== selArt);
    if (clash) return Toast.error(`Location ${selLoc} occupied by ${clash.article}`);
  }

  // Fetch OLD item for Diff
  const oldItem = state.items.find(x => x.article === selArt) || {};

  const item = {
    article: val('f_article'), name: val('f_name'), bn: val('f_bn'),
    category: val('f_category2'), location: selLoc || '00',
    qty: Number(val('f_qty') || 0), pack_size: Number(val('f_pack_size') || 0),
    small_pack: Number(val('f_small_pack') || 0),
    standard: val('f_standard2'), head: val('f_head2'), recess: val('f_recess2'),
    dim1: val('f_dim1_2'), dim2: val('f_dim2_2'),
    thread_size: val('f_thread_size'), length: val('f_length'), pitch: val('f_pitch'),
    shank_length: val('f_shank_length'), head_d: val('f_head_d'), head_h: val('f_head_h'),
    af: val('f_af'), nut_h: val('f_nut_h'),
    washer_id: val('f_washer_id'), washer_od: val('f_washer_od'), washer_t: val('f_washer_t'),
    material: val('f_material2'), grade: val('f_grade2'), plating: val('f_plating2'),
    function_coat: val('f_function_coat'), he_risk: document.getElementById('f_he_risk').value,
    notes: document.getElementById('f_notes').value.trim(),
    photo: photoFilename || window._editingPhoto || '',
    updated_by: state.user.username, updated_at: Date.now()
  };

  await storage.saveItem(item);
  state.items = await storage.getAllItems(); // Refresh

  // Compute Diff
  const changes = [];
  const ignored = ['updated_at', 'updated_by'];
  for (const k in item) {
    if (ignored.includes(k)) continue;
    const vOld = oldItem[k];
    const vNew = item[k];
    // Loose comparison, handling null/undefined/empty string as equivalent
    if (vOld != vNew && !(vOld == null && vNew === '') && !(vOld === '' && vNew == null)) {
      if (String(vOld || '').trim() !== String(vNew || '').trim()) {
        changes.push(`${k}: ${vOld || ''} -> ${vNew}`);
      }
    }
  }

  const diffStr = changes.length > 0 ? changes.join(', ') : 'No significant changes';
  await storage.addAudit({ action: 'save', article: item.article, user: state.user.username, change: diffStr });

  els.itemDialog.close();
  render();
  Toast.success('Item saved');
}

async function handleNoteSave(e) {
  e.preventDefault();
  const it = state.items.find(x => x.article === window._noteArticle);
  if (it) {
    it.notes = document.getElementById('noteText').value;
    it.updated_by = state.user.username;
    it.updated_at = Date.now();
    await storage.saveItem(it);
    await storage.addAudit({ action: 'note', article: it.article, user: state.user.username });
    render();
    Toast.success('Note saved');
  }
  els.noteDialog.close();
}

async function applyManage(kind) {
  const amt = Math.max(0, Number(val('m_amount') || 0));
  const it = state.items.find(x => x.article === window._manageArticle);
  if (!it) return els.manageDialog.close();

  // Determine factor (Piece vs Pack)
  const unit = document.querySelector('input[name="m_unit"]:checked').value;
  // Fallback to 1 if pack_size is missing/zero, to prevent calculation errors
  // This addresses "withdraw 1 pack reduces 5" -> ensure pack_size is correct
  const packSize = Number(it.pack_size) || 1;
  // Logic: if Small Pack value is defined/valid, use it. If not, fallback to packSize as requested ("let small pack quantity = pack size")
  const smallSize = Number(it.small_pack) || packSize;

  let factor = 1;
  if (unit === 'pack') factor = packSize;
  else if (unit === 'small') factor = smallSize;

  const totalChange = amt * factor;

  if (totalChange <= 0) return Toast.info('Amount must be greater than 0');

  let q = Number(it.qty || 0);

  if (kind === 'minus') {
    // Validation: Prevent withdrawing more than available
    if (totalChange > q) {
      return Toast.error(`Cannot withdraw ${totalChange}. Only ${q} in stock.`);
    }
    q = Math.max(0, q - totalChange);
  } else {
    q += totalChange;
  }

  it.qty = q;
  it.updated_by = state.user.username;
  it.updated_at = Date.now();

  await storage.saveItem(it);
  await storage.addAudit({
    action: `manage:${kind}`,
    article: it.article,
    qty: it.qty,
    change: kind === 'minus' ? -totalChange : totalChange,
    unit: unit,
    input_amt: amt,
    user: state.user.username
  });

  els.manageDialog.close();
  render();
  Toast.success(`Stock updated: ${q} (${kind === 'minus' ? '-' : '+'}${totalChange})`);
}

// --- Import/Export ---
async function handleImport(mode) {
  const file = document.getElementById('importFile').files[0];
  if (!file) return Toast.error('No file selected');

  try {
    let rows = [];
    if (file.name.endsWith('.xlsx')) {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    } else if (file.name.endsWith('.json')) {
      const text = await file.text();
      const obj = JSON.parse(text);
      rows = Array.isArray(obj) ? obj : (obj.items || []);
    } else {
      return Toast.error('Unsupported format');
    }

    if (mode === 'replace') {
      if (!confirm('Replace ALL items? This cannot be undone.')) return;
      await storage.clearItems();
      state.items = [];
    }

    let count = 0;
    for (const r of rows) {
      // Normalize
      const item = {
        article: String(r.article || '').trim(),
        name: r.name || '', bn: r.bn || '', category: r.category || '', location: String(r.location || '00').trim(),
        qty: Number(r.qty || 0), pack_size: Number(r.pack_size || r.min_qty || 0),
        small_pack: Number(r.small_pack || 0),
        standard: r.standard || '', head: r.head || '', recess: r.recess || '',
        material: r.material || '', grade: r.grade || '', plating: r.plating || '',
        dim1: r.dim1 || '', dim2: r.dim2 || '',
        thread_size: r.thread_size || '', length: r.length || '', pitch: r.pitch || '',
        shank_length: r.shank_length || '', head_d: r.head_d || '', head_h: r.head_h || '',
        af: r.af || '', nut_h: r.nut_h || '',
        washer_id: r.washer_id || '', washer_od: r.washer_od || '', washer_t: r.washer_t || '',
        function_coat: r.function_coat || '', he_risk: r.he_risk || '',
        notes: r.notes || '', photo: r.photo || '',
        updated_by: state.user.username, updated_at: Date.now()
      };
      if (item.article) {
        await storage.saveItem(item);
        count++;
      }
    }

    state.items = await storage.getAllItems();
    await storage.addAudit({ action: `import-${mode}`, count, user: state.user.username });
    render();
    els.importDialog.close();
    Toast.success(`Imported ${count} items`);
  } catch (err) {
    console.error(err);
    Toast.error('Import failed');
  }
}



async function backupData() {
  const items = await storage.getAllItems();
  const audit = await storage.getAuditLogs();
  const payload = { version: APP_VERSION, exportedAt: new Date().toISOString(), items, audit };
  download(JSON.stringify(payload, null, 2), `backup_${APP_VERSION}_${Date.now()}.json`, 'application/json');
  storage.addAudit({ action: 'backup-create', user: state.user.username });
}

async function showAuditLog() {
  const logs = await storage.getAuditLogs();
  const list = document.getElementById('auditList');

  // Action Mapping
  const actionMap = {
    'manage:plus': 'manage: fill',
    'manage:minus': 'manage: withdraw'
  };

  list.innerHTML = logs.slice(0, 200).map(a => {
    // Determine Article + Location
    let artLoc = '';
    if (a.article) {
      const it = state.items.find(x => x.article === a.article);
      const loc = it ? (it.location === '00' ? '00' : it.location) : '?';
      artLoc = `${Toast.escape(a.article)} [${Toast.escape(loc)}]`;
    }

    // Determine Action Name
    const actionName = actionMap[a.action] || a.action;

    return `
    <div style="padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 12px;">
      <b>${new Date(a.ts).toLocaleString()}</b> • ${Toast.escape(a.user)} • ${actionName} 
      ${a.change ? `• <b>${a.change > 0 ? '+' : ''}${a.change}</b>` : ''}
      ${artLoc ? `• ${artLoc}` : ''} ${a.qty != null ? `(remain: ${a.qty})` : ''}
    </div>
  `
  }).join('');

  els.auditDialog.showModal();
}

async function exportAuditTxt() {
  const logs = await storage.getAuditLogs();
  const txt = logs.map(a => `${new Date(a.ts).toLocaleString()} | ${a.user} | ${a.action} | ${a.article || ''} | ${a.qty || ''}`).join('\n');
  download(txt, `audit_log_${Date.now()}.txt`, 'text/plain');
}

// --- Helpers ---
function openItemDialog(existing) {
  document.getElementById('itemDialogTitle').textContent = existing ? 'Edit Sample' : 'Add Sample';
  window._editingPhoto = existing?.photo || '';

  renderLocationsDropdown(existing?.article, existing?.location);

  set('f_article', existing?.article || '');
  set('f_name', existing?.name || '');
  set('f_bn', existing?.bn || '');
  set('f_category2', existing?.category || '');
  set('f_location2', existing?.location || '00');
  set('f_qty', existing?.qty ?? 0);
  set('f_pack_size', existing?.pack_size || existing?.min_qty || '');
  set('f_small_pack', existing?.small_pack || '');
  set('f_standard2', existing?.standard || '');
  set('f_head2', existing?.head || '');
  set('f_recess2', existing?.recess || '');
  set('f_dim1_2', existing?.dim1 || '');
  set('f_dim2_2', existing?.dim2 || '');
  set('f_thread_size', existing?.thread_size || existing?.dim1 || '');
  set('f_length', existing?.length || existing?.dim2 || '');
  set('f_pitch', existing?.pitch || '');
  set('f_shank_length', existing?.shank_length || '');
  set('f_head_d', existing?.head_d || '');
  set('f_head_h', existing?.head_h || '');
  set('f_af', existing?.af || '');
  set('f_nut_h', existing?.nut_h || '');
  set('f_washer_id', existing?.washer_id || '');
  set('f_washer_od', existing?.washer_od || '');
  set('f_washer_t', existing?.washer_t || '');
  set('f_material2', existing?.material || '');
  set('f_grade2', existing?.grade || '');
  set('f_plating2', existing?.plating || '');
  set('f_function_coat', existing?.function_coat || '');
  document.getElementById('f_he_risk').value = existing?.he_risk || '';
  document.getElementById('f_notes').value = existing?.notes || '';
  document.getElementById('f_photo').value = '';

  els.itemDialog.showModal();
}

function renderLocationsDropdown(currentArticle, currentLocation) {
  const sel = document.getElementById('f_location2');
  sel.innerHTML = '';
  const codes = ['00'];
  for (let c = 65; c <= 90; c++) { for (let n = 1; n <= 99; n++) { codes.push(String.fromCharCode(c) + String(n).padStart(2, '0')); } }

  const used = new Set(state.items
    .filter(x => !currentArticle || String(x.article).trim() !== String(currentArticle).trim())
    .map(x => (x.location || '').trim())
    .filter(Boolean));

  const free = codes.filter(loc => loc === '00' || !used.has(loc) || (currentLocation && loc === currentLocation));
  free.forEach(loc => {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = loc === '00' ? '00 (Dummy)' : loc;
    sel.appendChild(opt);
  });
  sel.value = currentLocation || '00';
}

function openDetail(it) {
  window._detailArticle = it.article;

  // Log View Action
  storage.addAudit({ action: 'view-detail', article: it.article, user: state.user.username });

  document.getElementById('detailTitle').textContent = `${it.article} — ${it.name}`;
  // Format BN Title: "BN 123" or "SP 123"
  const rawBN = String(it.bn || '').trim();
  const titleBN = rawBN.toUpperCase().startsWith('SP') || rawBN.toUpperCase().startsWith('BN') ? rawBN : (rawBN ? `BN ${rawBN}` : '');
  document.getElementById('detailBN').textContent = titleBN;
  document.getElementById('detailLoc').textContent = it.location === '00' ? '00 (Dummy)' : it.location;

  const qty = Number(it.qty || 0), minq = Number(it.pack_size || 0);
  let status = 'success';
  if (qty === 0) status = 'danger'; else if (qty < minq) status = 'warning';

  const dQty = document.getElementById('detailQty');
  dQty.textContent = `Qty ${qty}`;
  dQty.className = `badge ${status}`;

  const img = document.getElementById('detailPhoto');
  if (it.photo) img.src = `BNImage/${it.photo}`;
  else if (it.article) img.src = `BNImage/${it.article}.jpg`;
  else img.src = 'assets/placeholder.png';
  img.onerror = () => { img.onerror = null; img.src = 'assets/placeholder.png'; };

  // Drawing Logic
  const drawingImg = document.getElementById('detailDrawing');
  if (it.bn) {
    const bnStr = String(it.bn).trim();
    const isSP = bnStr.toUpperCase().startsWith('SP');

    if (bnStr) {
      drawingImg.style.display = 'block';
      // If SP, use full string e.g. "SP 123456", else "BN 123456"
      // Based on user request "show drawing from folder BNDwg with image SP xxxxxxx"
      // User image shows "BN SP 6189135" but filename likely "SP 6189135.webp" or "6189135.webp"?
      // User wrote: "folder BNDwg with picture SP xxxxxxx"
      // So if BN is "SP 6189135", we look for "BNDwg/SP 6189135.webp"
      // If BN is "790", we look for "BNDwg/BN 790.webp"

      const fileName = isSP ? bnStr : `BN ${bnStr}`;

      drawingImg.src = `BNDwg/${fileName}.webp`;
      drawingImg.dataset.exts = 'jpg,png,gif,jpeg';
      drawingImg.onclick = () => openLightbox(drawingImg.src); // Lightbox

      drawingImg.onerror = function () {
        tryNextImageExt(this, `BNDwg/${fileName}`);
        if (this.src.includes('placeholder')) this.style.display = 'none';
      };
    } else {
      drawingImg.style.display = 'none';
    }
  } else {
    drawingImg.style.display = 'none';
  }

  // Lightbox for Photo
  const imgPhoto = document.getElementById('detailPhoto');
  imgPhoto.onclick = () => openLightbox(imgPhoto.src);

  const fields = [
    ['Article', it.article], ['Name', it.name], ['BN', it.bn],
    ['Category', it.category], ['Location', it.location],
    ['Qty / Pack Size', `${qty} / ${minq}`],
    ['Standard', it.standard], ['Head', it.head], ['Recess', it.recess],
    ['Dim1', it.dim1], ['Dim2', it.dim2],
    ['Thread size', it.thread_size], ['Length', it.length], ['Pitch', it.pitch],
    ['Shank length', it.shank_length], ['Head ∅', it.head_d], ['Head H', it.head_h],
    ['AF / Recess Width', it.af], ['Nut H', it.nut_h],
    ['Washer ID', it.washer_id], ['Washer OD', it.washer_od], ['Washer t', it.washer_t],
    ['Material', it.material], ['Grade/Class/Hardness', it.grade], ['Plating', it.plating],
    ['Function coat', it.function_coat], ['HE risk', it.he_risk],
    ['Notes', it.notes],
    ['Updated', `${new Date(it.updated_at).toLocaleString()} by ${it.updated_by}`]
  ];

  document.getElementById('detailBody').innerHTML = fields.map(([k, v]) => `
    <div class="detail-label">${k}</div>
    <div class="detail-value">${Toast.escape(v || '—')}</div>
  `).join('');

  // UX Delay for Find Equivalent
  const btnFindEq = document.getElementById('detailFindEq');
  if (btnFindEq) {
    btnFindEq.textContent = 'Preparing...';
    btnFindEq.disabled = true;
    setTimeout(() => {
      btnFindEq.textContent = 'Find Equivalent';
      btnFindEq.disabled = false;
    }, 1000);
  }

  els.detailDialog.showModal();
}

function openCompare(baseArticle) {
  const base = state.items.find(x => x.article === baseArticle);
  if (!base) return;
  document.getElementById('cmpBase').textContent = `Base: ${base.article} - ${base.name}`;

  // Pre-fill fields from base item
  const fields = ['standard', 'head', 'recess', 'thread_size', 'length', 'pitch', 'shank_length', 'head_d', 'head_h', 'af', 'washer_id', 'washer_od', 'washer_t', 'material', 'grade', 'plating', 'function_coat', 'he_risk'];

  fields.forEach(f => {
    // Trim values to handle whitespace inconsistencies
    const vals = new Set(state.items.map(i => String(i[f] || '').trim()).filter(Boolean));
    const el = document.getElementById('cmp_' + f);
    if (el) {
      el.innerHTML = '<option value=""></option>' + Array.from(vals).sort().map(v => `<option value="${Toast.escape(v)}">${Toast.escape(v)}</option>`).join('');
      // Pre-select if base has value (also trimmed)
      if (base[f]) {
        el.value = String(base[f]).trim();
      }
    }
  });

  renderCompare();
  els.compareDialog.showModal();
}

function renderCompare() {
  const fields = ['standard', 'head', 'recess', 'thread_size', 'length', 'pitch', 'shank_length', 'head_d', 'head_h', 'af', 'washer_id', 'washer_od', 'washer_t', 'material', 'grade', 'plating', 'function_coat', 'he_risk'];

  // 1. Get current criteria
  const criteria = {};
  fields.forEach(f => {
    const el = document.getElementById('cmp_' + f);
    if (el && el.value) criteria[f] = el.value;
  });

  // 2. Filter items
  const matches = state.items.filter(it => {
    for (const [k, v] of Object.entries(criteria)) {
      if (String(it[k] || '').trim() !== v) return false;
    }
    return true;
  });

  // 3. Recompute Options (Cascading) & Coloring
  fields.forEach(f => {
    const el = document.getElementById('cmp_' + f);
    if (!el) return;

    // Coloring
    if (el.value) {
      el.classList.add('cmp-select-filled');
      el.classList.remove('cmp-select-empty');
    } else {
      el.classList.add('cmp-select-empty');
      el.classList.remove('cmp-select-filled');
    }

    // Available options based on OTHER criteria
    // To do this properly, we filter by everything EXCEPT the current field
    const otherCriteria = { ...criteria };
    delete otherCriteria[f];

    const availableItems = state.items.filter(it => {
      for (const [k, v] of Object.entries(otherCriteria)) {
        if (String(it[k] || '').trim() !== v) return false;
      }
      return true;
    });

    const availableValues = new Set(availableItems.map(i => String(i[f] || '').trim()).filter(Boolean));
    const currentVal = el.value;

    // Re-render options
    // We keep the current value if it exists, even if not in available (though it should be)
    const sortedVals = Array.from(availableValues).sort();
    el.innerHTML = '<option value=""></option>' + sortedVals.map(v => `<option value="${Toast.escape(v)}">${Toast.escape(v)}</option>`).join('');
    el.value = currentVal;
  });

  // 4. Render Results
  const container = document.getElementById('compareResult');
  container.innerHTML = matches.map(it => {
    const qty = Number(it.qty || 0);
    const status = qty > 0 ? 'success' : 'danger';

    // Image Logic
    let imgHtml = '';
    if (it.photo && String(it.photo).trim()) {
      imgHtml = `<img class="cmp-card-img" src="BNImage/${Toast.escape(String(it.photo).trim())}" onerror="this.src='assets/placeholder.png'">`;
    } else if (it.article) {
      imgHtml = `<img class="cmp-card-img" src="BNImage/${Toast.escape(it.article)}.jpg" onerror="this.src='assets/placeholder.png'">`;
    } else {
      imgHtml = `<div class="cmp-card-img" style="display:flex;align-items:center;justify-content:center;color:#ccc;">No Img</div>`;
    }

    return `
    <div class="cmp-card" data-article="${Toast.escape(it.article)}">
      ${imgHtml}
      <div class="cmp-card-info">
        <div class="cmp-card-title" title="${Toast.escape(it.name)}">${Toast.escape(it.article)}</div>
        <div class="cmp-card-meta">
          ${Toast.escape(it.name)}<br>
          <span style="font-size:0.9em;color:var(--text-muted);">${Toast.escape(joinDim(it.dim1, it.dim2))}</span>
        </div>
        <div class="cmp-card-badges">
          <span class="badge ${status}">Qty ${qty}</span>
          <span class="badge">${Toast.escape(it.location === '00' ? '00' : it.location)}</span>
        </div>
      </div>
    </div>
  `}).join('');

  // Add click listeners for navigation
  container.querySelectorAll('.cmp-card').forEach(card => {
    card.addEventListener('click', () => {
      const article = card.dataset.article;
      // Loose comparison for article to handle string/number differences
      const item = state.items.find(x => x.article == article);
      if (item) {
        els.compareDialog.close(); // Close the Find Equivalent dialog
        openDetail(item); // Open the Item Detail dialog
      }
    });
  });
}

// Utils
function val(id) { return document.getElementById(id).value.trim(); }
function set(id, v) { document.getElementById(id).value = v; }
function download(content, name, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
function compactDetails(arr) { return arr.map(s => (s || '').toString().trim() || '-').slice(0, 5); }
function joinDim(a, b) { return [a, b].map(s => (s || '').toString().trim()).filter(Boolean).join(' x '); }
function joinMaterial(m, g, p) { return [m, g, p].map(s => (s || '').toString().trim()).filter(Boolean).join(' '); }

// Image fallback logic
window.tryNextImageExt = function (img, basePath) {
  const exts = (img.dataset.exts || '').split(',');
  const currentSrc = img.src;
  // Try to find which extension failed
  // This is a bit hacky, better to just try next in list
  let nextExt = exts.shift();
  if (nextExt) {
    img.dataset.exts = exts.join(',');
    img.src = `${basePath}.${nextExt}`;
  } else {
    img.onerror = null;
    img.src = 'assets/placeholder.png';
  }
};

// --- Lightbox Logic (Transform Based) ---
let lbScale = 1;
let lbTranslateX = 0;
let lbTranslateY = 0;
let lbIsDragging = false;
let lbStartX, lbStartY;

function updateLbTransform() {
  const img = document.getElementById('lightboxImg');
  if (img) img.style.transform = `translate(${lbTranslateX}px, ${lbTranslateY}px) scale(${lbScale})`;
}

window.lbZoom = function (delta) {
  lbScale += delta;
  if (lbScale < 0.5) lbScale = 0.5; // Min zoom
  if (lbScale > 5) lbScale = 5;     // Max zoom
  updateLbTransform();
}

window.lbReset = function () {
  lbScale = 1;
  lbTranslateX = 0;
  lbTranslateY = 0;
  updateLbTransform();
}

window.openLightbox = function (src) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const content = document.querySelector('.lightbox-content');

  img.src = src;
  lbReset(); // Reset state
  lb.showModal();

  // Wheel Zoom
  content.onwheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    lbZoom(delta);
  };

  // Drag Logic (Transform based)
  img.onmousedown = (e) => {
    e.preventDefault();
    lbIsDragging = true;
    lbStartX = e.clientX - lbTranslateX;
    lbStartY = e.clientY - lbTranslateY;
    img.classList.add('grabbing');
  };

  window.onmousemove = (e) => {
    if (!lbIsDragging) return;
    e.preventDefault();
    lbTranslateX = e.clientX - lbStartX;
    lbTranslateY = e.clientY - lbStartY;
    updateLbTransform();
  };

  window.onmouseup = () => {
    lbIsDragging = false;
    if (img) img.classList.remove('grabbing');
  };

  // Close on background click
  lb.onclick = (e) => {
    if (e.target === lb || e.target === content) {
      lb.close();
    }
  };
};

// --- Order Helper Functions ---
function toggleSelection(article) {
  if (state.selectedItems.has(article)) {
    state.selectedItems.delete(article);
  } else {
    state.selectedItems.add(article);
  }
  render();
}

function openOrderDialog() {
  const list = [];
  state.selectedItems.forEach(art => {
    const item = state.items.find(x => x.article === art);
    if (item) list.push(item);
  });

  document.getElementById('orderError').textContent = ''; // Clear previous errors
  const tbody = document.getElementById('orderList');
  tbody.innerHTML = list.map(it => {
    const packSize = Number(it.pack_size) || 1;
    const smallSize = Number(it.small_pack) || packSize; // Fallback rule

    return `
    <tr style="border-bottom: 1px solid var(--border);" data-pack="${packSize}" data-small="${smallSize}">
      <td style="padding: 8px;">${Toast.escape(it.article)}</td>
      <td style="padding: 8px;">${Toast.escape(it.bn || '-')}</td>
      <td style="padding: 8px;">${Toast.escape(it.name)}</td>
      <td style="padding: 8px;">${Toast.escape(it.location)}</td>
      <td style="padding: 8px;">${it.qty || 0}</td>
      <td style="padding: 8px;">${it.pack_size || '-'}</td>
      <td style="padding: 8px;">${it.small_pack || '-'}</td>
      <td style="padding: 8px;">
        <input type="number" class="form-control inp-pack" style="width: 70px;" min="0" placeholder="0">
      </td>
      <td style="padding: 8px;">
        <input type="number" class="form-control inp-small" style="width: 70px;" min="0" placeholder="0">
      </td>
      <td style="padding: 8px;" class="ord-total">0</td>
      <td style="padding: 8px;">
         <button class="btn btn-sm btn-danger" onclick="toggleSelection('${it.article}'); openOrderDialog();">X</button>
      </td>
    </tr>
  `}).join('');

  // Attach Listeners for Calculation & Validation
  tbody.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      const tr = input.closest('tr');
      const packVal = Number(tr.querySelector('.inp-pack').value) || 0;
      const smallVal = Number(tr.querySelector('.inp-small').value) || 0;
      const packSize = Number(tr.dataset.pack);
      const smallSize = Number(tr.dataset.small);

      const total = (packVal * packSize) + (smallVal * smallSize);
      const qtyEl = tr.querySelector('.ord-total');

      let html = String(total);
      // Validation: Minimum Order = Pack Size
      if (total > 0 && total < packSize) {
        qtyEl.style.color = 'var(--danger)';
        html += ` <span title="Minimum order is Pack Size (${packSize})" style="cursor: help;">⚠️</span>`;
      } else {
        qtyEl.style.color = '';
      }
      qtyEl.innerHTML = html;
    });
  });

  els.orderDialog.showModal();
}

function exportOrder() {
  document.getElementById('orderError').textContent = '';
  const rows = document.querySelectorAll('#orderList tr');
  const orderData = [];

  for (const tr of rows) {
    const packInp = tr.querySelector('.inp-pack');
    const smallInp = tr.querySelector('.inp-small');
    if (!packInp || !smallInp) continue;

    const packVal = parseInt(packInp.value) || 0;
    const smallVal = parseInt(smallInp.value) || 0;

    if (packVal > 0 || smallVal > 0) {
      const artText = tr.cells[0].textContent.trim();
      const item = state.items.find(x => x.article === artText);

      if (item) {
        const packSize = Number(tr.dataset.pack) || 0;
        const smallSize = Number(tr.dataset.small) || 0;
        const totalQty = (packVal * packSize) + (smallVal * smallSize);

        if (totalQty < packSize) {
          const msg = `Item ${item.article}: Order Qty (${totalQty}) < Pack Size (${packSize})`;
          document.getElementById('orderError').textContent = msg;
          return; // Abort export
        }

        orderData.push({
          'Article': item.article,
          'BN': item.bn,
          'Description': item.name,
          'Location': item.location,
          'Current Qty': item.qty,
          'Pack size': packSize,
          'Small pack': smallSize,
          'Order Pack': packVal,
          'Order Small': smallVal,
          'Order Qty': totalQty
        });
      }
    }
  }

  if (orderData.length === 0) return Toast.info('Please enter order quantity for at least one item');

  const ws = XLSX.utils.json_to_sheet(orderData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Order");
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Fastener Library Order ${dateStr}.xlsx`);

  els.orderDialog.close();
  state.selectedItems.clear();
  render();
  Toast.success('Order exported to Excel');
}



// --- Export / Backup Functions ---
function exportAllExcel() {
  if (!state.items.length) return Toast.info('No items to export');

  const rows = state.items.map(it => ({
    article: it.article,
    name: it.name,
    bn: it.bn,
    category: it.category,
    location: it.location,
    qty: it.qty,
    pack_size: it.pack_size,
    small_pack: it.small_pack,
    standard: it.standard,
    head: it.head,
    recess: it.recess,
    material: it.material,
    grade: it.grade,
    plating: it.plating,
    dim1: it.dim1,
    dim2: it.dim2,
    thread_size: it.thread_size,
    length: it.length,
    pitch: it.pitch,
    shank_length: it.shank_length,
    head_d: it.head_d,
    head_h: it.head_h,
    af: it.af,
    nut_h: it.nut_h,
    washer_id: it.washer_id,
    washer_od: it.washer_od,
    washer_t: it.washer_t,
    function_coat: it.function_coat,
    he_risk: it.he_risk,
    notes: it.notes,
    photo: it.photo,
    updated_by: it.updated_by || '',
    updated_at: it.updated_at || ''
  }));

  const dateStr = new Date().toISOString().slice(0, 10);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventory");
  XLSX.writeFile(wb, `Fastener Library ${dateStr}.xlsx`);
  Toast.success('Inventory exported to Excel');
}

function backupData(type) {
  if (!state.items.length) return Toast.info('No data to backup');

  const data = JSON.stringify(state.items, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  const date = new Date().toISOString().slice(0, 10);
  a.download = type === 'backup' ? `Bossard_Backup_${date}.json` : `Bossard_Data.json`;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  Toast.success(type === 'backup' ? 'Backup created' : 'Data saved as JSON');
}

// Start
init().catch(console.error);

// --- Image Handler ---
function tryNextImageExt(img, basePath) {
  const exts = (img.dataset.exts || 'jpg,png,webp,jpeg').split(',');
  let visited = (img.dataset.visited || '').split(',').filter(Boolean);

  // Find next ext
  const nextExt = exts.find(e => !visited.includes(e));
  if (nextExt) {
    visited.push(nextExt);
    img.dataset.visited = visited.join(',');
    img.src = `${basePath}.${nextExt}`;
  } else {
    // No more exts
    img.onerror = null;
    img.src = 'assets/placeholder.png';
  }
}
