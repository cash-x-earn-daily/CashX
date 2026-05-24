// ============================================================
// PAGES2.JS - Products, Cart, Wallet, Orders, Withdrawals, Profile
// ============================================================

// ============================================================
// PRODUCTS PAGE
// ============================================================
window.renderProducts = async function() {
  clearAllTimers();
  document.getElementById('app').innerHTML = `
    <div class="dashboard-layout">
      ${renderSidebar('products')}
      <div class="main-content">
        ${renderTopBar()}
        <div class="page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Investment Plans</h1>
              <p class="page-sub">Choose a plan and start earning daily cashback</p>
            </div>
          </div>
          <div id="products-grid" class="loading-state">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
      ${renderMobileNav('products')}
    </div>
  `;

  const { data: products } = await DB.getProducts();
  const cartItems = Auth.isLoggedIn() ? (await DB.getCart()).data.map(c => c.product_id) : [];

  document.getElementById('products-grid').className = 'products-grid';
  document.getElementById('products-grid').innerHTML = products.map((p, i) => {
    const totalReturn = (p.cashback_per_day || (p.price * p.cashback_percent / 100)) * p.duration_days;
    const cashbackPerDay = p.price * p.cashback_percent / 100;
    const features = Utils.parseFeatures(p.features);
    const inCart = cartItems.includes(p.id);
    return `
    <div class="product-card glass-card hover-lift animate-in" style="animation-delay:${i * 0.08}s">
      <div class="product-img-wrap">
        <img src="${p.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400'}" alt="${p.name}" class="product-img" onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400'">
        <div class="product-badge">${p.cashback_percent}% Daily</div>
      </div>
      <div class="product-body">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.description || ''}</p>
        <div class="product-stats">
          <div class="product-stat">
            <div class="ps-label">Investment</div>
            <div class="ps-value">${Utils.formatCurrency(p.price)}</div>
          </div>
          <div class="product-stat">
            <div class="ps-label">Daily Cashback</div>
            <div class="ps-value text-success">+${Utils.formatCurrency(cashbackPerDay)}</div>
          </div>
          <div class="product-stat">
            <div class="ps-label">Duration</div>
            <div class="ps-value">${p.duration_days} Days</div>
          </div>
          <div class="product-stat">
            <div class="ps-label">Total Returns</div>
            <div class="ps-value text-success">+${Utils.formatCurrency(totalReturn)}</div>
          </div>
        </div>
        ${features.length > 0 ? `
        <ul class="product-features">
          ${features.map(f => `<li>✓ ${f}</li>`).join('')}
        </ul>` : ''}
        <div class="product-actions">
          <button class="btn btn-primary" onclick="handleBuyNow('${p.id}')">Buy Now</button>
          <button class="btn ${inCart ? 'btn-success' : 'btn-outline'}" id="cart-btn-${p.id}" onclick="handleAddToCart('${p.id}')">
            ${inCart ? '✓ In Cart' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
};

window.handleAddToCart = async function(productId) {
  if (!Auth.isLoggedIn()) { Router.navigate('login'); return; }
  const btn = document.getElementById(`cart-btn-${productId}`);
  btn.disabled = true;
  const { error } = await DB.addToCart(productId);
  if (error) { Toast.show('Failed to add to cart', 'error'); }
  else { btn.textContent = '✓ In Cart'; btn.className = 'btn btn-success'; Toast.show('Added to cart!', 'success'); }
  btn.disabled = false;
};

window.handleBuyNow = async function(productId) {
  if (!Auth.isLoggedIn()) { Router.navigate('login'); return; }
  const { data: products } = await DB.getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;
  showPaymentModal(product);
};

// ============================================================
// PAYMENT MODAL (Razorpay-ready)
// ============================================================
window.showPaymentModal = function(product) {
  const cashbackPerDay = product.price * product.cashback_percent / 100;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'payment-modal';
  modal.innerHTML = `
    <div class="modal glass-card payment-modal">
      <div class="modal-header">
        <h2 class="modal-title">Complete Purchase</h2>
        <button class="modal-close" onclick="document.getElementById('payment-modal').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="payment-product-summary">
          <div class="payment-plan-name">${product.name}</div>
          <div class="payment-plan-amount">${Utils.formatCurrency(product.price)}</div>
          <div class="payment-plan-details">
            ${product.cashback_percent}% daily • ${product.duration_days} days • +${Utils.formatCurrency(cashbackPerDay)}/day
          </div>
        </div>

        <div class="payment-methods">
          <h4 class="pm-title">Select Payment Method</h4>
          <label class="pm-option active" id="pm-razorpay">
            <input type="radio" name="pm" value="razorpay" checked>
            <span class="pm-icon">💳</span>
            <div class="pm-info">
              <div class="pm-name">Razorpay</div>
              <div class="pm-sub">Cards, UPI, NetBanking, Wallets</div>
            </div>
            <span class="pm-badge">Secure</span>
          </label>
          <label class="pm-option" id="pm-wallet">
            <input type="radio" name="pm" value="wallet">
            <span class="pm-icon">💰</span>
            <div class="pm-info">
              <div class="pm-name">Wallet Balance</div>
              <div class="pm-sub">Available: ${Utils.formatCurrency(Auth.currentProfile?.wallet_balance)}</div>
            </div>
          </label>
        </div>

        <div class="payment-summary-box glass-card-inner">
          <div class="payment-row"><span>Plan Amount</span><span>${Utils.formatCurrency(product.price)}</span></div>
          <div class="payment-row"><span>Daily Cashback</span><span class="text-success">+${Utils.formatCurrency(cashbackPerDay)}</span></div>
          <div class="payment-row"><span>Duration</span><span>${product.duration_days} days</span></div>
          <div class="payment-row total"><span>Total</span><span>${Utils.formatCurrency(product.price)}</span></div>
        </div>

        <button class="btn btn-primary w-full btn-xl" id="pay-btn" onclick="processPayment('${product.id}')">
          Pay ${Utils.formatCurrency(product.price)} →
        </button>
        <p class="payment-note">🔒 Your payment is 100% secure and encrypted</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.querySelectorAll('.pm-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.pm-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

window.processPayment = async function(productId) {
  const { data: products } = await DB.getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const btn = document.getElementById('pay-btn');
  btn.disabled = true; btn.textContent = 'Processing...';

  const pm = document.querySelector('input[name="pm"]:checked')?.value || 'razorpay';

  // Create order in DB
  const { data: order, error: orderError } = await DB.createOrder(product, pm);
  if (orderError) { Toast.show('Failed to create order', 'error'); btn.disabled = false; btn.textContent = 'Pay'; return; }

  if (pm === 'wallet') {
    const balance = Auth.currentProfile?.wallet_balance || 0;
    if (balance < product.price) { Toast.show(`Insufficient wallet balance. Need ${Utils.formatCurrency(product.price)}.`, 'error'); btn.disabled = false; btn.textContent = 'Pay'; return; }
    const debit = await DB.debitWallet(product.price, 'debit', `Purchase: ${product.name}`, order.id, 'order');
    if (debit.error || !debit.data?.success) { Toast.show('Wallet debit failed', 'error'); btn.disabled = false; btn.textContent = 'Pay'; return; }
    await DB.activateOrder(order.id, 'wallet_payment');
    await Auth.loadProfile();
    document.getElementById('payment-modal').remove();
    Toast.show('Plan activated! Daily cashback will start in 24 hours 🎉', 'success');
    Router.navigate('dashboard');
    return;
  }

  // Razorpay integration (future-ready)
  if (typeof Razorpay !== 'undefined') {
    const options = {
      key: APP_CONFIG.razorpayKeyId,
      amount: product.price * 100,
      currency: 'INR',
      name: 'CashX',
      description: product.name,
      order_id: order.razorpay_order_id,
      handler: async (response) => {
        await DB.activateOrder(order.id, response.razorpay_payment_id);
        await supabase.from('payments').insert({
          order_id: order.id, user_id: Auth.currentUser.id,
          amount: product.price, status: 'success',
          gateway_payment_id: response.razorpay_payment_id,
          gateway_signature: response.razorpay_signature,
        });
        await Auth.loadProfile();
        document.getElementById('payment-modal').remove();
        Toast.show('Payment successful! Plan activated 🎉', 'success');
        Router.navigate('dashboard');
      },
      prefill: { email: Auth.currentUser?.email, contact: Auth.currentProfile?.phone },
      theme: { color: '#6366f1' }
    };
    new Razorpay(options).open();
  } else {
    // Demo mode - simulate successful payment
    await new Promise(r => setTimeout(r, 1500));
    await DB.activateOrder(order.id, 'demo_payment_' + Date.now());
    // Update invested total
    await supabase.from('users').update({
      total_invested: (Auth.currentProfile?.total_invested || 0) + product.price,
      updated_at: new Date().toISOString()
    }).eq('id', Auth.currentUser.id);
    await Auth.loadProfile();
    document.getElementById('payment-modal').remove();
    Toast.show('Plan activated! (Demo Mode) Daily cashback starts in 24 hours 🎉', 'success');
    Router.navigate('dashboard');
  }
};

// ============================================================
// CART PAGE
// ============================================================
window.renderCart = async function() {
  clearAllTimers();
  const { data: cartItems } = await DB.getCart();

  document.getElementById('app').innerHTML = `
    <div class="dashboard-layout">
      ${renderSidebar('cart')}
      <div class="main-content">
        ${renderTopBar()}
        <div class="page-content">
          <div class="page-header">
            <h1 class="page-title">Cart <span class="count-badge">${cartItems.length}</span></h1>
          </div>
          ${cartItems.length === 0 ? `
          <div class="empty-state glass-card">
            <div class="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Browse our investment plans and add them to cart</p>
            <button class="btn btn-primary" onclick="Router.navigate('products')">Browse Plans →</button>
          </div>` : `
          <div class="cart-layout">
            <div class="cart-items">
              ${cartItems.map(item => {
                const p = item.products;
                if (!p) return '';
                const cashbackPerDay = p.price * p.cashback_percent / 100;
                return `
                <div class="cart-item glass-card">
                  <img src="${p.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400'}" alt="${p.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400'">
                  <div class="cart-item-info">
                    <div class="cart-item-name">${p.name}</div>
                    <div class="cart-item-detail">${p.cashback_percent}% daily • ${p.duration_days} days</div>
                    <div class="cart-item-cashback">+${Utils.formatCurrency(cashbackPerDay)}/day</div>
                  </div>
                  <div class="cart-item-right">
                    <div class="cart-item-price">${Utils.formatCurrency(p.price)}</div>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart('${p.id}')">Remove</button>
                  </div>
                </div>`;
              }).join('')}
            </div>
            <div class="cart-summary glass-card">
              <h3 class="summary-title">Order Summary</h3>
              <div class="summary-rows">
                ${cartItems.map(item => item.products ? `
                <div class="summary-row">
                  <span>${item.products.name}</span>
                  <span>${Utils.formatCurrency(item.products.price)}</span>
                </div>` : '').join('')}
                <div class="summary-divider"></div>
                <div class="summary-total">
                  <span>Total</span>
                  <strong>${Utils.formatCurrency(cartItems.reduce((s, i) => s + parseFloat(i.products?.price || 0), 0))}</strong>
                </div>
              </div>
              <button class="btn btn-primary w-full btn-lg" onclick="checkoutAll()">
                Checkout All →
              </button>
              <button class="btn btn-outline w-full" onclick="Router.navigate('products')">Add More Plans</button>
            </div>
          </div>`}
        </div>
      </div>
      ${renderMobileNav('cart')}
    </div>
  `;
};

window.removeFromCart = async function(productId) {
  await DB.removeFromCart(productId);
  Toast.show('Removed from cart', 'info');
  renderCart();
};

window.checkoutAll = async function() {
  const { data: cartItems } = await DB.getCart();
  if (!cartItems.length) return;
  // Show combined payment for first item (simplified - in production handle multi-item)
  if (cartItems[0]?.products) showPaymentModal(cartItems[0].products);
};

// ============================================================
// WALLET PAGE
// ============================================================
window.renderWallet = async function() {
  clearAllTimers();
  const [profile, transactions] = await Promise.all([
    Auth.loadProfile(),
    DB.getWalletTransactions(50)
  ]);

  document.getElementById('app').innerHTML = `
    <div class="dashboard-layout">
      ${renderSidebar('wallet')}
      <div class="main-content">
        ${renderTopBar()}
        <div class="page-content">
          <div class="page-header">
            <h1 class="page-title">Wallet</h1>
          </div>

          <!-- WALLET HERO CARD -->
          <div class="wallet-hero-card glass-card animate-in">
            <div class="wallet-balance-section">
              <div class="wallet-label">Available Balance</div>
              <div class="wallet-amount">${Utils.formatCurrency(profile?.wallet_balance)}</div>
              <div class="wallet-sub">Updated just now</div>
            </div>
            <div class="wallet-actions">
              <button class="wallet-action-btn" onclick="Router.navigate('withdrawals')">
                <span>📤</span> Withdraw
              </button>
              <button class="wallet-action-btn" onclick="Router.navigate('products')">
                <span>🔄</span> Reinvest
              </button>
            </div>
            <div class="wallet-stats">
              <div class="wallet-stat">
                <div class="ws-label">Total Earned</div>
                <div class="ws-value">${Utils.formatCurrency(profile?.total_cashback_earned)}</div>
              </div>
              <div class="wallet-stat">
                <div class="ws-label">Total Invested</div>
                <div class="ws-value">${Utils.formatCurrency(profile?.total_invested)}</div>
              </div>
            </div>
          </div>

          <!-- TRANSACTION FILTERS -->
          <div class="filter-bar glass-card">
            <button class="filter-btn active" onclick="filterTransactions('all', this)">All</button>
            <button class="filter-btn" onclick="filterTransactions('cashback', this)">Cashback</button>
            <button class="filter-btn" onclick="filterTransactions('withdrawal', this)">Withdrawals</button>
            <button class="filter-btn" onclick="filterTransactions('debit', this)">Debits</button>
          </div>

          <!-- TRANSACTIONS -->
          <div class="section-card glass-card">
            <div class="card-header">
              <h2 class="card-title">Transaction History</h2>
              <span class="badge badge-info">${transactions.length} transactions</span>
            </div>
            <div id="transactions-container" class="transactions-list">
              ${renderTransactionList(transactions)}
            </div>
          </div>
        </div>
      </div>
      ${renderMobileNav('wallet')}
    </div>
  `;
  window._allTransactions = transactions;
};

window.filterTransactions = function(type, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = type === 'all' ? window._allTransactions : window._allTransactions.filter(t => t.type === type);
  document.getElementById('transactions-container').innerHTML = renderTransactionList(filtered);
};

function renderTransactionList(txns) {
  if (!txns.length) return '<p class="empty-text">No transactions found</p>';
  return txns.map(t => `
    <div class="transaction-item">
      <div class="tx-icon tx-${t.type}">${{cashback:'💸',withdrawal:'📤',reinvest:'🔄',refund:'↩️',bonus:'🎁',debit:'📤'}[t.type] || '💳'}</div>
      <div class="tx-info">
        <div class="tx-desc">${t.description || t.type}</div>
        <div class="tx-time">${Utils.formatDateTime(t.created_at)}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount ${['cashback','refund','bonus'].includes(t.type) ? 'text-success' : 'text-danger'}">
          ${['cashback','refund','bonus'].includes(t.type) ? '+' : '-'}${Utils.formatCurrency(t.amount)}
        </div>
        <div class="tx-balance">Bal: ${Utils.formatCurrency(t.balance_after)}</div>
      </div>
    </div>
  `).join('');
}

// ============================================================
// ORDERS PAGE
// ============================================================
window.renderOrders = async function() {
  clearAllTimers();
  const { data: orders } = await DB.getOrders();

  document.getElementById('app').innerHTML = `
    <div class="dashboard-layout">
      ${renderSidebar('orders')}
      <div class="main-content">
        ${renderTopBar()}
        <div class="page-content">
          <div class="page-header">
            <h1 class="page-title">Order History</h1>
            <div class="header-actions">
              <select class="form-select" onchange="filterOrders(this.value)">
                <option value="all">All Orders</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending_payment">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <div id="orders-container">
            ${orders.length === 0
              ? `<div class="empty-state glass-card"><div class="empty-icon">📋</div><h3>No orders yet</h3><p>Your purchase history will appear here</p><button class="btn btn-primary" onclick="Router.navigate('products')">Browse Plans</button></div>`
              : orders.map(o => renderFullOrderCard(o)).join('')
            }
          </div>
        </div>
      </div>
      ${renderMobileNav('orders')}
    </div>
  `;

  window._allOrders = orders;
  orders.filter(o => o.status === 'active').forEach(o => {
    if (o.next_cashback_at) startOrderTimer(o.id, o.next_cashback_at);
  });
};

window.filterOrders = function(status) {
  const filtered = status === 'all' ? window._allOrders : window._allOrders.filter(o => o.status === status);
  document.getElementById('orders-container').innerHTML = filtered.length
    ? filtered.map(o => renderFullOrderCard(o)).join('')
    : '<p class="empty-text">No orders found</p>';
  filtered.filter(o => o.status === 'active').forEach(o => {
    if (o.next_cashback_at) startOrderTimer(o.id, o.next_cashback_at);
  });
};

function renderFullOrderCard(order) {
  const snap = order.product_snapshot || {};
  const progress = order.duration_days > 0 ? (order.cashback_days_credited / order.duration_days) * 100 : 0;
  return `
  <div class="order-full-card glass-card animate-in" onclick="openOrderDetail('${order.id}')">
    <div class="ofc-header">
      <div class="ofc-left">
        <div class="ofc-name">${snap.name || 'Investment Plan'}</div>
        <div class="ofc-date">${Utils.formatDate(order.created_at)}</div>
      </div>
      <div class="ofc-right">
        ${Utils.statusBadge(order.status)}
        <div class="ofc-amount">${Utils.formatCurrency(order.amount)}</div>
      </div>
    </div>
    <div class="ofc-stats">
      <div class="ofc-stat"><span>Daily</span><strong class="text-success">+${Utils.formatCurrency(order.cashback_per_day)}</strong></div>
      <div class="ofc-stat"><span>Earned</span><strong>${Utils.formatCurrency(order.cashback_earned)}</strong></div>
      <div class="ofc-stat"><span>Days</span><strong>${order.cashback_days_credited}/${order.duration_days}</strong></div>
      ${order.status === 'active' ? `<div class="ofc-stat"><span>Next</span><strong id="timer-${order.id}" class="text-success">...</strong></div>` : ''}
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar" style="width:${progress}%"></div>
    </div>
    <div class="ofc-click-hint">Click to view details →</div>
  </div>`;
}

// ============================================================
// WITHDRAWALS PAGE
// ============================================================
window.renderWithdrawals = async function() {
  clearAllTimers();
  const [profile, withdrawals] = await Promise.all([
    Auth.loadProfile(),
    DB.getWithdrawals()
  ]);

  document.getElementById('app').innerHTML = `
    <div class="dashboard-layout">
      ${renderSidebar('withdrawals')}
      <div class="main-content">
        ${renderTopBar()}
        <div class="page-content">
          <div class="page-header">
            <h1 class="page-title">Withdrawals</h1>
          </div>

          <!-- BALANCE CARD -->
          <div class="withdrawal-balance-card glass-card animate-in">
            <div class="wb-left">
              <div class="wb-label">Available Balance</div>
              <div class="wb-amount">${Utils.formatCurrency(profile?.wallet_balance)}</div>
              <div class="wb-min">Minimum withdrawal: ${Utils.formatCurrency(150)}</div>
            </div>
            <button class="btn btn-primary btn-lg" onclick="showWithdrawalModal(${profile?.wallet_balance || 0}, '${profile?.upi_id || ''}')">
              Request Withdrawal
            </button>
          </div>

          <!-- WITHDRAWAL HISTORY -->
          <div class="section-card glass-card animate-in">
            <div class="card-header">
              <h2 class="card-title">Withdrawal History</h2>
            </div>
            ${withdrawals.length === 0 ? `
            <div class="empty-state-sm">
              <p>No withdrawal requests yet</p>
            </div>` : `
            <div class="withdrawals-list">
              ${withdrawals.map(w => `
              <div class="withdrawal-item">
                <div class="wi-left">
                  <div class="wi-upi">📱 ${w.upi_id}</div>
                  <div class="wi-date">${Utils.formatDateTime(w.created_at)}</div>
                  ${w.admin_note ? `<div class="wi-note">Note: ${w.admin_note}</div>` : ''}
                </div>
                <div class="wi-right">
                  <div class="wi-amount">${Utils.formatCurrency(w.amount)}</div>
                  ${Utils.statusBadge(w.status)}
                </div>
              </div>`).join('')}
            </div>`}
          </div>
        </div>
      </div>
      ${renderMobileNav('withdrawals')}
    </div>
  `;
};

window.showWithdrawalModal = function(balance, savedUpi) {
  if (balance < 150) { Toast.show('Minimum withdrawal is ₹150', 'warning'); return; }
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'withdrawal-modal';
  modal.innerHTML = `
    <div class="modal glass-card">
      <div class="modal-header">
        <h2 class="modal-title">Request Withdrawal</h2>
        <button class="modal-close" onclick="document.getElementById('withdrawal-modal').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Amount (Min ₹150, Max ${Utils.formatCurrency(balance)})</label>
          <input type="number" class="form-input" id="wd-amount" placeholder="Enter amount" min="150" max="${balance}" step="1">
        </div>
        <div class="form-group">
          <label class="form-label">UPI ID</label>
          <input type="text" class="form-input" id="wd-upi" placeholder="yourname@upi" value="${savedUpi}">
        </div>
        <div class="wd-note glass-card-inner">
          ⚡ Withdrawals processed within 2-4 hours via RazorpayX
        </div>
        <button class="btn btn-primary w-full btn-lg" onclick="submitWithdrawal()">
          Confirm Withdrawal
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
};

window.submitWithdrawal = async function() {
  const amount = parseFloat(document.getElementById('wd-amount').value);
  const upi = document.getElementById('wd-upi').value.trim();
  if (!amount || amount < 150) { Toast.show('Minimum withdrawal is ₹150', 'warning'); return; }
  if (!upi) { Toast.show('Enter your UPI ID', 'warning'); return; }
  if (amount > (Auth.currentProfile?.wallet_balance || 0)) { Toast.show('Insufficient balance', 'error'); return; }
  const { error } = await DB.requestWithdrawal(amount, upi);
  if (error) { Toast.show(error.message || 'Withdrawal failed', 'error'); return; }
  await DB.updateProfile({ upi_id: upi });
  document.getElementById('withdrawal-modal').remove();
  Toast.show('Withdrawal request submitted! Processing in 2-4 hours 🎉', 'success');
  await Auth.loadProfile();
  renderWithdrawals();
};

// ============================================================
// PROFILE PAGE
// ============================================================
window.renderProfile = async function() {
  clearAllTimers();
  const profile = await Auth.loadProfile();

  document.getElementById('app').innerHTML = `
    <div class="dashboard-layout">
      ${renderSidebar('profile')}
      <div class="main-content">
        ${renderTopBar()}
        <div class="page-content">
          <div class="page-header"><h1 class="page-title">Profile</h1></div>

          <div class="profile-card glass-card animate-in">
            <div class="profile-avatar-section">
              <div class="profile-avatar">${(profile?.full_name || 'U')[0].toUpperCase()}</div>
              <div class="profile-name">${profile?.full_name || 'User'}</div>
              <div class="profile-email">${profile?.email || profile?.phone || ''}</div>
              ${profile?.role === 'admin' ? '<span class="badge badge-purple">Admin</span>' : ''}
            </div>

            <div class="profile-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="p-name" value="${profile?.full_name || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="p-email" value="${profile?.email || ''}" readonly style="opacity:0.6">
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="tel" class="form-input" id="p-phone" value="${profile?.phone || ''}" readonly style="opacity:0.6">
              </div>
              <div class="form-group">
                <label class="form-label">UPI ID (for withdrawals)</label>
                <input type="text" class="form-input" id="p-upi" value="${profile?.upi_id || ''}" placeholder="yourname@upi">
              </div>
              <button class="btn btn-primary btn-lg" id="save-profile-btn" onclick="saveProfile()">
                Save Changes
              </button>
            </div>
          </div>

          <div class="profile-stats-grid">
            <div class="psg-card glass-card">
              <div class="psg-label">Member Since</div>
              <div class="psg-value">${Utils.formatDate(profile?.created_at)}</div>
            </div>
            <div class="psg-card glass-card">
              <div class="psg-label">Total Invested</div>
              <div class="psg-value">${Utils.formatCurrency(profile?.total_invested)}</div>
            </div>
            <div class="psg-card glass-card">
              <div class="psg-label">Cashback Earned</div>
              <div class="psg-value">${Utils.formatCurrency(profile?.total_cashback_earned)}</div>
            </div>
          </div>

          <div class="danger-zone glass-card">
            <h3 class="dz-title">Account</h3>
            <button class="btn btn-outline-danger" onclick="confirmSignOut()">Sign Out</button>
          </div>
        </div>
      </div>
      ${renderMobileNav('profile')}
    </div>
  `;
};

window.saveProfile = async function() {
  const name = document.getElementById('p-name').value.trim();
  const upi = document.getElementById('p-upi').value.trim();
  const btn = document.getElementById('save-profile-btn');
  btn.disabled = true; btn.textContent = 'Saving...';
  const { error } = await DB.updateProfile({ full_name: name, upi_id: upi });
  if (error) { Toast.show('Failed to save', 'error'); }
  else { Toast.show('Profile updated!', 'success'); }
  btn.disabled = false; btn.textContent = 'Save Changes';
};

window.confirmSignOut = function() {
  if (confirm('Sign out of CashX?')) Auth.signOut();
};
