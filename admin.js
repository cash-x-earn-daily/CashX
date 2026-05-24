// ============================================================
// ADMIN.JS - Admin Panel + Shared UI Components
// ============================================================

// ============================================================
// ADMIN PANEL
// ============================================================
window.renderAdmin = async function() {
  clearAllTimers();
  if (!Auth.isAdmin()) { Router.navigate('dashboard'); return; }

  document.getElementById('app').innerHTML = `
    <div class="dashboard-layout">
      ${renderSidebar('admin')}
      <div class="main-content">
        ${renderTopBar()}
        <div class="page-content">
          <div class="page-header">
            <h1 class="page-title">Admin Panel</h1>
            <span class="badge badge-purple">Administrator</span>
          </div>

          <!-- ADMIN TABS -->
          <div class="admin-tabs glass-card">
            <button class="admin-tab active" onclick="switchAdminTab('analytics', this)">📊 Analytics</button>
            <button class="admin-tab" onclick="switchAdminTab('products', this)">📦 Products</button>
            <button class="admin-tab" onclick="switchAdminTab('users', this)">👥 Users</button>
            <button class="admin-tab" onclick="switchAdminTab('orders', this)">📋 Orders</button>
            <button class="admin-tab" onclick="switchAdminTab('withdrawals', this)">💸 Withdrawals</button>
            <button class="admin-tab" onclick="switchAdminTab('testimonials', this)">⭐ Reviews</button>
          </div>

          <div id="admin-content">
            <div class="loading-state"><div class="spinner"></div></div>
          </div>
        </div>
      </div>
      ${renderMobileNav('admin')}
    </div>
  `;

  switchAdminTab('analytics', document.querySelector('.admin-tab'));
};

window.switchAdminTab = async function(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  const container = document.getElementById('admin-content');
  container.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';

  switch (tab) {
    case 'analytics': await renderAdminAnalytics(container); break;
    case 'products': await renderAdminProducts(container); break;
    case 'users': await renderAdminUsers(container); break;
    case 'orders': await renderAdminOrders(container); break;
    case 'withdrawals': await renderAdminWithdrawals(container); break;
    case 'testimonials': await renderAdminTestimonials(container); break;
  }
};

async function renderAdminAnalytics(container) {
  const stats = await DB.getAnalytics();
  container.innerHTML = `
    <div class="admin-analytics">
      <div class="stats-grid">
        ${[
          ['👥', 'Total Users', stats.totalUsers, 'Registered accounts', 'badge-info'],
          ['📋', 'Total Orders', stats.totalOrders, `${stats.activeOrders} active`, 'badge-success'],
          ['💰', 'Total Revenue', Utils.formatCurrency(stats.totalRevenue), 'From all orders', 'badge-purple'],
          ['💸', 'Cashback Paid', Utils.formatCurrency(stats.totalCashbackPaid), 'To all users', 'badge-warning'],
          ['⏳', 'Pending Withdrawals', stats.pendingWithdrawals, 'Awaiting approval', 'badge-danger'],
          ['✅', 'Total Withdrawn', Utils.formatCurrency(stats.totalWithdrawn), 'Processed', 'badge-success'],
        ].map(([icon, label, value, sub, cls]) => `
          <div class="stat-card glass-card">
            <div class="stat-icon">${icon}</div>
            <div class="stat-info">
              <div class="stat-label">${label}</div>
              <div class="stat-value">${value}</div>
              <div class="stat-change"><span class="badge ${cls}">${sub}</span></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function renderAdminProducts(container) {
  const { data: products } = await DB.getAllProducts();
  container.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2 class="card-title">Products (${products.length})</h2>
        <button class="btn btn-primary" onclick="showProductModal()">+ Add Product</button>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Cashback %</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
            <tr>
              <td>
                <div class="admin-product-name">
                  <img src="${p.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=60'}" 
                       alt="${p.name}" class="admin-product-img" onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=60'">
                  <span>${p.name}</span>
                </div>
              </td>
              <td>${Utils.formatCurrency(p.price)}</td>
              <td><span class="badge badge-success">${p.cashback_percent}%</span></td>
              <td>${p.duration_days} days</td>
              <td>${p.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>'}</td>
              <td>
                <div class="action-btns">
                  <button class="btn btn-sm btn-outline" onclick='showProductModal(${JSON.stringify(p).replace(/'/g, "&#39;")})'>Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}')">Delete</button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.showProductModal = function(product = null) {
  const isEdit = !!product;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'product-modal';
  modal.innerHTML = `
    <div class="modal glass-card modal-lg">
      <div class="modal-header">
        <h2 class="modal-title">${isEdit ? 'Edit' : 'Add'} Product</h2>
        <button class="modal-close" onclick="document.getElementById('product-modal').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Product Name</label>
            <input type="text" class="form-input" id="prod-name" value="${product?.name || ''}" placeholder="e.g. Growth Plan">
          </div>
          <div class="form-group">
            <label class="form-label">Price (₹)</label>
            <input type="number" class="form-input" id="prod-price" value="${product?.price || ''}" placeholder="2190">
          </div>
          <div class="form-group">
            <label class="form-label">Cashback %</label>
            <input type="number" class="form-input" id="prod-cashback" value="${product?.cashback_percent || 1}" step="0.1" placeholder="1.0">
          </div>
          <div class="form-group">
            <label class="form-label">Duration (Days)</label>
            <input type="number" class="form-input" id="prod-duration" value="${product?.duration_days || 30}" placeholder="30">
          </div>
          <div class="form-group form-full">
            <label class="form-label">Description</label>
            <textarea class="form-input" id="prod-desc" rows="2" placeholder="Brief description">${product?.description || ''}</textarea>
          </div>
          <div class="form-group form-full">
            <label class="form-label">Image URL</label>
            <input type="url" class="form-input" id="prod-image" value="${product?.image_url || ''}" placeholder="https://...">
          </div>
          <div class="form-group form-full">
            <label class="form-label">Features (one per line)</label>
            <textarea class="form-input" id="prod-features" rows="4" placeholder="1% Daily Cashback&#10;30 Days Duration">${Utils.parseFeatures(product?.features).join('\n')}</textarea>
          </div>
          <div class="form-group">
            <label class="form-check">
              <input type="checkbox" id="prod-active" ${product?.is_active !== false ? 'checked' : ''}>
              <span>Active (visible to users)</span>
            </label>
          </div>
        </div>
        <button class="btn btn-primary w-full btn-lg" onclick="saveProduct('${product?.id || ''}')">
          ${isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

window.saveProduct = async function(productId) {
  const features = document.getElementById('prod-features').value.split('\n').filter(f => f.trim());
  const product = {
    id: productId || undefined,
    name: document.getElementById('prod-name').value.trim(),
    price: parseFloat(document.getElementById('prod-price').value),
    cashback_percent: parseFloat(document.getElementById('prod-cashback').value),
    duration_days: parseInt(document.getElementById('prod-duration').value),
    description: document.getElementById('prod-desc').value.trim(),
    image_url: document.getElementById('prod-image').value.trim(),
    features: JSON.stringify(features),
    is_active: document.getElementById('prod-active').checked,
  };
  if (!product.name || !product.price) { Toast.show('Name and price are required', 'warning'); return; }
  const { error } = await DB.saveProduct(product);
  if (error) { Toast.show('Failed to save product: ' + error.message, 'error'); return; }
  document.getElementById('product-modal').remove();
  Toast.show(`Product ${productId ? 'updated' : 'created'}!`, 'success');
  await renderAdmin();
  switchAdminTab('products', document.querySelectorAll('.admin-tab')[1]);
};

window.deleteProduct = async function(id) {
  if (!confirm('Deactivate this product?')) return;
  const { error } = await DB.deleteProduct(id);
  if (error) { Toast.show('Failed', 'error'); return; }
  Toast.show('Product deactivated', 'success');
  switchAdminTab('products', document.querySelectorAll('.admin-tab')[1]);
};

async function renderAdminUsers(container) {
  const users = await DB.getAllUsers();
  container.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2 class="card-title">Users (${users.length})</h2>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>User</th><th>Contact</th><th>Balance</th><th>Invested</th><th>Role</th><th>Joined</th></tr>
          </thead>
          <tbody>
            ${users.map(u => `
            <tr>
              <td><div class="user-name-cell"><div class="user-avatar-sm">${(u.full_name || 'U')[0]}</div><span>${u.full_name || 'N/A'}</span></div></td>
              <td><div>${u.email || ''}</div><div class="text-muted">${u.phone || ''}</div></td>
              <td class="text-success">${Utils.formatCurrency(u.wallet_balance)}</td>
              <td>${Utils.formatCurrency(u.total_invested)}</td>
              <td>${u.role === 'admin' ? '<span class="badge badge-purple">Admin</span>' : '<span class="badge badge-info">User</span>'}</td>
              <td>${Utils.formatDate(u.created_at)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderAdminOrders(container) {
  const { data: orders } = await DB.getAllOrders();
  container.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2 class="card-title">Orders (${orders.length})</h2>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Order</th><th>User</th><th>Product</th><th>Amount</th><th>Cashback</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            ${orders.map(o => `
            <tr>
              <td class="text-muted">${o.id.substring(0,8)}...</td>
              <td>${o.users?.full_name || o.users?.email || 'N/A'}</td>
              <td>${o.products?.name || (o.product_snapshot?.name) || 'N/A'}</td>
              <td>${Utils.formatCurrency(o.amount)}</td>
              <td class="text-success">+${Utils.formatCurrency(o.cashback_earned)}</td>
              <td>${Utils.statusBadge(o.status)}</td>
              <td>${Utils.formatDate(o.created_at)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderAdminWithdrawals(container) {
  const withdrawals = await DB.getAllWithdrawals();
  container.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2 class="card-title">Withdrawals (${withdrawals.length})</h2>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>User</th><th>UPI ID</th><th>Amount</th><th>Status</th><th>Requested</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${withdrawals.map(w => `
            <tr id="wd-row-${w.id}">
              <td>${w.users?.full_name || w.users?.email || 'N/A'}</td>
              <td>${w.upi_id}</td>
              <td class="text-success">${Utils.formatCurrency(w.amount)}</td>
              <td>${Utils.statusBadge(w.status)}</td>
              <td>${Utils.formatDate(w.requested_at)}</td>
              <td>
                ${w.status === 'pending' ? `
                <div class="action-btns">
                  <button class="btn btn-sm btn-success" onclick="approveWithdrawal('${w.id}')">Approve</button>
                  <button class="btn btn-sm btn-danger" onclick="rejectWithdrawal('${w.id}')">Reject</button>
                </div>` : `<span class="text-muted">—</span>`}
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.approveWithdrawal = async function(id) {
  const { error } = await DB.updateWithdrawal(id, 'approved', 'Approved by admin');
  if (error) { Toast.show('Failed', 'error'); return; }
  Toast.show('Withdrawal approved', 'success');
  switchAdminTab('withdrawals', document.querySelectorAll('.admin-tab')[4]);
};

window.rejectWithdrawal = async function(id) {
  const reason = prompt('Rejection reason (optional):') || 'Rejected by admin';
  const { error } = await DB.updateWithdrawal(id, 'rejected', reason);
  if (error) { Toast.show('Failed', 'error'); return; }
  Toast.show('Withdrawal rejected', 'info');
  switchAdminTab('withdrawals', document.querySelectorAll('.admin-tab')[4]);
};

async function renderAdminTestimonials(container) {
  const testimonials = await DB.getTestimonials();
  container.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-header">
        <h2 class="card-title">Testimonials (${testimonials.length})</h2>
        <button class="btn btn-primary" onclick="showTestimonialModal()">+ Add Review</button>
      </div>
      <div class="testimonials-admin-grid">
        ${testimonials.map(t => `
        <div class="testimonial-admin-card glass-card">
          <div class="testimonial-header">
            <img src="${t.user_avatar || 'https://i.pravatar.cc/50'}" alt="${t.user_name}" class="testimonial-avatar" onerror="this.src='https://i.pravatar.cc/50'">
            <div>
              <div class="testimonial-name">${t.user_name}</div>
              <div class="text-muted">${t.user_location || ''}</div>
            </div>
          </div>
          <p class="testimonial-text">"${t.content.substring(0, 100)}..."</p>
          <div class="action-btns">
            <button class="btn btn-sm btn-outline" onclick='showTestimonialModal(${JSON.stringify(t).replace(/'/g, "&#39;")})'>Edit</button>
          </div>
        </div>`).join('')}
      </div>
    </div>
  `;
}

window.showTestimonialModal = function(t = null) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'testimonial-modal';
  modal.innerHTML = `
    <div class="modal glass-card">
      <div class="modal-header">
        <h2 class="modal-title">${t ? 'Edit' : 'Add'} Testimonial</h2>
        <button class="modal-close" onclick="document.getElementById('testimonial-modal').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Name</label><input type="text" class="form-input" id="t-name" value="${t?.user_name || ''}"></div>
        <div class="form-group"><label class="form-label">Location</label><input type="text" class="form-input" id="t-location" value="${t?.user_location || ''}"></div>
        <div class="form-group"><label class="form-label">Avatar URL</label><input type="url" class="form-input" id="t-avatar" value="${t?.user_avatar || ''}"></div>
        <div class="form-group"><label class="form-label">Rating (1-5)</label><input type="number" class="form-input" id="t-rating" value="${t?.rating || 5}" min="1" max="5"></div>
        <div class="form-group"><label class="form-label">Review Text</label><textarea class="form-input" id="t-content" rows="4">${t?.content || ''}</textarea></div>
        <div class="form-group"><label class="form-check"><input type="checkbox" id="t-verified" ${t?.is_verified ? 'checked' : ''}><span>Mark as Verified</span></label></div>
        <button class="btn btn-primary w-full btn-lg" onclick="saveTestimonial('${t?.id || ''}')">Save Review</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

window.saveTestimonial = async function(id) {
  const t = {
    id: id || undefined,
    user_name: document.getElementById('t-name').value.trim(),
    user_location: document.getElementById('t-location').value.trim(),
    user_avatar: document.getElementById('t-avatar').value.trim(),
    rating: parseInt(document.getElementById('t-rating').value),
    content: document.getElementById('t-content').value.trim(),
    is_verified: document.getElementById('t-verified').checked,
    is_active: true,
  };
  if (!t.user_name || !t.content) { Toast.show('Name and review required', 'warning'); return; }
  const { error } = await DB.saveTestimonial(t);
  if (error) { Toast.show('Failed: ' + error.message, 'error'); return; }
  document.getElementById('testimonial-modal').remove();
  Toast.show('Testimonial saved!', 'success');
  switchAdminTab('testimonials', document.querySelectorAll('.admin-tab')[5]);
};

// ============================================================
// SHARED UI COMPONENTS
// ============================================================

window.renderSidebar = function(active) {
  const isAdmin = Auth.isAdmin();
  const profile = Auth.currentProfile;
  const navItems = [
    ['dashboard', '🏠', 'Dashboard'],
    ['products', '🛍️', 'Plans'],
    ['cart', '🛒', 'Cart'],
    ['wallet', '💰', 'Wallet'],
    ['orders', '📋', 'Orders'],
    ['withdrawals', '📤', 'Withdrawals'],
    ['profile', '👤', 'Profile'],
    ...(isAdmin ? [['admin', '⚙️', 'Admin Panel']] : []),
  ];

  return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-logo">₹</div>
        <span class="brand-name">Cash<span class="accent">X</span></span>
      </div>
      <div class="sidebar-user">
        <div class="sidebar-avatar">${(profile?.full_name || 'U')[0].toUpperCase()}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${profile?.full_name?.split(' ')[0] || 'User'}</div>
          <div class="sidebar-balance">${Utils.formatCurrency(profile?.wallet_balance)}</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(([route, icon, label]) => `
          <a class="sidebar-link ${active === route ? 'active' : ''}" data-route="${route}" onclick="Router.navigate('${route}')">
            <span class="sl-icon">${icon}</span>
            <span class="sl-label">${label}</span>
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <button class="sidebar-link" onclick="Auth.signOut()">
          <span class="sl-icon">🚪</span>
          <span class="sl-label">Sign Out</span>
        </button>
      </div>
    </aside>
  `;
};

window.renderTopBar = function() {
  const profile = Auth.currentProfile;
  return `
    <div class="topbar">
      <button class="topbar-menu-btn" onclick="document.querySelector('.sidebar').classList.toggle('open')">☰</button>
      <div class="topbar-search">
        <input type="text" class="topbar-search-input" placeholder="Search plans, orders...">
      </div>
      <div class="topbar-right">
        <div class="topbar-balance">
          <span class="topbar-balance-label">Balance</span>
          <span class="topbar-balance-val">${Utils.formatCurrency(profile?.wallet_balance)}</span>
        </div>
        <div class="topbar-avatar" onclick="Router.navigate('profile')">${(profile?.full_name || 'U')[0].toUpperCase()}</div>
      </div>
    </div>
  `;
};

window.renderMobileNav = function(active) {
  const navItems = [
    ['dashboard', '🏠', 'Home'],
    ['products', '🛍️', 'Plans'],
    ['wallet', '💰', 'Wallet'],
    ['orders', '📋', 'Orders'],
    ['profile', '👤', 'Profile'],
  ];
  return `
    <nav class="mobile-bottom-nav">
      ${navItems.map(([route, icon, label]) => `
        <button class="mbn-item ${active === route ? 'active' : ''}" onclick="Router.navigate('${route}')">
          <span class="mbn-icon">${icon}</span>
          <span class="mbn-label">${label}</span>
        </button>
      `).join('')}
    </nav>
  `;
};
