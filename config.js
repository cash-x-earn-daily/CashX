// ============================================================
// CONFIG.JS - Supabase Configuration & App Constants
// ============================================================

const SUPABASE_CONFIG = {
  // ⚠️ REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_ANON_KEY_HERE',
};

const APP_CONFIG = {
  name: 'CashX',
  tagline: 'Earn While You Sleep',
  currency: '₹',
  minWithdrawal: 150,
  cashbackInterval: 24 * 60 * 60 * 1000, // 24 hours in ms
  razorpayKeyId: 'rzp_test_YOUR_KEY', // Replace with actual key
};

// Initialize Supabase
let supabase;
try {
  supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
} catch (e) {
  console.error('Supabase init failed:', e);
}

// ============================================================
// AUTH MODULE
// ============================================================
const Auth = {
  currentUser: null,
  currentProfile: null,

  async init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.currentUser = session.user;
      await this.loadProfile();
    }
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        this.currentUser = session.user;
        await this.loadProfile();
      } else {
        this.currentUser = null;
        this.currentProfile = null;
      }
      Router.handleRoute();
    });
  },

  async loadProfile() {
    if (!this.currentUser) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.currentUser.id)
      .single();
    if (!error) this.currentProfile = data;
    return data;
  },

  async signUpEmail(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    return { data, error };
  },

  async signInEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async sendOTP(phone) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith('+') ? phone : `+91${phone}`
    });
    return { data, error };
  },

  async verifyOTP(phone, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.startsWith('+') ? phone : `+91${phone}`,
      token,
      type: 'sms'
    });
    return { data, error };
  },

  async signOut() {
    await supabase.auth.signOut();
    this.currentUser = null;
    this.currentProfile = null;
    Router.navigate('landing');
  },

  isLoggedIn() { return !!this.currentUser; },
  isAdmin() { return this.currentProfile?.role === 'admin'; },
};

// ============================================================
// ROUTER MODULE
// ============================================================
const Router = {
  routes: {
    landing: 'renderLanding',
    login: 'renderLogin',
    dashboard: 'renderDashboard',
    products: 'renderProducts',
    cart: 'renderCart',
    wallet: 'renderWallet',
    orders: 'renderOrders',
    withdrawals: 'renderWithdrawals',
    profile: 'renderProfile',
    admin: 'renderAdmin',
  },
  protectedRoutes: ['dashboard','cart','wallet','orders','withdrawals','profile','admin'],
  adminRoutes: ['admin'],

  navigate(route, params = {}) {
    window.location.hash = route;
    this.currentParams = params;
    this.handleRoute();
  },

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'landing';
    const route = hash.split('?')[0];

    if (this.protectedRoutes.includes(route) && !Auth.isLoggedIn()) {
      this.navigate('login');
      return;
    }
    if (this.adminRoutes.includes(route) && !Auth.isAdmin()) {
      this.navigate('dashboard');
      Toast.show('Access denied. Admin only.', 'error');
      return;
    }

    const renderFn = this.routes[route];
    if (renderFn && window[renderFn]) {
      window[renderFn]();
    } else {
      window.renderLanding?.();
    }
    this.updateNav(route);
  },

  updateNav(route) {
    document.querySelectorAll('[data-route]').forEach(el => {
      el.classList.toggle('active', el.dataset.route === route);
    });
  }
};

// ============================================================
// TOAST NOTIFICATION MODULE
// ============================================================
const Toast = {
  show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container') || this.createContainer();
    const toast = document.createElement('div');
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  createContainer() {
    const el = document.createElement('div');
    el.id = 'toast-container';
    document.body.appendChild(el);
    return el;
  }
};

// ============================================================
// UTILS MODULE
// ============================================================
const Utils = {
  formatCurrency(amount) {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },
  formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },
  timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  },
  countdown(targetDate) {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 };
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { hours, minutes, seconds, total: diff };
  },
  statusBadge(status) {
    const map = {
      pending_payment: ['⏳', 'badge-warning', 'Pending Payment'],
      payment_verifying: ['🔄', 'badge-info', 'Verifying'],
      active: ['✅', 'badge-success', 'Active'],
      failed: ['❌', 'badge-danger', 'Failed'],
      completed: ['🏆', 'badge-purple', 'Completed'],
      pending: ['⏳', 'badge-warning', 'Pending'],
      approved: ['✅', 'badge-success', 'Approved'],
      rejected: ['❌', 'badge-danger', 'Rejected'],
      processed: ['💸', 'badge-purple', 'Processed'],
    };
    const [icon, cls, label] = map[status] || ['●', 'badge-default', status];
    return `<span class="badge ${cls}">${icon} ${label}</span>`;
  },
  parseFeatures(features) {
    try {
      return typeof features === 'string' ? JSON.parse(features) : features || [];
    } catch { return []; }
  }
};

// ============================================================
// DB MODULE - All database operations
// ============================================================
const DB = {
  // Products
  async getProducts() {
    const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('price');
    return { data: data || [], error };
  },
  async getAllProducts() {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  async saveProduct(product) {
    if (product.id) {
      const { id, ...rest } = product;
      return supabase.from('products').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id);
    }
    return supabase.from('products').insert(product);
  },
  async deleteProduct(id) {
    return supabase.from('products').update({ is_active: false }).eq('id', id);
  },

  // Cart
  async getCart() {
    const { data, error } = await supabase.from('carts').select('*, products(*)').eq('user_id', Auth.currentUser.id);
    return { data: data || [], error };
  },
  async addToCart(productId) {
    return supabase.from('carts').upsert({ user_id: Auth.currentUser.id, product_id: productId }, { onConflict: 'user_id,product_id' });
  },
  async removeFromCart(productId) {
    return supabase.from('carts').delete().eq('user_id', Auth.currentUser.id).eq('product_id', productId);
  },
  async clearCart() {
    return supabase.from('carts').delete().eq('user_id', Auth.currentUser.id);
  },

  // Orders
  async createOrder(product, paymentMethod = 'razorpay') {
    const cashbackPerDay = (product.price * product.cashback_percent) / 100;
    const now = new Date();
    return supabase.from('orders').insert({
      user_id: Auth.currentUser.id,
      product_id: product.id,
      product_snapshot: product,
      amount: product.price,
      cashback_percent: product.cashback_percent,
      cashback_per_day: cashbackPerDay,
      duration_days: product.duration_days,
      status: 'pending_payment',
      payment_method: paymentMethod,
    }).select().single();
  },
  async activateOrder(orderId, razorpayPaymentId) {
    const now = new Date();
    const nextCashback = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return supabase.from('orders').update({
      status: 'active',
      started_at: now.toISOString(),
      ends_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_cashback_at: nextCashback.toISOString(),
      razorpay_payment_id: razorpayPaymentId,
      updated_at: now.toISOString(),
    }).eq('id', orderId);
  },
  async getOrders() {
    const { data, error } = await supabase.from('orders').select('*, products(name, image_url)').eq('user_id', Auth.currentUser.id).order('created_at', { ascending: false });
    return { data: data || [], error };
  },
  async getAllOrders() {
    const { data, error } = await supabase.from('orders').select('*, users(full_name, email), products(name)').order('created_at', { ascending: false }).limit(100);
    return { data: data || [], error };
  },
  async getCashbackLogs(orderId) {
    const { data } = await supabase.from('cashback_logs').select('*').eq('order_id', orderId).order('day_number');
    return data || [];
  },

  // Wallet
  async getWalletTransactions(limit = 20) {
    const { data } = await supabase.from('wallet_transactions').select('*').eq('user_id', Auth.currentUser.id).order('created_at', { ascending: false }).limit(limit);
    return data || [];
  },
  async creditWallet(amount, type, description, refId = null, refType = null) {
    const { data, error } = await supabase.rpc('credit_wallet', {
      p_user_id: Auth.currentUser.id,
      p_amount: amount,
      p_type: type,
      p_description: description,
      p_reference_id: refId,
      p_reference_type: refType,
    });
    return { data, error };
  },
  async debitWallet(amount, type, description, refId = null, refType = null) {
    const { data, error } = await supabase.rpc('debit_wallet', {
      p_user_id: Auth.currentUser.id,
      p_amount: amount,
      p_type: type,
      p_description: description,
      p_reference_id: refId,
      p_reference_type: refType,
    });
    return { data, error };
  },

  // Withdrawals
  async requestWithdrawal(amount, upiId) {
    const result = await this.debitWallet(amount, 'withdrawal', `Withdrawal request of ₹${amount}`);
    if (result.error || !result.data?.success) return { error: result.error || { message: result.data?.error } };
    return supabase.from('withdrawals').insert({ user_id: Auth.currentUser.id, amount, upi_id: upiId }).select().single();
  },
  async getWithdrawals() {
    const { data } = await supabase.from('withdrawals').select('*').eq('user_id', Auth.currentUser.id).order('created_at', { ascending: false });
    return data || [];
  },
  async getAllWithdrawals() {
    const { data } = await supabase.from('withdrawals').select('*, users(full_name, email)').order('created_at', { ascending: false });
    return data || [];
  },
  async updateWithdrawal(id, status, adminNote = '') {
    return supabase.from('withdrawals').update({ status, admin_note: adminNote, processed_at: new Date().toISOString() }).eq('id', id);
  },

  // Users (admin)
  async getAllUsers() {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  // Testimonials
  async getTestimonials() {
    const { data } = await supabase.from('testimonials').select('*').eq('is_active', true);
    return data || [];
  },
  async saveTestimonial(t) {
    if (t.id) {
      const { id, ...rest } = t;
      return supabase.from('testimonials').update(rest).eq('id', id);
    }
    return supabase.from('testimonials').insert(t);
  },

  // Profile
  async updateProfile(updates) {
    const { data, error } = await supabase.from('users').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', Auth.currentUser.id).select().single();
    if (!error) Auth.currentProfile = data;
    return { data, error };
  },

  // Analytics (admin)
  async getAnalytics() {
    const [users, orders, withdrawals, transactions] = await Promise.all([
      supabase.from('users').select('id, created_at, total_invested, total_cashback_earned', { count: 'exact' }),
      supabase.from('orders').select('id, status, amount, cashback_earned', { count: 'exact' }),
      supabase.from('withdrawals').select('id, status, amount', { count: 'exact' }),
      supabase.from('wallet_transactions').select('type, amount').eq('type', 'cashback'),
    ]);
    return {
      totalUsers: users.count || 0,
      totalOrders: orders.count || 0,
      activeOrders: (orders.data || []).filter(o => o.status === 'active').length,
      totalRevenue: (orders.data || []).reduce((s, o) => s + parseFloat(o.amount || 0), 0),
      totalCashbackPaid: (transactions.data || []).reduce((s, t) => s + parseFloat(t.amount || 0), 0),
      pendingWithdrawals: (withdrawals.data || []).filter(w => w.status === 'pending').length,
      totalWithdrawn: (withdrawals.data || []).filter(w => w.status === 'processed').reduce((s, w) => s + parseFloat(w.amount || 0), 0),
    };
  }
};

// Global timers store
const ActiveTimers = {};

function clearAllTimers() {
  Object.values(ActiveTimers).forEach(t => clearInterval(t));
  Object.keys(ActiveTimers).forEach(k => delete ActiveTimers[k]);
}

// Expose globals
window.supabaseClient = supabase;
window.Auth = Auth;
window.Router = Router;
window.Toast = Toast;
window.Utils = Utils;
window.DB = DB;
window.APP_CONFIG = APP_CONFIG;
window.ActiveTimers = ActiveTimers;
window.clearAllTimers = clearAllTimers;
