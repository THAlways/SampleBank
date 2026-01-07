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
let state = {
  user: { username: 'Guest', role: 'guest' },
  items: []
};

// DOM Elements
const els = {
  cards: document.getElementById('cards'),
  categorySelect: document.getElementById('categorySelect'),
  searchInput: document.getElementById('searchInput'),
  onlySample: document.getElementById('onlySample'),
  onlyLowStock: document.getElementById('onlyLowStock'),
  currentUserLabel: document.getElementById('currentUserLabel'),
  totalItems: document.getElementById('totalItems'),
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
  compareDialog: document.getElementById('compareDialog')
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
  if (s) els.onlySample.checked = (s === '1');
  if (l) els.onlyLowStock.checked = (l === '1');

  render();
  render();
  setupEventListeners();

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

  document.getElementById('btnClearFilters').addEventListener('click', () => {
    Object.values(els.filters).forEach(el => el.value = '');
    els.categorySelect.value = '';
    els.searchInput.value = '';
    els.onlySample.checked = false;
    els.onlyLowStock.checked = false;
    localStorage.setItem(LS_KEYS.LEGACY_TOGGLE_SAMPLE, '0');
    localStorage.setItem(LS_KEYS.LEGACY_TOGGLE_LOW, '0');
    render();
    Toast.info('Filters cleared');
  });

  // Buttons
  document.getElementById('btnAdd').addEventListener('click', () => openItemDialog());
  document.getElementById('btnSettings').addEventListener('click', () => els.loginDialog.showModal());
  document.getElementById('btnImportExcel').addEventListener('click', () => els.importDialog.showModal());
  document.getElementById('btnAudit').addEventListener('click', showAuditLog);

  // Login
  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value;
    const user = await storage.getUser(u);
    if (user && user.passwordHash === storage.sha(p)) {
      state.user = { username: u, role: user.role };
      els.currentUserLabel.textContent = u;
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
  document.getElementById('btnExportExcel').addEventListener('click', exportExcel);
  document.getElementById('btnExportJSON').addEventListener('click', exportJSON);
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
  document.querySelectorAll('#compareDialog select').forEach(s => s.addEventListener('change', renderCompare));
}

// ... (existing code) ...

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
        <div class="cmp-card-title" title="${Toast.escape(it.name)}">${Toast.escape(it.article)}</div>
        <div class="cmp-card-meta">${Toast.escape(it.name)}</div>
        <div class="cmp-card-badges">
          <span class="badge ${status}">Qty ${qty}</span>
          <span class="badge">${Toast.escape(it.location === '00' ? '00' : it.location)}</span>
        </div>
      </div>
    </div>
  `}).join('');
}

// --- Rendering ---
function getCurrentSelections() {
  return {
    categoryTop: els.categorySelect.value || '',
    q: (els.searchInput.value || '').trim().toLowerCase(),
    toggles: { sample: !!els.onlySample.checked, low: !!els.onlyLowStock.checked },
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
    list = list.filter(it => Number(it.min_qty || 0) > 0 && Number(it.qty || 0) < Number(it.min_qty));
  }
  return list;
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
  const selections = getCurrentSelections();
  recomputeSidebarOptions(selections);
  const list = applyFilterPipeline(state.items, selections);

  els.totalItems.textContent = `Filtered: ${list.length} / Total: ${state.items.length}`;
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
  for (const it of list) {
    const card = createCard(it, observer);
    fragment.appendChild(card);
  }
  els.cards.appendChild(fragment);
}

function createCard(it, observer) {
  const qty = Number(it.qty || 0), minq = Number(it.min_qty || 0);
  let status = 'success';
  if (qty === 0) status = 'danger';
  else if (qty < minq) status = 'warning';

  const wrap = document.createElement('article');
  wrap.className = 'card';
  if (qty === 0) wrap.classList.add('out-of-stock');

  const bnNumMatch = String(it.bn || '').match(/\d+/);
  const bnLink = (bnNumMatch && bnNumMatch[0]) ? `https://www.bossard.com/global-en/eshop/search/p/${bnNumMatch[0]}/` : null;
  const bnText = (!it.bn || String(it.bn).trim() === '') ? 'Unknown' : (bnNumMatch ? `BN ${bnNumMatch[0]}` : String(it.bn).trim());

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
    <div class="card-header">
      <div class="card-title" title="${Toast.escape(it.name)}">${Toast.escape(it.article)}</div>
      <div class="card-badges">
        <span class="badge ${status}">Qty ${qty}</span>
        <span class="badge">${Toast.escape(it.location === '00' ? '00 (Dummy)' : it.location)}</span>
      </div>
    </div>
    <div class="card-img-container">
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
      <button class="btn btn-sm btn-ghost" data-action="manage">Manage</button>
      <button class="btn btn-sm ${it.notes ? 'btn-primary' : 'btn-ghost'}" data-action="note">Note</button>
      <button class="btn btn-sm btn-ghost" data-action="edit">Edit</button>
      <button class="btn btn-sm btn-danger" data-action="delete">Del</button>
    </div>
  `;

  // Observers
  const img = wrap.querySelector('img');
  if (img) observer.observe(img);

  // Events
  wrap.querySelector('.card-img-container').addEventListener('click', () => openDetail(it));
  wrap.querySelector('.card-title').addEventListener('click', () => openDetail(it));

  wrap.querySelector('[data-action="manage"]').addEventListener('click', () => {
    window._manageArticle = it.article;
    document.getElementById('m_amount').value = 0;
    document.getElementById('manageMeta').textContent = `${it.article} • ${it.name}`;
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

  const item = {
    article: val('f_article'), name: val('f_name'), bn: val('f_bn'),
    category: val('f_category2'), location: selLoc || '00',
    qty: Number(val('f_qty') || 0), min_qty: Number(val('f_minqty') || 0),
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
  state.items = await storage.getAllItems(); // Refresh from DB
  await storage.addAudit({ action: 'save', article: item.article, user: state.user.username });

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

  let q = Number(it.qty || 0);
  if (kind === 'minus') q = Math.max(0, q - amt);
  else q += amt;

  it.qty = q;
  it.updated_by = state.user.username;
  it.updated_at = Date.now();

  await storage.saveItem(it);
  await storage.addAudit({ action: `manage:${kind}`, article: it.article, qty: it.qty, user: state.user.username });

  els.manageDialog.close();
  render();
  Toast.success(`Stock updated: ${q}`);
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
        qty: Number(r.qty || 0), min_qty: Number(r.min_qty || 0),
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

function exportExcel() {
  const headers = ['article', 'name', 'bn', 'category', 'location', 'qty', 'min_qty', 'standard', 'head', 'recess', 'material', 'grade', 'plating', 'dim1', 'dim2',
    'thread_size', 'length', 'pitch', 'shank_length', 'head_d', 'head_h', 'af', 'nut_h', 'washer_id', 'washer_od', 'washer_t', 'function_coat', 'he_risk', 'notes', 'photo', 'updated_by', 'updated_at'];
  const list = applyFilterPipeline(state.items, getCurrentSelections());
  const data = list.map(it => headers.map(h => it[h] ?? ''));
  data.unshift(headers);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'SampleBank');
  XLSX.writeFile(wb, `samplebank_${APP_VERSION}_${Date.now()}.xlsx`);
}

function exportJSON() {
  const list = applyFilterPipeline(state.items, getCurrentSelections());
  download(JSON.stringify(list, null, 2), `samplebank_${APP_VERSION}.json`, 'application/json');
}

async function backupData() {
  const items = await storage.getAllItems();
  const audit = await storage.getAuditLogs();
  const payload = { version: APP_VERSION, exportedAt: new Date().toISOString(), items, audit };
  download(JSON.stringify(payload, null, 2), `backup_${APP_VERSION}_${Date.now()}.json`, 'application/json');
}

async function showAuditLog() {
  const logs = await storage.getAuditLogs();
  const list = document.getElementById('auditList');
  list.innerHTML = logs.slice(0, 200).map(a => `
    <div style="padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 12px;">
      <b>${new Date(a.ts).toLocaleString()}</b> • ${Toast.escape(a.user)} • ${a.action} 
      ${a.article ? `• ${Toast.escape(a.article)}` : ''} ${a.qty != null ? `(Qty: ${a.qty})` : ''}
    </div>
  `).join('');
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
  set('f_minqty', existing?.min_qty || '10');
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
  document.getElementById('detailTitle').textContent = `${it.article} — ${it.name}`;
  document.getElementById('detailBN').textContent = it.bn ? `BN ${it.bn}` : '';
  document.getElementById('detailLoc').textContent = it.location === '00' ? '00 (Dummy)' : it.location;

  const qty = Number(it.qty || 0), minq = Number(it.min_qty || 0);
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

  const fields = [
    ['Article', it.article], ['Name', it.name], ['BN', it.bn],
    ['Category', it.category], ['Location', it.location],
    ['Qty / Min', `${qty} / ${minq}`],
    ['Standard', it.standard], ['Head', it.head], ['Recess', it.recess],
    ['Dim1', it.dim1], ['Dim2', it.dim2],
    ['Thread size', it.thread_size], ['Length', it.length], ['Pitch', it.pitch],
    ['Shank length', it.shank_length], ['Head ⌀', it.head_d], ['Head H', it.head_h],
    ['AF', it.af], ['Nut H', it.nut_h],
    ['Washer ID', it.washer_id], ['Washer OD', it.washer_od], ['Washer t', it.washer_t],
    ['Material', it.material], ['Grade', it.grade], ['Plating', it.plating],
    ['Function coat', it.function_coat], ['HE risk', it.he_risk],
    ['Notes', it.notes],
    ['Updated', `${new Date(it.updated_at).toLocaleString()} by ${it.updated_by}`]
  ];

  document.getElementById('detailBody').innerHTML = fields.map(([k, v]) => `
    <div class="detail-label">${k}</div>
    <div class="detail-value">${Toast.escape(v || '—')}</div>
  `).join('');

  els.detailDialog.showModal();
}

function openCompare(baseArticle) {
  const base = state.items.find(x => x.article === baseArticle);
  if (!base) return;
  document.getElementById('cmpBase').textContent = `Base: ${base.article} - ${base.name}`;

  // Pre-fill fields from base item
  const fields = ['standard', 'head', 'recess', 'thread_size', 'length', 'pitch', 'shank_length', 'head_d', 'head_h', 'af', 'washer_id', 'washer_od', 'washer_t', 'material', 'grade', 'plating', 'function_coat', 'he_risk'];

  fields.forEach(f => {
    const el = document.getElementById('cmp_' + f);
    if (el) el.value = base[f] || '';
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

// Start
init().catch(console.error);
