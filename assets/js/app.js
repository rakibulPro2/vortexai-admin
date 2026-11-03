/*!
 * VortexAI - shared behaviour for every page.
 * Sections: 1 Sidebar | 2 Theme toggle | 3 Date + year | 4 Users page | 5 Products page | 6 Settings page
 * Each page-specific block only runs when its elements exist, so this one file is safe on all pages.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  /* ---------- 1. Mobile sidebar ---------- */
  const sidebar = $('sidebar');
  const overlay = $('overlay');
  function toggleSidebar(open) {
    sidebar.classList.toggle('-translate-x-full', !open);
    overlay.classList.toggle('hidden', !open);
  }
  $('menu-btn')?.addEventListener('click', () => toggleSidebar(true));
  $('close-btn')?.addEventListener('click', () => toggleSidebar(false));
  overlay?.addEventListener('click', () => toggleSidebar(false));

  /* ---------- 2. Light / Dark toggle (choice is remembered) ---------- */
  $('theme-btn')?.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
  });


  /* ---------- 2b. Header: notification + profile dropdowns, logout modal (no libraries) ---------- */
  const SHOW = 'visible translate-y-0 scale-100 opacity-100'.split(' ');
  const HIDE = 'invisible translate-y-2 scale-95 opacity-0'.split(' ');
  const dropdowns = Array.from(document.querySelectorAll('[data-dropdown]'));
  function setDropdown(dd, open) {
    const panel = dd.querySelector('[data-dropdown-panel]');
    panel.classList.remove(...(open ? HIDE : SHOW)); panel.classList.add(...(open ? SHOW : HIDE));
    dd.querySelector('[data-dropdown-btn]').setAttribute('aria-expanded', String(open));
  }
  dropdowns.forEach((dd) => dd.querySelector('[data-dropdown-btn]').addEventListener('click', () => {
    const willOpen = dd.querySelector('[data-dropdown-panel]').classList.contains('invisible');
    dropdowns.forEach((other) => setDropdown(other, other === dd && willOpen));
  }));
  document.addEventListener('click', (e) => dropdowns.forEach((dd) => { if (!dd.contains(e.target)) setDropdown(dd, false); }));

  // Notifications: unread dots, counter and "Mark all as read"
  const notifs = Array.from(document.querySelectorAll('[data-notif]'));
  function refreshNotifs() {
    const unread = notifs.filter((n) => n.dataset.unread === 'true').length;
    $('notif-count').textContent = unread + ' new';
    $('notif-count').classList.toggle('hidden', unread === 0);
    $('notif-dot').classList.toggle('hidden', unread === 0);
    $('notif-readall').disabled = unread === 0;
  }
  function markRead(n) {
    n.dataset.unread = 'false'; n.classList.remove('bg-volt-500/5');
    n.querySelector('.notif-unread').classList.add('hidden');
  }
  if (notifs.length) {
    notifs.forEach((n) => n.addEventListener('click', () => { markRead(n); refreshNotifs(); }));
    $('notif-readall').addEventListener('click', () => { notifs.forEach(markRead); refreshNotifs(); });
    refreshNotifs();
  }

  // Logout confirmation modal
  const logoutModal = $('logout-modal');
  if (logoutModal) {
    let opener = null;
    function setLogout(open) {
      logoutModal.classList.toggle('invisible', !open);
      logoutModal.setAttribute('aria-hidden', String(!open));
      $('logout-backdrop').classList.toggle('opacity-0', !open);
      const panel = $('logout-panel');
      panel.classList.remove(...(open ? 'translate-y-4 scale-95 opacity-0' : 'translate-y-0 scale-100 opacity-100').split(' '));
      panel.classList.add(...(open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0').split(' '));
      document.body.classList.toggle('overflow-hidden', open);
      // The buttons inside fade in, so they become focusable a moment later: retry until the focus sticks
      if (open) { let tries = 0; const t = setInterval(() => { $('logout-cancel').focus(); if (document.activeElement === $('logout-cancel') || ++tries > 15) clearInterval(t); }, 30); }
      else if (opener) opener.focus();
    }
    document.querySelectorAll('[data-logout-open]').forEach((b) => b.addEventListener('click', () => {
      opener = b; dropdowns.forEach((dd) => setDropdown(dd, false)); setLogout(true);
    }));
    document.querySelectorAll('[data-logout-close]').forEach((b) => b.addEventListener('click', () => setLogout(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !logoutModal.classList.contains('invisible')) setLogout(false); });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') dropdowns.forEach((dd) => setDropdown(dd, false)); });

  /* ---------- 3. Today's date + footer year ---------- */
  if ($('today')) $('today').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  if ($('year')) $('year').textContent = new Date().getFullYear();

  /* Shared button styles for tabs / filter chips */
  const ON = 'bg-volt-500 text-white shadow'.split(' ');
  const OFF = 'text-midnight-600 hover:text-midnight-900 dark:text-midnight-400 dark:hover:text-white'.split(' ');
  function setActive(btn, on) {
    btn.classList.remove(...(on ? OFF : ON));
    btn.classList.add(...(on ? ON : OFF));
    btn.setAttribute('aria-pressed', String(on));
  }

  /* ---------- 4. Users page ---------- */
  if ($('users-body')) {
    const ROLE = {
      Admin: 'bg-cyber-500/10 text-cyber-700 ring-cyber-500/20 dark:text-cyber-300',
      Editor: 'bg-cyan-500/10 text-cyan-700 ring-cyan-500/20 dark:text-cyan-300',
      Viewer: 'bg-midnight-500/10 text-midnight-700 ring-midnight-500/20 dark:text-midnight-300',
    };
    const STATUS = {
      Active: ['bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400', 'bg-emerald-500'],
      Suspended: ['bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400', 'bg-rose-500'],
      Inactive: ['bg-midnight-500/10 text-midnight-600 ring-midnight-500/20 dark:text-midnight-400', 'bg-midnight-400'],
    };
    const GRADS = ['from-volt-600 to-cyber-500', 'from-emerald-500 to-cyan-500', 'from-rose-500 to-orange-400', 'from-amber-500 to-rose-500', 'from-cyber-500 to-fuchsia-500', 'from-cyan-500 to-volt-500'];
    const EDIT_ICON = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
    const TRASH_ICON = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>';

    // Demo data - replace with your API response
    let users = [
      { id: 1, name: 'Olivia Martin', email: 'olivia@example.com', role: 'Admin', status: 'Active' },
      { id: 2, name: 'Jackson Lee', email: 'jackson@example.com', role: 'Editor', status: 'Active' },
      { id: 3, name: 'Isabella Nguyen', email: 'isabella@example.com', role: 'Viewer', status: 'Inactive' },
      { id: 4, name: 'William Kim', email: 'will@example.com', role: 'Editor', status: 'Suspended' },
      { id: 5, name: 'Sofia Davis', email: 'sofia@example.com', role: 'Viewer', status: 'Active' },
      { id: 6, name: 'Liam Carter', email: 'liam@example.com', role: 'Viewer', status: 'Inactive' },
      { id: 7, name: 'Emma Wilson', email: 'emma@example.com', role: 'Admin', status: 'Active' },
      { id: 8, name: 'Noah Brown', email: 'noah@example.com', role: 'Editor', status: 'Active' },
      { id: 9, name: 'Ava Johnson', email: 'ava@example.com', role: 'Viewer', status: 'Suspended' },
      { id: 10, name: 'Mason Clark', email: 'mason@example.com', role: 'Viewer', status: 'Active' },
    ];
    let nextId = 11;
    const body = $('users-body');
    const modal = $('user-modal');
    const esc = (t) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

    function render() {
      const role = $('role-filter').value, status = $('status-filter').value;
      const q = $('user-search').value.trim().toLowerCase();
      const list = users.filter((u) => (role === 'All' || u.role === role) && (status === 'All' || u.status === status) && (u.name + u.email).toLowerCase().includes(q));
      body.innerHTML = list.map((u) => `
        <tr class="vx-row">
          <td class="px-5 py-4"><div class="flex items-center gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${GRADS[u.id % GRADS.length]} text-xs font-bold text-white">${esc(initials(u.name))}</span>
            <div><p class="font-medium text-midnight-900 dark:text-white">${esc(u.name)}</p><p class="text-xs text-midnight-500">${esc(u.email)}</p></div></div></td>
          <td class="px-5 py-4"><span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${ROLE[u.role]}">${u.role}</span></td>
          <td class="px-5 py-4"><span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS[u.status][0]}"><span class="h-1.5 w-1.5 rounded-full ${STATUS[u.status][1]}"></span>${u.status}</span></td>
          <td class="px-5 py-4"><div class="flex justify-end gap-1">
            <button type="button" data-edit="${u.id}" class="grid h-9 w-9 place-items-center rounded-lg text-midnight-500 transition-all duration-300 hover:bg-volt-500/10 hover:text-volt-700 dark:hover:text-volt-400" aria-label="Edit ${esc(u.name)}">${EDIT_ICON}</button>
            <button type="button" data-del="${u.id}" class="grid h-9 w-9 place-items-center rounded-lg text-midnight-500 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400" aria-label="Delete ${esc(u.name)}">${TRASH_ICON}</button>
          </div></td></tr>`).join('');
      $('users-empty').classList.toggle('hidden', list.length > 0);
      $('users-count').textContent = `Showing ${list.length} of ${users.length} users`;
      $('stat-total').textContent = users.length;
      ['Active', 'Suspended', 'Inactive'].forEach((s) => { $('stat-' + s.toLowerCase()).textContent = users.filter((u) => u.status === s).length; });
    }

    function openModal(user) {
      $('modal-title').textContent = user ? 'Edit User' : 'Add New User';
      $('modal-submit').textContent = user ? 'Save changes' : 'Add user';
      $('u-id').value = user ? user.id : '';
      $('u-name').value = user ? user.name : '';
      $('u-email').value = user ? user.email : '';
      $('u-role').value = user ? user.role : 'Viewer';
      $('u-status').value = user ? user.status : 'Active';
      modal.classList.remove('hidden'); modal.classList.add('flex');
      $('u-name').focus();
    }
    function closeModal() { modal.classList.add('hidden'); modal.classList.remove('flex'); }

    body.addEventListener('click', (e) => {
      const edit = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
      if (edit) openModal(users.find((u) => u.id === +edit.dataset.edit));
      if (del && confirm('Delete this user? This cannot be undone.')) { users = users.filter((u) => u.id !== +del.dataset.del); render(); }
    });
    ['role-filter', 'status-filter'].forEach((id) => $(id).addEventListener('change', render));
    $('user-search').addEventListener('input', render);
    $('add-user-btn').addEventListener('click', () => openModal(null));
    $('modal-close').addEventListener('click', closeModal);
    $('modal-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    $('user-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = { name: $('u-name').value.trim(), email: $('u-email').value.trim(), role: $('u-role').value, status: $('u-status').value };
      const id = +$('u-id').value;
      if (id) Object.assign(users.find((u) => u.id === id), data); else users.push({ id: nextId++, ...data });
      closeModal(); render();
    });
    render();
  }

  /* ---------- 5. Products page: category chips, search and "Add Product" ---------- */
  if ($('product-search')) {
    const chips = document.querySelectorAll('[data-chip]');
    const grid = document.querySelector('[aria-label="Product catalog"]');
    let cat = 'All';
    const cards = () => grid.querySelectorAll('[data-product]');
    function filterProducts() {
      const q = $('product-search').value.trim().toLowerCase();
      let shown = 0;
      cards().forEach((c) => {
        const ok = (cat === 'All' || c.dataset.cat === cat) && c.dataset.name.toLowerCase().includes(q);
        c.classList.toggle('hidden', !ok); if (ok) shown++;
      });
      $('product-empty').classList.toggle('hidden', shown > 0);
    }
    function selectChip(name) {
      cat = name;
      chips.forEach((c) => setActive(c, c.dataset.chip === name));
      filterProducts();
    }
    chips.forEach((chip) => chip.addEventListener('click', () => selectChip(chip.dataset.chip)));
    $('product-search').addEventListener('input', filterProducts);

    // --- Add Product modal ---
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const svg = (p) => `<svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
    const THEME = {   // one colour + icon per category (full class names so the stylesheet build finds them)
      Templates: { hover: 'hover:border-cyan-400/40', tile: 'from-cyan-500/25 to-cyan-500/5 text-cyan-600 dark:text-cyan-400', icon: svg('<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>') },
      Design: { hover: 'hover:border-cyber-400/40', tile: 'from-cyber-500/25 to-cyber-500/5 text-cyber-600 dark:text-cyber-400', icon: svg('<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>') },
      Subscription: { hover: 'hover:border-volt-400/40', tile: 'from-volt-500/25 to-volt-500/5 text-volt-700 dark:text-volt-400', icon: svg('<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>') },
      Services: { hover: 'hover:border-emerald-400/40', tile: 'from-emerald-500/25 to-emerald-500/5 text-emerald-600 dark:text-emerald-400', icon: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>') },
    };
    const modal = $('product-modal');
    let toastTimer;
    function toast(msg) {
      const t = $('product-toast'); t.textContent = msg; t.classList.remove('hidden');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), 2600);
    }
    function openModal() {
      $('product-form').reset(); $('product-error').classList.add('hidden');
      modal.classList.remove('hidden'); modal.classList.add('flex'); $('p-name').focus();
    }
    function closeModal() { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    function productCard(p) {
      const t = THEME[p.cat], inStock = p.stock === 'in';
      return `<article data-product data-cat="${p.cat}" data-name="${esc(p.name)}" class="group overflow-hidden rounded-2xl border border-midnight-200 bg-white shadow-sm shadow-midnight-200/70 transition-all duration-300 hover:-translate-y-1 ${t.hover} dark:border-white/5 dark:bg-midnight-800/40 dark:shadow-none dark:backdrop-blur">
        <div class="grid h-40 place-items-center bg-gradient-to-br ${t.tile}"><span class="transition-transform duration-300 group-hover:scale-110">${t.icon}</span></div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-3"><div class="min-w-0"><h3 class="truncate font-semibold text-midnight-900 dark:text-white">${esc(p.name)}</h3><p class="text-xs text-midnight-500">${p.cat}</p></div><p class="text-lg font-bold text-midnight-900 dark:text-white">${esc(p.price)}</p></div>
          <div class="mt-4 flex items-center justify-between border-t border-midnight-200 pt-4 dark:border-white/5">
            <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${inStock ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400'}"><span class="h-1.5 w-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}"></span>${inStock ? 'In Stock' : 'Out of Stock'}</span>
            <div class="text-right"><p class="text-[11px] text-midnight-500">Total revenue</p><p class="text-sm font-semibold text-midnight-900 dark:text-white">$0</p></div>
          </div></div></article>`;
    }
    $('add-product-btn').addEventListener('click', openModal);
    $('product-close').addEventListener('click', closeModal);
    $('product-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    $('product-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('p-name').value.trim(), price = parseFloat($('p-price').value);
      const err = !name ? 'Please enter a product name.' : isNaN(price) || price < 0 ? 'Please enter a valid price.' : '';
      $('product-error').textContent = err; $('product-error').classList.toggle('hidden', !err);
      if (err) return;
      const product = { name, cat: $('p-cat').value, stock: document.querySelector('input[name="p-stock"]:checked').value, price: '$' + (Number.isInteger(price) ? price : price.toFixed(2)) };
      grid.insertAdjacentHTML('afterbegin', productCard(product));   // newest product first
      $('product-search').value = '';
      selectChip('All');
      closeModal(); toast('Product added');
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- 6. Settings page: tabs, avatar preview, password check, saved message ---------- */
  const tabs = document.querySelectorAll('[data-tab]');
  if (tabs.length) {
    function showTab(name) {
      if (!document.querySelector(`[data-panel="${name}"]`)) name = 'profile';
      tabs.forEach((t) => setActive(t, t.dataset.tab === name));
      document.querySelectorAll('[data-panel]').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== name));
    }
    tabs.forEach((t) => t.addEventListener('click', () => { showTab(t.dataset.tab); history.replaceState(null, '', '#' + t.dataset.tab); }));
    showTab(location.hash.slice(1));

    $('avatar-input')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      $('avatar-img').src = URL.createObjectURL(file);
      $('avatar-img').classList.remove('hidden');
      $('avatar-initials').classList.add('hidden');
    });
    $('avatar-remove')?.addEventListener('click', () => {
      $('avatar-img').classList.add('hidden'); $('avatar-initials').classList.remove('hidden'); $('avatar-input').value = '';
    });
  }
  document.querySelectorAll('form[data-save]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = f.querySelector('.form-error');
    if (f.id === 'password-form') {
      const bad = $('pw-new').value.length < 8 ? 'New password must be at least 8 characters.' : $('pw-new').value !== $('pw-confirm').value ? 'Passwords do not match.' : '';
      if (err) { err.textContent = bad; err.classList.toggle('hidden', !bad); }
      if (bad) return;
      f.reset();
    }
    const msg = f.querySelector('.save-msg');
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 2500);
  }));

  /* ---------- 7. Chat page ---------- */
  if ($('chat-list')) {
    const GRADS = ['from-volt-600 to-cyber-500', 'from-emerald-500 to-cyan-500', 'from-rose-500 to-orange-400', 'from-amber-500 to-rose-500', 'from-cyber-500 to-fuchsia-500', 'from-cyan-500 to-volt-500'];
    const DOT = { online: 'bg-emerald-500', away: 'bg-amber-400', offline: 'bg-midnight-400' };
    const STATUS = { online: 'Online', away: 'Away', offline: 'Offline' };
    const REPLIES = ['Sounds good, thanks!', 'Got it. I will take a look shortly.', 'Perfect, let us do that.', 'Great idea! Can you send more details?', 'Thanks for the update.'];

    // Demo data - replace with your API / WebSocket messages
    const chats = [
      { id: 1, name: 'Olivia Martin', status: 'online', unread: 2, time: '10:42 AM', msgs: [
        { from: 'them', text: 'Hi Alex! Did you get a chance to review the new dashboard mockups?', time: '10:30 AM' },
        { from: 'me', text: 'Yes, they look fantastic. I especially like the new analytics layout.', time: '10:34 AM' },
        { from: 'them', text: 'Great to hear! I will export the final assets today.', time: '10:41 AM' },
        { from: 'them', text: 'Can we sync tomorrow at 11?', time: '10:42 AM' } ] },
      { id: 2, name: 'Jackson Lee', status: 'online', unread: 0, time: '9:15 AM', msgs: [
        { from: 'me', text: 'Morning Jackson, is the release branch ready?', time: '9:02 AM' },
        { from: 'them', text: 'Almost. Running the last regression tests now.', time: '9:10 AM' },
        { from: 'them', text: 'I will ping you as soon as it is green.', time: '9:15 AM' } ] },
      { id: 3, name: 'Isabella Nguyen', status: 'away', unread: 1, time: 'Yesterday', msgs: [
        { from: 'them', text: 'The invoice for October is attached. Please confirm the amount.', time: 'Yesterday' },
        { from: 'me', text: 'Thanks Isabella, I will check it with finance.', time: 'Yesterday' },
        { from: 'them', text: 'No rush, any time this week works.', time: 'Yesterday' } ] },
      { id: 4, name: 'William Kim', status: 'offline', unread: 0, time: 'Yesterday', msgs: [
        { from: 'them', text: 'Thanks for covering my shift last week!', time: 'Yesterday' },
        { from: 'me', text: 'Happy to help. Enjoy the time off.', time: 'Yesterday' } ] },
      { id: 5, name: 'Sofia Davis', status: 'online', unread: 3, time: 'Mon', msgs: [
        { from: 'them', text: 'Hey, quick question about the pricing page.', time: 'Mon' },
        { from: 'them', text: 'Should the annual plan show the monthly equivalent?', time: 'Mon' },
        { from: 'them', text: 'Marketing wants to test both versions.', time: 'Mon' } ] },
      { id: 6, name: 'Liam Carter', status: 'offline', unread: 0, time: 'Sun', msgs: [
        { from: 'me', text: 'Welcome to the team, Liam!', time: 'Sun' },
        { from: 'them', text: 'Thank you! Excited to get started.', time: 'Sun' } ] },
      { id: 7, name: 'Emma Wilson', status: 'away', unread: 0, time: 'Oct 24', msgs: [
        { from: 'them', text: 'The customer interviews are scheduled for next week.', time: 'Oct 24' },
        { from: 'me', text: 'Perfect, I will join the first two sessions.', time: 'Oct 24' } ] },
    ];
    let current = null, search = '', replyTimer = null;
    const list = $('chat-list'), box = $('chat-messages'), input = $('chat-input');
    const esc = (t) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
    const avatar = (c, size) => `<span class="relative inline-block shrink-0"><span class="grid ${size} place-items-center rounded-full bg-gradient-to-br ${GRADS[c.id % GRADS.length]} text-sm font-bold text-white">${esc(initials(c.name))}</span><span class="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-midnight-900 ${DOT[c.status]}"></span></span>`;
    const preview = (c) => { const m = c.msgs[c.msgs.length - 1]; return m ? (m.from === 'me' ? 'You: ' : '') + (m.file ? 'Attachment: ' + m.file.name : m.text) : ''; };

    function updateUnread() {
      const total = chats.reduce((n, c) => n + c.unread, 0);
      $('chat-unread-total').textContent = total + ' unread';
      document.querySelectorAll('.chat-badge').forEach((b) => { b.textContent = total; b.classList.toggle('hidden', total === 0); });
    }

    function renderList() {
      const q = search.trim().toLowerCase();
      const shown = chats.filter((c) => c.name.toLowerCase().includes(q));
      list.innerHTML = shown.map((c) => `
        <li><button type="button" data-chat="${c.id}" class="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-300 ${current && current.id === c.id ? 'bg-volt-500/10 ring-1 ring-volt-400/20' : 'hover:bg-midnight-100 dark:hover:bg-white/5'}">
          ${avatar(c, 'h-11 w-11')}
          <span class="min-w-0 flex-1">
            <span class="flex items-center justify-between gap-2"><span class="truncate text-sm font-semibold text-midnight-900 dark:text-white">${esc(c.name)}</span><span class="shrink-0 text-[11px] text-midnight-500">${esc(c.time)}</span></span>
            <span class="mt-0.5 flex items-center justify-between gap-2"><span class="truncate text-xs ${c.unread ? 'font-medium text-midnight-700 dark:text-midnight-200' : 'text-midnight-500'}">${esc(preview(c))}</span>
              ${c.unread ? `<span class="grid h-5 min-w-[1.25rem] shrink-0 place-items-center rounded-full bg-volt-500 px-1.5 text-[10px] font-bold text-white">${c.unread}</span>` : ''}</span>
          </span></button></li>`).join('');
      $('chat-list-empty').classList.toggle('hidden', shown.length > 0);
      updateUnread();
    }

    function bubble(m) {
      const mine = m.from === 'me';
      const inner = m.file
        ? `<span class="flex items-center gap-3"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg ${mine ? 'bg-white/20' : 'bg-volt-500/10 text-volt-700 dark:text-volt-300'}"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span><span class="min-w-0"><span class="block truncate text-sm font-medium">${esc(m.file.name)}</span><span class="block text-xs ${mine ? 'text-volt-100' : 'text-midnight-500'}">${esc(m.file.size)}</span></span></span>`
        : esc(m.text).replace(/\n/g, '<br>');
      return `<div class="flex ${mine ? 'justify-end' : 'justify-start'}"><div class="max-w-[85%] sm:max-w-[70%]">
        <div class="px-4 py-2.5 text-sm leading-relaxed ${mine ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-volt-600 to-cyber-500 text-white shadow-md shadow-volt-500/20' : 'rounded-2xl rounded-bl-md bg-white text-midnight-800 shadow-sm ring-1 ring-midnight-200 dark:bg-midnight-700/60 dark:text-midnight-100 dark:ring-white/5'}">${inner}</div>
        <p class="mt-1 text-[11px] text-midnight-400 ${mine ? 'text-right' : ''}">${esc(m.time)}${mine ? ' · Sent' : ''}</p></div></div>`;
    }
    const typingHTML = () => `<div id="typing" class="flex justify-start"><div class="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-midnight-200 dark:bg-midnight-700/60 dark:ring-white/5"><span class="h-2 w-2 animate-bounce rounded-full bg-midnight-400"></span><span class="h-2 w-2 animate-bounce rounded-full bg-midnight-400 [animation-delay:150ms]"></span><span class="h-2 w-2 animate-bounce rounded-full bg-midnight-400 [animation-delay:300ms]"></span></div></div>`;

    function renderMessages(typing) {
      box.innerHTML = '<p class="text-center text-xs font-medium text-midnight-400">Today</p>' + current.msgs.map(bubble).join('') + (typing ? typingHTML() : '');
      box.scrollTop = box.scrollHeight;
    }
    function renderHeader(typing) {
      $('chat-avatar').innerHTML = avatar(current, 'h-10 w-10');
      $('chat-name').textContent = current.name;
      const s = $('chat-status');
      s.textContent = typing ? 'Typing...' : STATUS[current.status];
      s.className = 'truncate text-xs ' + (typing ? 'text-volt-500' : current.status === 'online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-midnight-500');
    }
    function showPanel(open) {   // mobile only: swap between the list and the chat
      $('chat-sidebar').classList.toggle('max-md:hidden', open);
      $('chat-panel').classList.toggle('max-md:hidden', !open);
    }
    function openChat(id, mobile) {
      clearTimeout(replyTimer);
      current = chats.find((c) => c.id === id); current.unread = 0;
      renderHeader(false); renderMessages(false); renderList();
      if (mobile) showPanel(true);
    }

    function send(msg) {
      const c = current;
      c.msgs.push({ from: 'me', time: nowTime(), ...msg }); c.time = 'Now';
      chats.splice(chats.indexOf(c), 1); chats.unshift(c);   // newest conversation on top
      renderMessages(false); renderList();
      clearTimeout(replyTimer);
      renderHeader(true); box.insertAdjacentHTML('beforeend', typingHTML()); box.scrollTop = box.scrollHeight;
      replyTimer = setTimeout(() => {
        c.msgs.push({ from: 'them', text: REPLIES[Math.floor(Math.random() * REPLIES.length)], time: nowTime() }); c.time = 'Now';
        if (current === c) { renderHeader(false); renderMessages(false); } else c.unread++;
        renderList();
      }, 1400);
    }

    list.addEventListener('click', (e) => { const b = e.target.closest('[data-chat]'); if (b) openChat(+b.dataset.chat, true); });
    $('chat-search').addEventListener('input', (e) => { search = e.target.value; renderList(); });
    $('chat-back').addEventListener('click', () => showPanel(false));
    $('chat-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = ''; input.style.height = 'auto';
      send({ text });
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('chat-form').requestSubmit(); } });
    input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 128) + 'px'; });
    $('chat-attach').addEventListener('click', () => $('chat-file').click());
    $('chat-file').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) send({ file: { name: f.name, size: fmtSize(f.size) } });
      e.target.value = '';
    });

    openChat(chats[0].id, false);   // desktop opens the first chat; mobile starts on the list
  }

  /* ---------- 8. File manager page ---------- */
  if ($('fm-files')) {
    const TILE = {
      indigo: 'bg-volt-500/10 text-volt-700 dark:text-volt-400', violet: 'bg-cyber-500/10 text-cyber-600 dark:text-cyber-400',
      emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', slate: 'bg-midnight-500/10 text-midnight-600 dark:text-midnight-400',
    };
    const KIND = { png: 'indigo', jpg: 'indigo', jpeg: 'indigo', gif: 'indigo', svg: 'indigo', webp: 'indigo', mp4: 'violet', mov: 'violet', avi: 'violet', pdf: 'rose', zip: 'amber', rar: 'amber', xlsx: 'emerald', csv: 'emerald', doc: 'cyan', docx: 'cyan', txt: 'cyan' };
    const FOLDER_ICON = '<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
    const DOTS = '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>';
    const CHECK = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>';
    const XICON = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    const MI = (p) => `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
    const MENU_ICON = {
      open: MI('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
      rename: MI('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
      download: MI('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
      share: MI('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>'),
      delete: MI('<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>'),
    };

    // Demo data - replace with your API response
    let folders = [
      { id: 1, name: 'AI Generations', files: 128, size: '4.2 GB', color: 'indigo' },
      { id: 2, name: 'Project Assets', files: 342, size: '12.8 GB', color: 'violet' },
      { id: 3, name: 'Invoices', files: 56, size: '320 MB', color: 'emerald' },
      { id: 4, name: 'Brand Kit', files: 84, size: '1.1 GB', color: 'amber' },
      { id: 5, name: 'Client Videos', files: 23, size: '28.4 GB', color: 'rose' },
      { id: 6, name: 'Backups', files: 12, size: '6.5 GB', color: 'cyan' },
    ];
    let files = [
      { id: 1, name: 'hero-banner.png', size: '2.4 MB', date: 'Oct 29, 2026' },
      { id: 2, name: 'product-demo.mp4', size: '148 MB', date: 'Oct 28, 2026' },
      { id: 3, name: 'Q3-report.pdf', size: '3.1 MB', date: 'Oct 27, 2026' },
      { id: 4, name: 'brand-guidelines.pdf', size: '8.7 MB', date: 'Oct 26, 2026' },
      { id: 5, name: 'logo-pack.zip', size: '18.6 MB', date: 'Oct 25, 2026' },
      { id: 6, name: 'ai-concept-01.jpg', size: '1.9 MB', date: 'Oct 24, 2026' },
      { id: 7, name: 'budget-2026.xlsx', size: '640 KB', date: 'Oct 22, 2026' },
      { id: 8, name: 'meeting-notes.docx', size: '210 KB', date: 'Oct 20, 2026' },
    ];
    let nextId = 100, view = 'list', search = '';
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const ext = (n) => (n.includes('.') ? n.split('.').pop().toLowerCase() : 'file');
    const tile = (n, size) => `<span class="grid ${size} shrink-0 place-items-center rounded-xl text-[10px] font-extrabold ${TILE[KIND[ext(n)] || 'slate']}">${esc(ext(n).slice(0, 4).toUpperCase())}</span>`;
    const fmtSize = (b) => (b > 1073741824 ? (b / 1073741824).toFixed(1) + ' GB' : b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
    const menuBtn = (type, id, label) => `<button type="button" data-menu="${type}" data-id="${id}" class="grid h-9 w-9 place-items-center rounded-lg text-midnight-400 transition-all duration-300 hover:bg-midnight-100 hover:text-midnight-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-volt-400 dark:hover:bg-white/5 dark:hover:text-white" aria-label="${label}" aria-haspopup="menu">${DOTS}</button>`;

    /* Toast */
    let toastTimer;
    function toast(msg) {
      const t = $('fm-toast'); t.textContent = msg; t.classList.remove('hidden');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), 2600);
    }

    /* Render folders + files */
    function renderFolders() {
      $('folder-grid').innerHTML = folders.map((f) => `
        <div class="rounded-2xl border border-midnight-200 bg-white p-5 shadow-sm shadow-midnight-200/70 transition-all duration-300 hover:-translate-y-1 hover:border-volt-400/40 dark:border-white/5 dark:bg-midnight-800/40 dark:shadow-none">
          <div class="flex items-start justify-between"><span class="grid h-12 w-12 place-items-center rounded-xl ${TILE[f.color]}">${FOLDER_ICON}</span>${menuBtn('folder', f.id, 'Actions for ' + esc(f.name))}</div>
          <p class="mt-4 truncate font-semibold text-midnight-900 dark:text-white">${esc(f.name)}</p>
          <p class="mt-1 text-xs text-midnight-500">${f.files} files &middot; ${esc(f.size)}</p></div>`).join('');
      $('folder-count').textContent = folders.length + ' folders';
    }
    function renderFiles() {
      const q = search.trim().toLowerCase();
      const list = files.filter((f) => f.name.toLowerCase().includes(q));
      $('file-body').innerHTML = list.map((f) => `
        <tr class="vx-row">
          <td class="px-5 py-3.5"><div class="flex items-center gap-3">${tile(f.name, 'h-10 w-10')}<div class="min-w-0"><p class="truncate font-medium text-midnight-900 dark:text-white">${esc(f.name)}</p><p class="text-xs text-midnight-500 sm:hidden">${esc(f.size)} &middot; ${esc(f.date)}</p></div></div></td>
          <td class="hidden px-5 py-3.5 text-midnight-600 sm:table-cell dark:text-midnight-400">${esc(f.size)}</td>
          <td class="hidden px-5 py-3.5 text-midnight-600 md:table-cell dark:text-midnight-400">${esc(f.date)}</td>
          <td class="px-5 py-3.5"><div class="flex justify-end">${menuBtn('file', f.id, 'Actions for ' + esc(f.name))}</div></td></tr>`).join('');
      $('file-grid').innerHTML = list.map((f) => `
        <div class="rounded-2xl border border-midnight-200 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-volt-400/40 dark:border-white/5">
          <div class="flex items-start justify-between">${tile(f.name, 'h-14 w-14')}${menuBtn('file', f.id, 'Actions for ' + esc(f.name))}</div>
          <p class="mt-3 truncate text-sm font-medium text-midnight-900 dark:text-white">${esc(f.name)}</p>
          <p class="mt-1 text-xs text-midnight-500">${esc(f.size)} &middot; ${esc(f.date)}</p></div>`).join('');
      $('file-empty').classList.toggle('hidden', list.length > 0);
      $('file-count').textContent = list.length + ' of ' + files.length + ' files';
    }
    function setView(v) {
      view = v;
      $('file-list-wrap').classList.toggle('hidden', v !== 'list');
      $('file-grid').classList.toggle('hidden', v !== 'grid');
      [['view-list', 'list'], ['view-grid', 'grid']].forEach(([id, name]) => {
        const b = $(id), on = v === name;
        b.classList.remove(...(on ? 'text-midnight-500 hover:text-midnight-900 dark:text-midnight-400 dark:hover:text-white' : 'bg-volt-500 text-white shadow').split(' '));
        b.classList.add(...(on ? 'bg-volt-500 text-white shadow' : 'text-midnight-500 hover:text-midnight-900 dark:text-midnight-400 dark:hover:text-white').split(' '));
        b.setAttribute('aria-pressed', String(on));
      });
    }
    $('view-list').addEventListener('click', () => setView('list'));
    $('view-grid').addEventListener('click', () => setView('grid'));
    $('fm-search').addEventListener('input', (e) => { search = e.target.value; renderFiles(); });

    /* Floating dropdown menu (fixed position, so scroll containers cannot clip it) */
    const menu = $('fm-menu');
    let target = null;
    const ITEMS = {
      file: [['download', 'Download'], ['share', 'Share link'], ['delete', 'Delete', true]],
      folder: [['open', 'Open'], ['rename', 'Rename'], ['share', 'Share link'], ['delete', 'Delete', true]],
    };
    function closeMenu() { menu.classList.add('hidden'); target = null; }
    function openMenu(btn) {
      target = { type: btn.dataset.menu, id: +btn.dataset.id };
      menu.innerHTML = ITEMS[target.type].map(([a, l, danger]) => `<button type="button" role="menuitem" data-act="${a}" class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${danger ? 'text-rose-600 hover:bg-rose-500/10 dark:text-rose-400' : 'text-midnight-700 hover:bg-midnight-100 dark:text-midnight-300 dark:hover:bg-white/5'}">${MENU_ICON[a]}${l}</button>`).join('');
      menu.classList.remove('hidden');
      const r = btn.getBoundingClientRect(), h = menu.offsetHeight, w = menu.offsetWidth;
      menu.style.left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)) + 'px';
      menu.style.top = (r.bottom + h + 12 > window.innerHeight ? r.top - h - 6 : r.bottom + 6) + 'px';
    }
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-menu]'), act = e.target.closest('[data-act]');
      if (btn) { const same = target && !menu.classList.contains('hidden') && target.type === btn.dataset.menu && target.id === +btn.dataset.id; closeMenu(); if (!same) openMenu(btn); return; }
      if (act && target) { runAction(act.dataset.act, target); closeMenu(); return; }
      if (!e.target.closest('#fm-menu')) closeMenu();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);

    function runAction(act, t) {
      const list = t.type === 'file' ? files : folders, item = list.find((i) => i.id === t.id);
      if (!item) return;
      if (act === 'delete') {
        if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
        if (t.type === 'file') { files = files.filter((i) => i.id !== t.id); renderFiles(); } else { folders = folders.filter((i) => i.id !== t.id); renderFolders(); }
        toast('Deleted ' + item.name);
      } else if (act === 'download') {
        if (item.file) { const a = document.createElement('a'); a.href = URL.createObjectURL(item.file); a.download = item.name; a.click(); }
        toast('Downloading ' + item.name);
      } else if (act === 'share') { toast('Share link copied for ' + item.name);
      } else if (act === 'open') { toast('Opening ' + item.name + '...');
      } else if (act === 'rename') {
        const name = prompt('Rename to:', item.name);
        if (name && name.trim()) { item.name = name.trim(); t.type === 'file' ? renderFiles() : renderFolders(); }
      }
    }

    $('new-folder-btn').addEventListener('click', () => {
      const name = prompt('Folder name:');
      if (name && name.trim()) { folders.unshift({ id: nextId++, name: name.trim(), files: 0, size: '0 KB', color: 'indigo' }); renderFolders(); toast('Folder created'); }
    });

    /* Drag & drop upload with a simulated progress queue */
    const zone = $('drop-zone'), input = $('fm-input'), queueEl = $('upload-queue');
    const HOT = 'border-volt-500 bg-volt-500/5'.split(' '), COLD = 'border-midnight-300 dark:border-white/15'.split(' ');
    let queue = [];
    function renderQueue() {
      $('queue-wrap').classList.toggle('hidden', queue.length === 0);
      queueEl.innerHTML = queue.map((q) => `
        <li class="flex items-center gap-3 rounded-xl border border-midnight-200 p-3 dark:border-white/10">
          ${tile(q.file.name, 'h-10 w-10')}
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-3"><p class="truncate text-sm font-medium text-midnight-900 dark:text-white">${esc(q.file.name)}</p><span class="shrink-0 text-xs ${q.pct >= 100 ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-midnight-500'}">${q.pct >= 100 ? 'Uploaded' : Math.round(q.pct) + '%'}</span></div>
            <div class="mt-2 h-1.5 rounded-full bg-midnight-200 dark:bg-midnight-700/60"><div class="h-1.5 rounded-full ${q.pct >= 100 ? 'bg-emerald-500' : 'bg-volt-500'} transition-all duration-200" style="width:${q.pct}%"></div></div>
            <p class="mt-1 text-xs text-midnight-500">${fmtSize(q.file.size)}</p></div>
          <button type="button" data-q="${q.id}" class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-midnight-400 transition hover:bg-midnight-100 hover:text-midnight-700 dark:hover:bg-white/5 dark:hover:text-white" aria-label="${q.pct >= 100 ? 'Dismiss' : 'Cancel upload'}">${q.pct >= 100 ? CHECK : XICON}</button></li>`).join('');
    }
    function addFiles(list) {
      const picked = Array.from(list);
      if (!picked.length) return;
      picked.forEach((file) => {
        const q = { id: nextId++, file, pct: 0 };
        q.timer = setInterval(() => {
          q.pct = Math.min(100, q.pct + 6 + Math.random() * 10);
          if (q.pct >= 100) {
            clearInterval(q.timer);
            files.unshift({ id: nextId++, name: file.name, size: fmtSize(file.size), date: 'Just now', file });
            renderFiles();
            if (queue.every((x) => x.pct >= 100)) toast(queue.length + (queue.length === 1 ? ' file uploaded' : ' files uploaded'));
          }
          renderQueue();
        }, 220);
        queue.push(q);
      });
      renderQueue();
    }
    queueEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]'); if (!b) return;
      const q = queue.find((x) => x.id === +b.dataset.q); if (q) clearInterval(q.timer);
      queue = queue.filter((x) => x.id !== +b.dataset.q); renderQueue();
    });
    $('queue-clear').addEventListener('click', () => { queue = queue.filter((q) => q.pct < 100); renderQueue(); });
    input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
    $('upload-btn').addEventListener('click', () => input.click());
    ['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove(...COLD); zone.classList.add(...HOT); }));
    ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove(...HOT); zone.classList.add(...COLD); }));
    zone.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));
    // Stop the browser from opening a file that is dropped outside the zone
    ['dragover', 'drop'].forEach((ev) => window.addEventListener(ev, (e) => { if (!zone.contains(e.target)) e.preventDefault(); }));

    renderFolders(); renderFiles(); setView('list');
  }

  /* ---------- 9. Billing page ---------- */
  if ($('plan-name')) {
    const GRADS = ['from-emerald-500 via-teal-600 to-cyan-700', 'from-rose-500 via-pink-600 to-orange-500', 'from-amber-500 via-orange-600 to-rose-600'];
    const PLANS = [
      { id: 'starter', name: 'Starter Plan', price: '$49', desc: 'For individuals', feats: ['10 projects', '100k API requests', 'Email support'] },
      { id: 'pro', name: 'Pro Plan', price: '$149', desc: 'For growing teams', feats: ['Unlimited projects', '500k API requests', 'Priority support'] },
      { id: 'enterprise', name: 'Enterprise AI Pro Plan', price: '$299', desc: 'For large organisations', feats: ['Dedicated GPU capacity', '1M API requests', 'Advanced analytics'] },
    ];
    // Demo data. SECURITY: a real app must never handle raw card numbers in its own code.
    // Use a payment provider (Stripe Elements, Paddle, etc.) and only store the last 4 digits and brand.
    let cards = [
      { id: 1, brand: 'visa', last4: '4242', name: 'Alex Morgan', exp: '08/28', def: true, grad: 'from-volt-600 via-cyber-600 to-cyber-700' },
      { id: 2, brand: 'mastercard', last4: '8891', name: 'Alex Morgan', exp: '03/27', def: false, grad: 'from-midnight-700 via-midnight-900 to-midnight-950' },
    ];
    const INVOICES = [
      { id: 'INV-2026-0011', desc: 'Usage overage', date: 'Nov 1, 2026', amount: '$84.50', status: 'Pending' },
      { id: 'INV-2026-0010', desc: 'Enterprise AI Pro, monthly', date: 'Oct 29, 2026', amount: '$299.00', status: 'Paid' },
      { id: 'INV-2026-0009', desc: 'Enterprise AI Pro, monthly', date: 'Sep 29, 2026', amount: '$299.00', status: 'Paid' },
      { id: 'INV-2026-0008', desc: 'Enterprise AI Pro, monthly', date: 'Aug 29, 2026', amount: '$299.00', status: 'Failed' },
      { id: 'INV-2026-0007', desc: 'Enterprise AI Pro, monthly', date: 'Jul 29, 2026', amount: '$299.00', status: 'Paid' },
      { id: 'INV-2026-0006', desc: 'Enterprise AI Pro, monthly', date: 'Jun 29, 2026', amount: '$299.00', status: 'Paid' },
      { id: 'INV-2026-0005', desc: 'Pro Plus, monthly', date: 'May 29, 2026', amount: '$249.00', status: 'Paid' },
      { id: 'INV-2026-0004', desc: 'Pro Plus, monthly', date: 'Apr 29, 2026', amount: '$249.00', status: 'Paid' },
      { id: 'INV-2026-0003', desc: 'Pro Plus, monthly', date: 'Mar 29, 2026', amount: '$249.00', status: 'Paid' },
      { id: 'INV-2026-0002', desc: 'Pro Plus, monthly', date: 'Feb 28, 2026', amount: '$249.00', status: 'Paid' },
    ];
    const STATUS = {
      Paid: ['bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400', 'bg-emerald-500'],
      Pending: ['bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400', 'bg-amber-500'],
      Failed: ['bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-400', 'bg-rose-500'],
    };
    const PDF_ICON = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/></svg>';
    const PLUS_ICON = '<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
    const CLOSE_ICON = '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const BTN = 'vx-btn-primary disabled:pointer-events-none disabled:opacity-50';
    const GHOST = 'vx-btn-ghost';
    const FIELD = 'vx-input';
    let nextId = 100, planId = 'enterprise', cancelled = false, filter = 'All', toastTimer;

    function toast(msg) {
      const t = $('bill-toast'); t.textContent = msg; t.classList.remove('hidden');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), 2600);
    }

    /* ----- Card visuals ----- */
    const brandLogo = (b) => b === 'visa' ? '<span class="text-2xl font-extrabold italic tracking-tight">VISA</span>'
      : b === 'mastercard' ? '<span class="flex" aria-label="Mastercard"><span class="h-8 w-8 rounded-full bg-rose-500/90"></span><span class="-ml-3 h-8 w-8 rounded-full bg-amber-400/90"></span></span>'
      : '<span class="text-sm font-bold tracking-wide">CARD</span>';
    function renderCards() {
      $('card-grid').innerHTML = cards.map((c) => `
        <div>
          <div class="relative aspect-[1.586/1] overflow-hidden rounded-2xl bg-gradient-to-br ${c.grad} p-5 text-white shadow-xl shadow-midnight-900/20 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 sm:p-6">
            <div class="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl"></div>
            <div class="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/10 blur-2xl"></div>
            <div class="relative flex h-full flex-col justify-between">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3"><span class="relative h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 ring-1 ring-black/10"><span class="absolute inset-x-0 top-1/2 h-px bg-black/20"></span><span class="absolute inset-y-0 left-1/2 w-px bg-black/20"></span></span>
                  <svg class="h-6 w-6 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8.5 15a4 4 0 0 0 0-6M12 17.5a8 8 0 0 0 0-11M15.5 20a12 12 0 0 0 0-16"/></svg></div>
                ${brandLogo(c.brand)}
              </div>
              <p class="font-mono text-lg tracking-widest sm:text-xl" aria-label="Card ending in ${c.last4}">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; ${c.last4}</p>
              <div class="flex items-end justify-between gap-4">
                <div class="min-w-0"><p class="text-[10px] text-white/60">Card holder</p><p class="truncate text-sm font-medium">${esc(c.name)}</p></div>
                <div class="text-right"><p class="text-[10px] text-white/60">Expires</p><p class="text-sm font-medium">${esc(c.exp)}</p></div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between px-1">
            ${c.def ? '<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-400"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Default</span>'
                    : `<button type="button" data-default="${c.id}" class="text-sm font-medium text-volt-700 transition hover:text-volt-500 dark:text-volt-400">Set as default</button>`}
            <button type="button" data-remove="${c.id}" class="text-sm font-medium text-midnight-500 transition hover:text-rose-600 dark:hover:text-rose-400">Remove</button>
          </div>
        </div>`).join('') + `
        <div><button id="add-card-btn" type="button" class="grid aspect-[1.586/1] w-full place-items-center rounded-2xl border-2 border-dashed border-midnight-300 text-midnight-500 transition-all duration-300 hover:border-volt-500 hover:bg-volt-500/5 hover:text-volt-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-volt-400 dark:border-white/15 dark:hover:text-volt-400">
          <span class="flex flex-col items-center gap-3"><span class="grid h-12 w-12 place-items-center rounded-full bg-volt-500/10 text-volt-700 dark:text-volt-400">${PLUS_ICON}</span><span class="text-sm font-semibold">Add New Card</span></span></button></div>`;
    }
    $('card-grid').addEventListener('click', (e) => {
      const d = e.target.closest('[data-default]'), r = e.target.closest('[data-remove]');
      if (e.target.closest('#add-card-btn')) return openAddCard();
      if (d) { cards.forEach((c) => (c.def = c.id === +d.dataset.default)); renderCards(); toast('Default card updated'); }
      if (r) {
        const c = cards.find((x) => x.id === +r.dataset.remove);
        if (!confirm(`Remove the card ending in ${c.last4}?`)) return;
        cards = cards.filter((x) => x !== c);
        if (c.def && cards.length) cards[0].def = true;
        renderCards(); toast('Card removed');
      }
    });

    /* ----- Invoices ----- */
    function renderInvoices() {
      const list = INVOICES.filter((i) => filter === 'All' || i.status === filter);
      $('invoice-body').innerHTML = list.map((i) => `
        <tr class="vx-row">
          <td class="px-5 py-4"><p class="font-medium text-midnight-900 dark:text-white">${i.id}</p><p class="text-xs text-midnight-500">${esc(i.desc)}<span class="sm:hidden"> &middot; ${esc(i.date)}</span></p></td>
          <td class="hidden px-5 py-4 text-midnight-600 sm:table-cell dark:text-midnight-400">${esc(i.date)}</td>
          <td class="px-5 py-4 font-semibold text-midnight-900 dark:text-white">${i.amount}</td>
          <td class="px-5 py-4"><span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS[i.status][0]}"><span class="h-1.5 w-1.5 rounded-full ${STATUS[i.status][1]}"></span>${i.status}</span></td>
          <td class="px-5 py-4"><div class="flex justify-end"><button type="button" data-pdf="${i.id}" class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-volt-700 transition-all duration-300 hover:bg-volt-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-volt-400 dark:text-volt-400" aria-label="Download PDF for ${i.id}">${PDF_ICON}<span class="hidden sm:inline">Download PDF</span></button></div></td></tr>`).join('');
      $('invoice-empty').classList.toggle('hidden', list.length > 0);
      $('invoice-count').textContent = `Showing ${list.length} of ${INVOICES.length} invoices`;
    }
    $('invoice-filter').addEventListener('change', (e) => { filter = e.target.value; renderInvoices(); });

    // Builds a tiny, valid one-page PDF in the browser (no library needed)
    function pdfBlob(title, lines) {
      const clean = (s) => String(s).replace(/[^\x20-\x7E]/g, '?').replace(/[\\()]/g, '\\$&');
      let s = `BT /F1 22 Tf 72 780 Td (${clean(title)}) Tj ET\n`;
      lines.forEach((l, i) => { s += `BT /F1 12 Tf 72 ${735 - i * 24} Td (${clean(l)}) Tj ET\n`; });
      const objs = [
        '<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
        `<< /Length ${s.length} >>\nstream\n${s}endstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      ];
      let pdf = '%PDF-1.4\n'; const off = [];
      objs.forEach((o, i) => { off.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
      const xref = pdf.length;
      pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + off.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
      return new Blob([pdf], { type: 'application/pdf' });
    }
    function downloadInvoice(inv) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(pdfBlob('Invoice ' + inv.id, ['VortexAI Inc.', 'Billed to: Alex Morgan (alex@vortexai.io)', 'Billing date: ' + inv.date, 'Description: ' + inv.desc, 'Amount: ' + inv.amount, 'Status: ' + inv.status]));
      a.download = inv.id + '.pdf'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
    $('invoice-body').addEventListener('click', (e) => {
      const b = e.target.closest('[data-pdf]'); if (!b) return;
      downloadInvoice(INVOICES.find((i) => i.id === b.dataset.pdf)); toast('Downloading ' + b.dataset.pdf + '.pdf');
    });
    $('download-all').addEventListener('click', () => { INVOICES.filter((i) => filter === 'All' || i.status === filter).forEach(downloadInvoice); toast('Downloading invoices'); });

    /* ----- Modal ----- */
    const modal = $('bill-modal');
    function openModal(html) { $('bm-box').innerHTML = html; modal.classList.remove('hidden'); modal.classList.add('flex'); }
    function closeModal() { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    const modalHead = (title, sub) => `<div class="flex items-start justify-between gap-4"><div><h2 id="bm-title" class="text-lg font-bold text-midnight-900 dark:text-white">${title}</h2><p class="mt-1 text-sm text-midnight-500">${sub}</p></div><button type="button" data-close class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-midnight-500 transition hover:bg-midnight-100 dark:hover:bg-white/5" aria-label="Close">${CLOSE_ICON}</button></div>`;
    modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    /* Upgrade / change plan */
    function openUpgrade() {
      let pick = planId;
      const draw = () => openModal(modalHead('Choose your plan', 'Changes apply from your next billing date.') + `
        <div class="mt-5 space-y-3">${PLANS.map((p) => `
          <button type="button" data-plan="${p.id}" class="w-full rounded-2xl border p-4 text-left transition-all duration-300 ${pick === p.id ? 'border-volt-500 bg-volt-500/5 ring-2 ring-volt-500/30' : 'border-midnight-200 hover:border-volt-400/50 dark:border-white/10'}">
            <span class="flex items-center justify-between"><span class="font-semibold text-midnight-900 dark:text-white">${p.name}${p.id === planId ? ' <span class="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Current</span>' : ''}</span><span class="font-bold text-midnight-900 dark:text-white">${p.price}<span class="text-xs font-normal text-midnight-500"> /mo</span></span></span>
            <span class="mt-1 block text-xs text-midnight-500">${p.desc} &middot; ${p.feats.join(' &middot; ')}</span></button>`).join('')}</div>
        <div class="mt-6 flex justify-end gap-3"><button type="button" data-close class="${GHOST}">Keep current</button><button type="button" id="confirm-plan" class="${BTN}"${pick === planId ? ' disabled' : ''}>Switch plan</button></div>`);
      draw();
      $('bm-box').onclick = (e) => {
        const p = e.target.closest('[data-plan]');
        if (p) { pick = p.dataset.plan; draw(); }
        if (e.target.closest('#confirm-plan')) {
          const plan = PLANS.find((x) => x.id === pick); planId = pick;
          $('plan-name').textContent = plan.name; $('plan-price').textContent = plan.price;
          closeModal(); toast('Plan changed to ' + plan.name);
        }
      };
    }
    $('upgrade-btn').addEventListener('click', openUpgrade);

    /* Cancel / resume subscription */
    function setCancelled(on) {
      cancelled = on;
      const st = $('plan-status');
      st.className = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ' + (on ? 'bg-amber-400/20 text-amber-100 ring-amber-300/30' : 'bg-emerald-400/20 text-emerald-100 ring-emerald-300/30');
      st.innerHTML = `<span class="h-1.5 w-1.5 rounded-full ${on ? 'bg-amber-300' : 'bg-emerald-300'}"></span>${on ? 'Cancels Nov 29' : 'Active'}`;
      $('renewal-line').innerHTML = on ? 'Access ends on <span class="font-semibold text-white">Nov 29, 2026</span>' : 'Renews on <span id="plan-renewal" class="font-semibold text-white">Nov 29, 2026</span>';
      $('cancel-btn').textContent = on ? 'Resume Subscription' : 'Cancel Subscription';
    }
    $('cancel-btn').addEventListener('click', () => {
      if (cancelled) { setCancelled(false); toast('Subscription resumed'); return; }
      openModal(modalHead('Cancel subscription?', 'Your plan stays active until Nov 29, 2026. After that you will lose access to premium features.') + `
        <div class="mt-6 flex justify-end gap-3"><button type="button" data-close class="${GHOST}">Keep my plan</button><button type="button" id="confirm-cancel" class="inline-flex items-center justify-center rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition-all duration-300 hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">Cancel subscription</button></div>`);
      $('bm-box').onclick = (e) => { if (e.target.closest('#confirm-cancel')) { closeModal(); setCancelled(true); toast('Subscription will end on Nov 29'); } };
    });

    /* Add new card */
    function openAddCard() {
      openModal(modalHead('Add a new card', 'Demo form only. Connect a payment provider before going live.') + `
        <form id="card-form" class="mt-5 space-y-4" novalidate>
          <div><label for="cc-name" class="vx-label">Name on card</label><input id="cc-name" type="text" autocomplete="cc-name" placeholder="Alex Morgan" class="${FIELD}" /></div>
          <div><label for="cc-number" class="vx-label">Card number</label><input id="cc-number" type="text" inputmode="numeric" autocomplete="cc-number" maxlength="23" placeholder="4242 4242 4242 4242" class="${FIELD}" /></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label for="cc-exp" class="vx-label">Expiry (MM/YY)</label><input id="cc-exp" type="text" inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="08/28" class="${FIELD}" /></div>
            <div><label for="cc-cvc" class="vx-label">CVC</label><input id="cc-cvc" type="password" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="123" class="${FIELD}" /></div>
          </div>
          <p id="cc-error" class="hidden text-sm font-medium text-rose-600 dark:text-rose-400" role="alert"></p>
          <div class="flex justify-end gap-3 pt-2"><button type="button" data-close class="${GHOST}">Cancel</button><button type="submit" class="${BTN}">Save card</button></div>
        </form>`);
      const num = $('cc-number'), exp = $('cc-exp');
      num.addEventListener('input', () => { num.value = num.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim(); });
      exp.addEventListener('input', () => { const d = exp.value.replace(/\D/g, '').slice(0, 4); exp.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; });
      $('cc-name').focus();
      $('card-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const digits = num.value.replace(/\D/g, ''), name = $('cc-name').value.trim(), [mm, yy] = exp.value.split('/');
        const now = new Date(), expired = !yy || yy.length < 2 || +mm < 1 || +mm > 12 || new Date(2000 + +yy, +mm) <= now;
        const err = !name ? 'Enter the name on the card.' : digits.length < 13 ? 'Enter a valid card number.' : expired ? 'Enter a valid, future expiry date.' : $('cc-cvc').value.length < 3 ? 'Enter the 3 or 4 digit CVC.' : '';
        $('cc-error').textContent = err; $('cc-error').classList.toggle('hidden', !err);
        if (err) return;
        // Only the brand and last 4 digits are kept. The full number and CVC are discarded.
        cards.push({ id: nextId++, brand: digits[0] === '4' ? 'visa' : /^(5|2)/.test(digits) ? 'mastercard' : 'other', last4: digits.slice(-4), name, exp: exp.value, def: cards.length === 0, grad: GRADS[cards.length % GRADS.length] });
        renderCards(); closeModal(); toast('Card added');
      });
    }

    renderCards(); renderInvoices();
  }

  /* ---------- 10. Calendar page ---------- */
  if ($('cal-view')) {
    const CAT = {
      team: { label: 'Team', badge: 'bg-cyber-500/15 text-cyber-700 ring-cyber-500/25 dark:text-cyber-300', dot: 'bg-cyber-500', border: 'border-cyber-500', tint: 'bg-cyber-500/10' },
      meeting: { label: 'Meeting', badge: 'bg-volt-500/15 text-volt-700 ring-volt-500/25 dark:text-volt-300', dot: 'bg-volt-500', border: 'border-volt-500', tint: 'bg-volt-500/10' },
      launch: { label: 'Launch', badge: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300', dot: 'bg-emerald-500', border: 'border-emerald-500', tint: 'bg-emerald-500/10' },
      review: { label: 'Review', badge: 'bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-300', dot: 'bg-amber-500', border: 'border-amber-500', tint: 'bg-amber-500/10' },
      urgent: { label: 'Urgent', badge: 'bg-rose-500/15 text-rose-700 ring-rose-500/25 dark:text-rose-300', dot: 'bg-rose-500', border: 'border-rose-500', tint: 'bg-rose-500/10' },
      personal: { label: 'Personal', badge: 'bg-cyan-500/15 text-cyan-700 ring-cyan-500/25 dark:text-cyan-300', dot: 'bg-cyan-500', border: 'border-cyan-500', tint: 'bg-cyan-500/10' },
    };
    const pad = (n) => String(n).padStart(2, '0');
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    const weekStart = (d) => addDays(d, -((d.getDay() + 6) % 7));        // weeks start on Monday
    const fmt = (d, o) => d.toLocaleDateString('en-US', o);
    const time12 = (t) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`; };
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayStr = ymd(today);
    let view = 'month', cursor = new Date(today), nextId = 1;

    // Demo events are created relative to today so the calendar always looks populated.
    // Replace with your own data / API: { id, title, date: 'YYYY-MM-DD', start: 'HH:MM', end: 'HH:MM', cat, desc }
    const SEED = [
      [0, 'Design Review', '14:30', '15:30', 'review', 'Review the new dashboard mockups with the design team.'],
      [1, 'Product Launch', '09:00', '12:00', 'launch', 'Public release of v3.0 with a live product demo.'],
      [2, 'Urgent Deadline: Client Report', '17:00', '18:00', 'urgent', 'Final report must be sent to the client before 6 PM.'],
      [2, 'Stand-up', '09:30', '09:45', 'meeting', 'Daily team stand-up.'],
      [2, '1:1 with Olivia', '11:00', '11:30', 'meeting', 'Career growth check-in.'],
      [2, 'Content Review', '15:00', '16:00', 'review', 'Review the launch blog post.'],
      [3, 'Marketing Brief', '15:00', '16:00', 'meeting', 'Campaign planning for the launch.'],
      [5, 'Team Lunch', '12:30', '13:30', 'personal', 'Lunch with the whole team.'],
      [6, 'Sprint Planning', '09:30', '11:00', 'meeting', 'Plan the next two-week sprint.'],
      [8, 'Urgent Deadline: Invoice Audit', '16:00', '17:00', 'urgent', 'Finance needs the audit results today.'],
      [9, 'Launch Webinar', '13:00', '14:00', 'launch', 'Customer webinar introducing the new release.'],
      [11, 'Investor Update', '10:00', '11:00', 'review', 'Monthly investor update call.'],
      [15, 'Design Workshop', '10:00', '12:00', 'team', 'Workshop on the new design system.'],
      [17, 'Customer Demo', '15:00', '16:00', 'launch', 'Demo for an enterprise customer.'],
      [20, 'Urgent Deadline: Budget Sign-off', '12:00', '13:00', 'urgent', 'Budget approval is due.'],
      [22, 'Team Offsite', '09:00', '17:00', 'personal', 'Full-day offsite.'],
      [-3, 'Quarterly Review', '14:00', '15:30', 'review', 'Q3 results and Q4 goals.'],
      [-5, 'Launch Prep', '11:00', '12:30', 'launch', 'Final checklist for the product launch.'],
      [-8, 'Urgent Deadline: Security Patch', '18:00', '19:00', 'urgent', 'Ship the security patch.'],
    ];
    let events = SEED.map(([off, title, start, end, cat, desc]) => ({ id: nextId++, title, date: ymd(addDays(today, off)), start, end, cat, desc }));
    [-14, -7, 0, 7, 14, 21, 28].forEach((off) => events.push({ id: nextId++, title: 'AI Team Sync', date: ymd(addDays(today, off)), start: '10:00', end: '11:00', cat: 'team', desc: 'Weekly sync on the model roadmap and sprint goals.' }));

    const byDay = (s) => events.filter((e) => e.date === s).sort((a, b) => a.start.localeCompare(b.start));
    const isMobile = () => window.matchMedia('(max-width: 639px)').matches;

    /* ----- Views ----- */
    function eventRow(e) {
      const c = CAT[e.cat];
      return `<button type="button" data-ev="${e.id}" class="flex w-full items-center justify-between gap-3 rounded-xl border-l-4 ${c.border} ${c.tint} px-4 py-2.5 text-left transition-all duration-300 hover:translate-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-volt-400">
        <span class="min-w-0"><span class="block truncate text-sm font-semibold text-midnight-900 dark:text-white">${esc(e.title)}</span><span class="block text-xs text-midnight-500">${time12(e.start)} - ${time12(e.end)}</span></span>
        <span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${c.badge}">${c.label}</span></button>`;
    }
    function monthView() {
      const y = cursor.getFullYear(), m = cursor.getMonth();
      const first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
      const rows = Math.ceil((lead + days) / 7), start = addDays(first, -lead);
      const head = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => `<div class="py-2 text-center text-xs font-semibold text-midnight-500"><span class="sm:hidden">${d[0]}</span><span class="hidden sm:inline">${d}</span></div>`).join('');
      let cells = '';
      for (let i = 0; i < rows * 7; i++) {
        const d = addDays(start, i), s = ymd(d), inMonth = d.getMonth() === m, evs = byDay(s);
        cells += `<div data-day="${s}" class="min-h-[4.5rem] cursor-pointer p-1.5 transition-colors duration-300 sm:min-h-[7.5rem] sm:p-2 ${inMonth ? 'bg-white hover:bg-midnight-50 dark:bg-midnight-900 dark:hover:bg-midnight-800/80' : 'bg-midnight-50 dark:bg-midnight-900/50'}">
          <button type="button" data-daybtn="${s}" class="grid h-7 w-7 place-items-center rounded-full text-sm transition ${s === todayStr ? 'bg-volt-500 font-bold text-white shadow shadow-volt-500/40' : inMonth ? 'font-medium text-midnight-700 hover:bg-midnight-100 dark:text-midnight-300 dark:hover:bg-white/10' : 'text-midnight-400 dark:text-midnight-600'}" aria-label="${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}">${d.getDate()}</button>
          <div class="mt-1 hidden space-y-1 sm:block">${evs.slice(0, 3).map((e) => `<button type="button" data-ev="${e.id}" title="${time12(e.start)} ${esc(e.title)}" class="block w-full truncate rounded-md px-2 py-1 text-left text-xs font-medium ring-1 transition-all duration-300 hover:scale-[1.02] ${CAT[e.cat].badge}">${esc(e.title)}</button>`).join('')}${evs.length > 3 ? `<button type="button" data-more="${s}" class="px-1 text-xs font-medium text-volt-700 hover:underline dark:text-volt-400">+${evs.length - 3} more</button>` : ''}</div>
          <div class="mt-1.5 flex flex-wrap justify-center gap-1 sm:hidden">${evs.slice(0, 4).map((e) => `<span class="h-1.5 w-1.5 rounded-full ${CAT[e.cat].dot}"></span>`).join('')}</div></div>`;
      }
      return `<div class="grid grid-cols-7">${head}</div><div class="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-midnight-200 ring-1 ring-midnight-200 dark:bg-white/10 dark:ring-white/10">${cells}</div>`;
    }
    function weekView() {
      const ws = weekStart(cursor);
      return '<div class="divide-y divide-midnight-200 overflow-hidden rounded-xl border border-midnight-200 dark:divide-white/5 dark:border-white/5">' + Array.from({ length: 7 }, (_, i) => {
        const d = addDays(ws, i), s = ymd(d), evs = byDay(s);
        return `<div class="flex gap-4 p-4 ${s === todayStr ? 'bg-volt-500/5' : ''}">
          <button type="button" data-goday="${s}" class="w-14 shrink-0 text-center" aria-label="Open ${fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })}"><span class="block text-xs text-midnight-500">${fmt(d, { weekday: 'short' })}</span>
            <span class="mx-auto mt-1 grid h-9 w-9 place-items-center rounded-full text-lg font-bold ${s === todayStr ? 'bg-volt-500 text-white shadow shadow-volt-500/40' : 'text-midnight-900 dark:text-white'}">${d.getDate()}</span></button>
          <div class="min-w-0 flex-1 space-y-2">${evs.length ? evs.map(eventRow).join('') : '<p class="py-2.5 text-sm text-midnight-400">No events</p>'}</div></div>`;
      }).join('') + '</div>';
    }
    function dayView() {
      const s = ymd(cursor), evs = byDay(s);
      if (!evs.length) return `<div class="grid place-items-center rounded-xl border-2 border-dashed border-midnight-300 px-6 py-16 text-center dark:border-white/15"><div><p class="font-semibold text-midnight-900 dark:text-white">Nothing planned</p><p class="mt-1 text-sm text-midnight-500">You have no events on this day.</p><button type="button" data-add="${s}" class="mt-5 inline-flex items-center rounded-xl bg-volt-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-volt-600">Add an event</button></div></div>`;
      return `<p class="mb-4 text-sm text-midnight-500">${evs.length} ${evs.length === 1 ? 'event' : 'events'} scheduled</p><div class="space-y-4">` + evs.map((e) => {
        const c = CAT[e.cat];
        return `<div class="flex gap-4"><div class="w-20 shrink-0 pt-3 text-right text-xs font-semibold text-midnight-700 dark:text-midnight-300">${time12(e.start)}<br><span class="font-normal text-midnight-400">${time12(e.end)}</span></div>
          <button type="button" data-ev="${e.id}" class="min-w-0 flex-1 rounded-2xl border-l-4 ${c.border} ${c.tint} p-4 text-left transition-all duration-300 hover:translate-x-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-volt-400">
            <span class="flex items-start justify-between gap-3"><span class="font-semibold text-midnight-900 dark:text-white">${esc(e.title)}</span><span class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${c.badge}">${c.label}</span></span>
            ${e.desc ? `<span class="mt-1.5 block text-sm text-midnight-600 dark:text-midnight-400">${esc(e.desc)}</span>` : ''}</button></div>`;
      }).join('') + '</div>';
    }
    function title() {
      if (view === 'month') return fmt(cursor, { month: 'long', year: 'numeric' });
      if (view === 'day') return fmt(cursor, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const s = weekStart(cursor), e = addDays(s, 6);
      return s.getMonth() === e.getMonth() ? `${fmt(s, { month: 'short' })} ${s.getDate()} - ${e.getDate()}, ${e.getFullYear()}` : `${fmt(s, { month: 'short', day: 'numeric' })} - ${fmt(e, { month: 'short', day: 'numeric' })}, ${e.getFullYear()}`;
    }

    /* ----- Upcoming panel: today + the next 6 days ----- */
    function renderUpcoming() {
      const end = addDays(today, 7);
      const list = events.filter((e) => { const d = parse(e.date); return d >= today && d < end; }).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
      $('upcoming-count').textContent = list.length + ' this week';
      if (!list.length) { $('upcoming-list').innerHTML = '<p class="text-sm text-midnight-500">No events in the next 7 days.</p>'; return; }
      const groups = {};
      list.forEach((e) => (groups[e.date] = groups[e.date] || []).push(e));
      $('upcoming-list').innerHTML = Object.keys(groups).map((s) => {
        const diff = Math.round((parse(s) - today) / 86400000);
        const label = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : fmt(parse(s), { weekday: 'long', month: 'short', day: 'numeric' });
        return `<div><p class="mb-2 text-xs font-semibold ${diff === 0 ? 'text-volt-700 dark:text-volt-400' : 'text-midnight-500'}">${label}</p><ul class="space-y-1">${groups[s].map((e) => `
          <li><button type="button" data-ev="${e.id}" class="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-300 hover:bg-midnight-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-volt-400 dark:hover:bg-white/5">
            <span class="h-9 w-1 shrink-0 rounded-full ${CAT[e.cat].dot}"></span>
            <span class="min-w-0"><span class="block truncate text-sm font-medium text-midnight-900 dark:text-white">${esc(e.title)}</span><span class="block text-xs text-midnight-500">${time12(e.start)} &middot; ${CAT[e.cat].label}</span></span></button></li>`).join('')}</ul></div>`;
      }).join('');
    }

    function render() {
      $('cal-title').textContent = title();
      $('cal-view').innerHTML = view === 'month' ? monthView() : view === 'week' ? weekView() : dayView();
      document.querySelectorAll('[data-view]').forEach((b) => {
        const on = b.dataset.view === view;
        b.classList.remove(...(on ? 'text-midnight-600 hover:text-midnight-900 dark:text-midnight-400 dark:hover:text-white' : 'bg-volt-500 text-white shadow').split(' '));
        b.classList.add(...(on ? 'bg-volt-500 text-white shadow' : 'text-midnight-600 hover:text-midnight-900 dark:text-midnight-400 dark:hover:text-white').split(' '));
        b.setAttribute('aria-pressed', String(on));
      });
      renderUpcoming();
    }
    function move(dir) {
      if (view === 'month') cursor = new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1);
      else cursor = addDays(cursor, dir * (view === 'week' ? 7 : 1));
      render();
    }
    $('cal-prev').addEventListener('click', () => move(-1));
    $('cal-next').addEventListener('click', () => move(1));
    $('cal-today').addEventListener('click', () => { cursor = new Date(today); render(); });
    document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { view = b.dataset.view; render(); }));

    /* ----- Clicks inside the calendar and the upcoming panel ----- */
    function onCalClick(e) {
      const ev = e.target.closest('[data-ev]');
      if (ev) return openModal(events.find((x) => x.id === +ev.dataset.ev));
      const more = e.target.closest('[data-more], [data-goday]');
      if (more) { cursor = parse(more.dataset.more || more.dataset.goday); view = 'day'; return render(); }
      const add = e.target.closest('[data-add]');
      if (add) return openModal(null, add.dataset.add);
      const cell = e.target.closest('[data-day]');
      if (cell) {
        if (isMobile()) { cursor = parse(cell.dataset.day); view = 'day'; render(); }   // phones: open the day
        else openModal(null, cell.dataset.day);                                          // desktop: add an event
      }
    }
    $('cal-view').addEventListener('click', onCalClick);
    $('upcoming-list').addEventListener('click', onCalClick);

    /* ----- Add / Edit modal ----- */
    const modal = $('ev-modal');
    const defaultDate = () => view === 'month' ? (cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear() ? todayStr : ymd(new Date(cursor.getFullYear(), cursor.getMonth(), 1))) : ymd(cursor);
    function openModal(ev, date) {
      $('ev-modal-title').textContent = ev ? 'Edit Event' : 'Add Event';
      $('ev-submit').textContent = ev ? 'Save changes' : 'Add event';
      $('ev-delete').classList.toggle('hidden', !ev);
      $('ev-id').value = ev ? ev.id : '';
      $('ev-title').value = ev ? ev.title : '';
      $('ev-date').value = ev ? ev.date : (date || defaultDate());
      $('ev-start').value = ev ? ev.start : '09:00';
      $('ev-end').value = ev ? ev.end : '10:00';
      $('ev-desc').value = ev ? ev.desc : '';
      document.querySelector(`input[name="ev-cat"][value="${ev ? ev.cat : 'team'}"]`).checked = true;
      $('ev-error').classList.add('hidden');
      modal.classList.remove('hidden'); modal.classList.add('flex');
      $('ev-title').focus();
    }
    function closeModal() { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    $('add-event-btn').addEventListener('click', () => openModal(null));
    $('ev-close').addEventListener('click', closeModal);
    $('ev-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    $('ev-delete').addEventListener('click', () => {
      if (!confirm('Delete this event?')) return;
      events = events.filter((x) => x.id !== +$('ev-id').value); closeModal(); render();
    });
    $('ev-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = { title: $('ev-title').value.trim(), date: $('ev-date').value, start: $('ev-start').value, end: $('ev-end').value, desc: $('ev-desc').value.trim(), cat: document.querySelector('input[name="ev-cat"]:checked').value };
      const err = !data.title ? 'Please enter a title.' : !data.date ? 'Please choose a date.' : !data.start || !data.end ? 'Please set a start and end time.' : data.end <= data.start ? 'The end time must be after the start time.' : '';
      $('ev-error').textContent = err; $('ev-error').classList.toggle('hidden', !err);
      if (err) return;
      const id = +$('ev-id').value;
      if (id) Object.assign(events.find((x) => x.id === id), data); else events.push({ id: nextId++, ...data });
      if (view === 'month') cursor = new Date(parse(data.date).getFullYear(), parse(data.date).getMonth(), 1); else cursor = parse(data.date);
      closeModal(); render();
    });

    render();
  }

  /* ---------- 11. Auth pages: show/hide password + sign-up validation ---------- */
  document.querySelectorAll('[data-toggle-pw]').forEach((btn) => btn.addEventListener('click', () => {
    const input = $(btn.dataset.togglePw), show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    btn.querySelector('.eye-on').classList.toggle('hidden', show);
    btn.querySelector('.eye-off').classList.toggle('hidden', !show);
  }));

  if ($('register-form')) {
    const pass = $('r-pass'), confirm = $('r-confirm'), hint = $('confirm-hint');
    const RULES = { length: (v) => v.length >= 8, upper: (v) => /[A-Z]/.test(v), number: (v) => /\d/.test(v), special: (v) => /[^A-Za-z0-9]/.test(v) };
    const DOT_ON = 'bg-emerald-500 text-white'.split(' '), DOT_OFF = 'bg-midnight-200 text-transparent dark:bg-midnight-700'.split(' ');
    const BAR_OFF = 'bg-midnight-200 dark:bg-midnight-700'.split(' ');
    const LEVELS = [['Too short', 'bg-rose-500'], ['Weak', 'bg-rose-500'], ['Fair', 'bg-amber-500'], ['Good', 'bg-emerald-500'], ['Strong', 'bg-emerald-500']];

    function passwordScore() {
      let score = 0;
      document.querySelectorAll('[data-rule]').forEach((li) => {
        const ok = RULES[li.dataset.rule](pass.value), dot = li.querySelector('.rule-dot');
        dot.classList.remove(...(ok ? DOT_OFF : DOT_ON)); dot.classList.add(...(ok ? DOT_ON : DOT_OFF));
        li.classList.toggle('text-emerald-600', ok); li.classList.toggle('dark:text-emerald-400', ok); li.classList.toggle('text-midnight-500', !ok);
        if (ok) score++;
      });
      const [label, color] = pass.value ? LEVELS[score] : LEVELS[0];
      $('strength-label').textContent = pass.value ? label : 'Too short';
      document.querySelectorAll('#strength-bars span').forEach((bar, i) => {
        bar.classList.remove('bg-rose-500', 'bg-amber-500', 'bg-emerald-500', ...BAR_OFF);
        bar.classList.add(...(pass.value && i < score ? [color] : BAR_OFF));
      });
      return score;
    }
    function matchHint() {
      const has = confirm.value.length > 0, same = confirm.value === pass.value;
      hint.classList.toggle('hidden', !has);
      hint.textContent = same ? 'Passwords match' : 'Passwords do not match';
      hint.classList.toggle('text-emerald-600', same); hint.classList.toggle('dark:text-emerald-400', same);
      hint.classList.toggle('text-rose-600', !same); hint.classList.toggle('dark:text-rose-400', !same);
      return same;
    }
    pass.addEventListener('input', () => { passwordScore(); if (confirm.value) matchHint(); });
    confirm.addEventListener('input', matchHint);

    $('register-form').addEventListener('submit', (e) => {
      const err = $('reg-error');
      const msg = !$('r-name').value.trim() ? 'Please enter your full name.'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('r-email').value.trim()) ? 'Please enter a valid email address.'
        : passwordScore() < 4 ? 'Your password must meet all of the requirements.'
        : !matchHint() ? 'The two passwords do not match.'
        : !$('r-terms').checked ? 'Please accept the Terms of Service and Privacy Policy.' : '';
      err.textContent = msg; err.classList.toggle('hidden', !msg);
      if (msg) e.preventDefault();     // no message = valid, the form continues to index.html
    });
  }

  /* ---------- 12. Dashboard widgets (index.html): system monitor + API key generator ---------- */
  if ($('sys-monitor')) {
    // Simulated telemetry. Replace nextSample() with a fetch() to your metrics endpoint.
    const CIRC = 2 * Math.PI * 52;                         // circumference of the r=52 rings
    const state = { cpu: 42, ram: 68, api: 186, rpm: 1840, err: 0.12 };
    const history = [186, 172, 190, 205, 181, 176, 198, 214, 190, 183, 171, 168, 179, 195, 210, 188, 182, 177, 185, 192, 201, 187, 180, 174, 183, 189, 196, 184, 179, 186];
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const jitter = (r) => (Math.random() * 2 - 1) * r;
    const NORMAL = 'text-midnight-900 dark:text-white'.split(' ');
    const WARN = 'text-amber-600 dark:text-amber-400'.split(' ');
    const CRIT = 'text-rose-600 dark:text-rose-400'.split(' ');

    function paintGauge(id, pct, text, unit, sub, warnAt, critAt, value) {
      $('ring-' + id).style.strokeDashoffset = CIRC * (1 - clamp(pct, 0, 100) / 100);
      const el = $('val-' + id);
      el.innerHTML = `${text}<span class="text-sm font-semibold text-midnight-500">${unit}</span>`;
      el.classList.remove(...NORMAL, ...WARN, ...CRIT);
      el.classList.add(...(value >= critAt ? CRIT : value >= warnAt ? WARN : NORMAL));
      $('sub-' + id).textContent = sub;
    }
    function paintSparkline() {
      const lo = 80, hi = 450, n = history.length;
      const pts = history.map((v, i) => [(i / (n - 1)) * 240, 60 - ((clamp(v, lo, hi) - lo) / (hi - lo)) * 54]);
      $('spark-line').setAttribute('points', pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '));
      $('spark-area').setAttribute('d', 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' L240 64 L0 64Z');
    }
    function paint() {
      paintGauge('cpu', state.cpu, Math.round(state.cpu), '%', '8 cores at 3.2 GHz', 75, 90, state.cpu);
      paintGauge('ram', state.ram, Math.round(state.ram), '%', `${(state.ram * 0.16).toFixed(1)} of 16 GB`, 80, 92, state.ram);
      paintGauge('api', (state.api / 500) * 100, Math.round(state.api), 'ms', 'p95 in the last minute', 300, 400, state.api);
      $('spark-now').textContent = Math.round(state.api) + ' ms';
      $('stat-rpm').textContent = Math.round(state.rpm).toLocaleString('en-US');
      $('stat-err').textContent = state.err.toFixed(2) + '%';
      paintSparkline();
    }
    function nextSample() {
      state.cpu = clamp(state.cpu + jitter(7), 18, 94);
      state.ram = clamp(state.ram + jitter(2), 45, 90);
      state.api = clamp(state.api + jitter(28), 95, 430);
      state.rpm = clamp(state.rpm + jitter(120), 900, 3200);
      state.err = clamp(state.err + jitter(0.03), 0.02, 0.6);
      history.push(state.api); history.shift();
    }
    setInterval(() => { if (!document.hidden) { nextSample(); paint(); } }, 2000);
  }

  if ($('key-form')) {
    const form = $('key-form'), list = $('key-list');
    const ENV = { test: 'bg-cyan-500/10 text-cyan-700 ring-cyan-500/20 dark:text-cyan-400', live: 'bg-cyber-500/10 text-cyber-700 ring-cyber-500/20 dark:text-cyber-400' };
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    let keys = [                                              // demo data
      { id: 1, name: 'Production backend', env: 'live', prefix: 'vx_live_8f3a', scopes: 4, age: '12 days ago' },
      { id: 2, name: 'CI test runner', env: 'test', prefix: 'vx_test_c91e', scopes: 2, age: '3 days ago' },
    ];
    let secret = '', revealed = false, nextId = 10, copyTimer;

    // Cryptographically random 32-character key (base62). Nothing leaves the browser.
    function randomKey(env) {
      const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const bytes = new Uint8Array(32); crypto.getRandomValues(bytes);
      return `vx_${env}_` + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
    }
    const mask = (k) => k.slice(0, 12) + '\u2022'.repeat(24);
    function showSecret() {
      $('key-value').textContent = revealed ? secret : mask(secret);
      $('key-toggle').setAttribute('aria-label', revealed ? 'Hide key' : 'Show key');
      $('key-toggle').querySelector('.eye-on').classList.toggle('hidden', revealed);
      $('key-toggle').querySelector('.eye-off').classList.toggle('hidden', !revealed);
    }
    function renderKeys() {
      list.innerHTML = keys.length ? keys.map((k) => `
        <li class="flex items-center justify-between gap-3 rounded-xl border border-midnight-200 px-3 py-2.5 dark:border-white/10">
          <div class="min-w-0"><div class="flex items-center gap-2"><p class="truncate text-sm font-medium text-midnight-900 dark:text-white">${esc(k.name)}</p><span class="vx-pill !px-2 !py-0.5 !text-[10px] ${ENV[k.env]}">${k.env}</span></div>
            <p class="mt-0.5 truncate font-mono text-[11px] text-midnight-500">${k.prefix}${'\u2022'.repeat(8)} &middot; ${k.scopes} scopes &middot; ${k.age}</p></div>
          <button type="button" data-revoke="${k.id}" class="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400">Revoke</button></li>`).join('')
        : '<li class="rounded-xl border border-dashed border-midnight-300 px-3 py-4 text-center text-sm text-midnight-500 dark:border-white/15">No active keys.</li>';
    }
    list.addEventListener('click', (e) => {
      const b = e.target.closest('[data-revoke]'); if (!b) return;
      const k = keys.find((x) => x.id === +b.dataset.revoke);
      if (k && confirm(`Revoke "${k.name}"? Apps using this key will stop working.`)) { keys = keys.filter((x) => x !== k); renderKeys(); }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const scopes = form.querySelectorAll('input[name="key-scope"]:checked').length;
      const err = $('key-error');
      err.textContent = scopes ? '' : 'Select at least one scope.'; err.classList.toggle('hidden', scopes > 0);
      if (!scopes) return;
      const env = form.querySelector('input[name="key-env"]:checked').value;
      secret = randomKey(env); revealed = false;
      keys.unshift({ id: nextId++, name: $('key-name').value.trim() || 'Untitled key', env, prefix: secret.slice(0, 12), scopes, age: 'just now' });
      renderKeys(); showSecret();
      const res = $('key-result'); res.classList.remove('hidden'); res.classList.remove('animate-slide-up'); void res.offsetWidth; res.classList.add('animate-slide-up');
      $('key-name').value = '';
    });
    $('key-toggle').addEventListener('click', () => { revealed = !revealed; showSecret(); });

    // Copy to clipboard (uses the Clipboard API, with a fallback for file:// and older browsers)
    async function copyText(text) {
      try { await navigator.clipboard.writeText(text); return true; } catch (e) {
        const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        let ok = false; try { ok = document.execCommand('copy'); } catch (err) {} ta.remove(); return ok;
      }
    }
    $('key-copy').addEventListener('click', async () => {
      if (!secret) return;
      const ok = await copyText(secret), btn = $('key-copy');
      btn.querySelector('.copy-icon').classList.toggle('hidden', ok); btn.querySelector('.copy-done').classList.toggle('hidden', !ok);
      btn.querySelector('.copy-label').textContent = ok ? 'Copied' : 'Press Ctrl+C';
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        btn.querySelector('.copy-icon').classList.remove('hidden'); btn.querySelector('.copy-done').classList.add('hidden'); btn.querySelector('.copy-label').textContent = 'Copy';
      }, 2000);
    });
    renderKeys();
  }
})();
