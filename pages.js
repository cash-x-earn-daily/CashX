// ============================================================
// PAGES.JS - All page renderers
// ============================================================

// ============================================================
// LANDING PAGE
// ============================================================
window.renderLanding = async function() {
  clearAllTimers();
  const testimonials = await DB.getTestimonials();
  const products = (await DB.getProducts()).data.slice(0, 3);

  document.getElementById('app').innerHTML = `
    <div class="landing-page">
      <!-- NAV -->
      <nav class="landing-nav glass-nav">
        <div class="nav-brand">
          <div class="brand-logo">₹</div>
          <span class="brand-name">Cash<span class="accent">X</span></span>
        </div>
        <div class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#products" class="nav-link">Plans</a>
          <a href="#testimonials" class="nav-link">Reviews</a>
          ${Auth.isLoggedIn()
            ? `<button class="btn btn-primary" onclick="Router.navigate('dashboard')">Dashboard</button>`
            : `<button class="btn btn-outline" onclick="Router.navigate('login')">Sign In</button>
               <button class="btn btn-primary" onclick="Router.navigate('login')">Get Started</button>`
          }
        </div>
        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">☰</button>
      </nav>

      <!-- MOBILE MENU -->
      <div class="mobile-menu" id="mobile-menu">
        <a href="#features" class="mobile-link" onclick="toggleMobileMenu()">Features</a>
        <a href="#products" class="mobile-link" onclick="toggleMobileMenu()">Plans</a>
        <a href="#testimonials" class="mobile-link" onclick="toggleMobileMenu()">Reviews</a>
        ${Auth.isLoggedIn()
          ? `<button class="btn btn-primary w-full" onclick="Router.navigate('dashboard')">Dashboard</button>`
          : `<button class="btn btn-primary w-full" onclick="Router.navigate('login')">Get Started Free</button>`
        }
      </div>

      <!-- HERO -->
      <section class="hero">
        <div class="hero-bg">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
          <div class="orb orb-3"></div>
          <div class="grid-lines"></div>
        </div>
        <div class="hero-content">
          <div class="hero-badge animate-in">
            <span class="badge-dot"></span>
            Live Daily Payouts — Trusted by 10,000+ Investors
          </div>
          <h1 class="hero-title animate-in" style="animation-delay:0.1s">
            Your Money Works<br><span class="gradient-text">While You Sleep</span>
          </h1>
          <p class="hero-subtitle animate-in" style="animation-delay:0.2s">
            Earn guaranteed daily cashback on your investments. Transparent, instant, and 100% automated. Start with just ₹999.
          </p>
          <div class="hero-actions animate-in" style="animation-delay:0.3s">
            <button class="btn btn-primary btn-xl" onclick="Router.navigate('login')">
              Start Earning Today <span class="btn-arrow">→</span>
            </button>
            <div class="hero-stat-inline">
              <div class="pulse-dot"></div>
              <span>₹2.4L+ paid out today</span>
            </div>
          </div>
          <div class="hero-stats animate-in" style="animation-delay:0.4s">
            <div class="hero-stat">
              <div class="hero-stat-value">₹2.4Cr+</div>
              <div class="hero-stat-label">Total Cashback Paid</div>
            </div>
            <div class="stat-divider"></div>
            <div class="hero-stat">
              <div class="hero-stat-value">10,000+</div>
              <div class="hero-stat-label">Active Investors</div>
            </div>
            <div class="stat-divider"></div>
            <div class="hero-stat">
              <div class="hero-stat-value">99.8%</div>
              <div class="hero-stat-label">On-time Payouts</div>
            </div>
          </div>
        </div>
        <!-- Floating card -->
        <div class="floating-card animate-float glass-card">
          <div class="fc-header">
            <span class="fc-icon">💸</span>
            <span class="fc-title">Live Cashback</span>
            <span class="fc-badge">LIVE</span>
          </div>
          <div class="fc-amount">+₹21.90</div>
          <div class="fc-user">Rahul S. • Growth Plan</div>
          <div class="fc-time">Just now</div>
        </div>
      </section>

      <!-- FEATURES -->
      <section class="section" id="features">
        <div class="section-header">
          <div class="section-tag">Why CashX</div>
          <h2 class="section-title">Built for <span class="gradient-text">Smart Investors</span></h2>
          <p class="section-sub">Everything you need to grow your wealth on autopilot</p>
        </div>
        <div class="features-grid">
          ${[
            ['⚡', 'Instant Activation', 'Your plan activates the moment payment is confirmed. No waiting, no delays.'],
            ['🔒', 'Bank-Grade Security', 'Row-level security, encrypted transactions, and tamper-proof cashback timers.'],
            ['📊', 'Real-time Dashboard', 'Live countdown timers, cashback logs, and portfolio analytics in one place.'],
            ['💳', 'Fast Withdrawals', 'Request withdrawals anytime. Processed within 2-4 hours via UPI.'],
            ['🔄', 'Auto-Reinvest', 'Use your wallet balance to buy more plans and compound your earnings.'],
            ['🛡️', 'Verified Payouts', 'Every cashback credit is logged, timestamped, and verifiable on your dashboard.'],
          ].map(([icon, title, desc]) => `
            <div class="feature-card glass-card hover-lift">
              <div class="feature-icon">${icon}</div>
              <h3 class="feature-title">${title}</h3>
              <p class="feature-desc">${desc}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- PRODUCTS PREVIEW -->
      <section class="section section-dark" id="products">
        <div class="section-header">
          <div class="section-tag">Investment Plans</div>
          <h2 class="section-title">Choose Your <span class="gradient-text">Growth Path</span></h2>
        </div>
        <div class="plans-grid">
          ${products.map((p, i) => {
            const totalReturn = ((p.price * p.cashback_percent / 100) * p.duration_days).toFixed(0);
            const features = Utils.parseFeatures(p.features);
            return `
            <div class="plan-card glass-card hover-lift ${i === 1 ? 'plan-featured' : ''}">
              ${i === 1 ? '<div class="plan-popular-badge">⭐ Most Popular</div>' : ''}
              <div class="plan-header">
                <h3 class="plan-name">${p.name}</h3>
                <div class="plan-price">${Utils.formatCurrency(p.price)}</div>
                <div class="plan-rate">${p.cashback_percent}% daily • ${p.duration_days} days</div>
              </div>
              <div class="plan-returns">
                <div class="plan-return-item">
                  <span>Daily Cashback</span>
                  <strong>${Utils.formatCurrency(p.price * p.cashback_percent / 100)}</strong>
                </div>
                <div class="plan-return-item">
                  <span>Total Returns</span>
                  <strong class="text-success">+${Utils.formatCurrency(totalReturn)}</strong>
                </div>
              </div>
              <ul class="plan-features">
                ${features.slice(0, 4).map(f => `<li>✓ ${f}</li>`).join('')}
              </ul>
              <button class="btn btn-primary w-full" onclick="Router.navigate('login')">Get Started</button>
            </div>`;
          }).join('')}
        </div>
        <div class="text-center" style="margin-top:2rem">
          <button class="btn btn-outline btn-lg" onclick="Router.navigate('products')">View All Plans →</button>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section class="section">
        <div class="section-header">
          <div class="section-tag">How It Works</div>
          <h2 class="section-title">Start Earning in <span class="gradient-text">3 Simple Steps</span></h2>
        </div>
        <div class="steps-container">
          ${[
            ['01', '📝', 'Create Account', 'Sign up with email or phone OTP. Verification takes under 60 seconds.'],
            ['02', '💰', 'Choose a Plan', 'Browse our investment plans and pick one that matches your goals.'],
            ['03', '🎉', 'Earn Daily', 'Your cashback is credited automatically every 24 hours to your wallet.'],
          ].map(([num, icon, title, desc]) => `
            <div class="step-card">
              <div class="step-number">${num}</div>
              <div class="step-icon">${icon}</div>
              <h3 class="step-title">${title}</h3>
              <p class="step-desc">${desc}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="section section-dark" id="testimonials">
        <div class="section-header">
          <div class="section-tag">What Investors Say</div>
          <h2 class="section-title">Trusted by <span class="gradient-text">Real People</span></h2>
        </div>
        <div class="testimonials-wrapper">
          <div class="testimonials-track" id="testimonials-track">
            ${[...testimonials, ...testimonials].map(t => `
              <div class="testimonial-card glass-card">
                <div class="testimonial-header">
                  <img src="${t.user_avatar || 'https://i.pravatar.cc/60?img=1'}" alt="${t.user_name}" class="testimonial-avatar" onerror="this.src='https://i.pravatar.cc/60'">
                  <div class="testimonial-info">
                    <div class="testimonial-name">${t.user_name} ${t.is_verified ? '<span class="verified-badge">✓</span>' : ''}</div>
                    <div class="testimonial-location">📍 ${t.user_location || 'India'}</div>
                  </div>
                  <div class="testimonial-stars">${'⭐'.repeat(t.rating || 5)}</div>
                </div>
                <p class="testimonial-text">"${t.content}"</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="section cta-section">
        <div class="cta-bg">
          <div class="orb orb-4"></div>
        </div>
        <div class="cta-content">
          <h2 class="cta-title">Ready to Start <span class="gradient-text">Earning?</span></h2>
          <p class="cta-sub">Join 10,000+ investors already earning daily cashback. No lock-in, no hidden fees.</p>
          <button class="btn btn-primary btn-xl" onclick="Router.navigate('login')">
            Create Free Account <span class="btn-arrow">→</span>
          </button>
          <div class="cta-trust">
            <span>🔒 Secure</span>
            <span>⚡ Instant Setup</span>
            <span>💸 Daily Payouts</span>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="footer">
        <div class="footer-brand">
          <div class="brand-logo small">₹</div>
          <span class="brand-name">Cash<span class="accent">X</span></span>
        </div>
        <p class="footer-text">© 2025 CashX. All rights reserved. Investment returns are subject to market conditions.</p>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Support</a>
        </div>
      </footer>
    </div>
  `;

  // Start testimonial scroll
  startTestimonialScroll();
};

window.toggleMobileMenu = function() {
  document.getElementById('mobile-menu')?.classList.toggle('open');
};

function startTestimonialScroll() {
  const track = document.getElementById('testimonials-track');
  if (!track) return;
  let pos = 0;
  const speed = 0.5;
  const half = track.scrollWidth / 2;
  ActiveTimers['testimonial'] = setInterval(() => {
    pos += speed;
    if (pos >= half) pos = 0;
    track.style.transform = `translateX(-${pos}px)`;
  }, 16);
}

// ============================================================
// LOGIN / REGISTER PAGE
// ============================================================
window.renderLogin = function() {
  if (Auth.isLoggedIn()) { Router.navigate('dashboard'); return; }
  clearAllTimers();

  document.getElementById('app').innerHTML = `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
      <div class="auth-container">
        <div class="auth-brand">
          <div class="brand-logo">₹</div>
          <span class="brand-name">Cash<span class="accent">X</span></span>
        </div>
        <div class="auth-card glass-card animate-in">
          <div class="auth-tabs">
            <button class="auth-tab active" id="tab-login" onclick="switchAuthTab('login')">Sign In</button>
            <button class="auth-tab" id="tab-register" onclick="switchAuthTab('register')">Register</button>
          </div>
          <div class="auth-method-toggle">
            <button class="method-btn active" id="method-email" onclick="switchAuthMethod('email')">📧 Email</button>
            <button class="method-btn" id="method-phone" onclick="switchAuthMethod('phone')">📱 Phone OTP</button>
          </div>

          <!-- EMAIL FORMS -->
          <div id="email-forms">
            <div id="login-form">
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" id="login-email" placeholder="you@example.com" autocomplete="email">
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" id="login-password" placeholder="••••••••" autocomplete="current-password">
              </div>
              <button class="btn btn-primary w-full btn-lg" id="login-btn" onclick="handleEmailLogin()">
                Sign In <span class="btn-arrow">→</span>
              </button>
            </div>
            <div id="register-form" style="display:none">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="reg-name" placeholder="Your full name">
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" id="reg-email" placeholder="you@example.com">
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" id="reg-password" placeholder="Min 8 characters">
              </div>
              <button class="btn btn-primary w-full btn-lg" id="register-btn" onclick="handleEmailRegister()">
                Create Account <span class="btn-arrow">→</span>
              </button>
            </div>
          </div>

          <!-- PHONE FORMS -->
          <div id="phone-forms" style="display:none">
            <div id="phone-input-step">
              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <div class="phone-input-group">
                  <span class="phone-prefix">🇮🇳 +91</span>
                  <input type="tel" class="form-input phone-input" id="phone-number" placeholder="9876543210" maxlength="10">
                </div>
              </div>
              <button class="btn btn-primary w-full btn-lg" id="otp-send-btn" onclick="handleSendOTP()">
                Send OTP <span class="btn-arrow">→</span>
              </button>
            </div>
            <div id="otp-verify-step" style="display:none">
              <div class="otp-sent-msg">
                <span>✓</span> OTP sent to <strong id="otp-phone-display"></strong>
                <button onclick="document.getElementById('phone-input-step').style.display='block';document.getElementById('otp-verify-step').style.display='none'" class="link-btn">Change</button>
              </div>
              <div class="form-group">
                <label class="form-label">Enter 6-digit OTP</label>
                <input type="text" class="form-input otp-input" id="otp-code" placeholder="• • • • • •" maxlength="6" inputmode="numeric">
              </div>
              <button class="btn btn-primary w-full btn-lg" id="otp-verify-btn" onclick="handleVerifyOTP()">
                Verify & Continue <span class="btn-arrow">→</span>
              </button>
              <div class="otp-resend" id="otp-resend">
                <span id="resend-timer">Resend in <strong id="countdown">30</strong>s</span>
                <button id="resend-btn" onclick="handleSendOTP()" class="link-btn" style="display:none">Resend OTP</button>
              </div>
            </div>
          </div>

          <div class="auth-divider">
            <span>Secure • Encrypted • Trusted</span>
          </div>
          <div class="auth-trust">
            <span>🔒 Bank-grade security</span>
            <span>⚡ Instant login</span>
          </div>
        </div>
        <p class="auth-back">
          <a href="#" onclick="Router.navigate('landing')" class="link-btn">← Back to Home</a>
        </p>
      </div>
    </div>
  `;
};

window.switchAuthTab = function(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
};

window.switchAuthMethod = function(method) {
  document.getElementById('method-email').classList.toggle('active', method === 'email');
  document.getElementById('method-phone').classList.toggle('active', method === 'phone');
  document.getElementById('email-forms').style.display = method === 'email' ? 'block' : 'none';
  document.getElementById('phone-forms').style.display = method === 'phone' ? 'block' : 'none';
};

window.handleEmailLogin = async function() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) { Toast.show('Please fill all fields', 'warning'); return; }
  const btn = document.getElementById('login-btn');
  btn.disabled = true; btn.textContent = 'Signing in...';
  const { error } = await Auth.signInEmail(email, password);
  if (error) { Toast.show(error.message, 'error'); btn.disabled = false; btn.innerHTML = 'Sign In <span class="btn-arrow">→</span>'; }
  else { Toast.show('Welcome back! 🎉', 'success'); Router.navigate('dashboard'); }
};

window.handleEmailRegister = async function() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  if (!name || !email || !password) { Toast.show('Please fill all fields', 'warning'); return; }
  if (password.length < 8) { Toast.show('Password must be at least 8 characters', 'warning'); return; }
  const btn = document.getElementById('register-btn');
  btn.disabled = true; btn.textContent = 'Creating account...';
  const { error } = await Auth.signUpEmail(email, password, name);
  if (error) { Toast.show(error.message, 'error'); btn.disabled = false; btn.innerHTML = 'Create Account <span class="btn-arrow">→</span>'; }
  else { Toast.show('Account created! Check your email to verify. 🎉', 'success'); switchAuthTab('login'); }
};

let otpPhone = '';
window.handleSendOTP = async function() {
  const phone = document.getElementById('phone-number').value.trim();
  if (!/^\d{10}$/.test(phone)) { Toast.show('Enter a valid 10-digit phone number', 'warning'); return; }
  otpPhone = phone;
  const btn = document.getElementById('otp-send-btn');
  btn.disabled = true; btn.textContent = 'Sending...';
  const { error } = await Auth.sendOTP(phone);
  if (error) { Toast.show(error.message, 'error'); btn.disabled = false; btn.innerHTML = 'Send OTP <span class="btn-arrow">→</span>'; return; }
  document.getElementById('phone-input-step').style.display = 'none';
  document.getElementById('otp-verify-step').style.display = 'block';
  document.getElementById('otp-phone-display').textContent = `+91 ${phone}`;
  Toast.show('OTP sent successfully!', 'success');
  startOTPCountdown();
};

function startOTPCountdown() {
  let seconds = 30;
  const timer = document.getElementById('countdown');
  const resendBtn = document.getElementById('resend-btn');
  const resendTimer = document.getElementById('resend-timer');
  ActiveTimers['otp'] = setInterval(() => {
    seconds--;
    if (timer) timer.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(ActiveTimers['otp']);
      if (resendTimer) resendTimer.style.display = 'none';
      if (resendBtn) resendBtn.style.display = 'inline';
    }
  }, 1000);
}

window.handleVerifyOTP = async function() {
  const otp = document.getElementById('otp-code').value.trim();
  if (!otp || otp.length < 6) { Toast.show('Enter the 6-digit OTP', 'warning'); return; }
  const btn = document.getElementById('otp-verify-btn');
  btn.disabled = true; btn.textContent = 'Verifying...';
  const { error } = await Auth.verifyOTP(otpPhone, otp);
  if (error) { Toast.show(error.message, 'error'); btn.disabled = false; btn.innerHTML = 'Verify & Continue <span class="btn-arrow">→</span>'; }
  else { Toast.show('Verified! Welcome to CashX 🎉', 'success'); Router.navigate('dashboard'); }
};

// ============================================================
// USER DASHBOARD
// ============================================================
window.renderDashboard = async function() {
  clearAllTimers();
  const profile = Auth.currentProfile;
  const [{ data: orders }, transactions] = await Promise.all([
    DB.getOrders(),
    DB.getWalletTransactions(5)
  ]);

  const activeOrders = orders.filter(o => o.status === 'active');
  const todayCashback = activeOrders.reduce((s, o) => s + parseFloat(o.cashback_per_day || 0), 0);

  document.getElementById('app').innerHTML = `
    <div class="dashboard-layout">
      ${renderSidebar('dashboard')}
      <div class="main-content">
        ${renderTopBar()}
        <div class="page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Welcome back, ${profile?.full_name?.split(' ')[0] || 'Investor'} 👋</h1>
              <p class="page-sub">Here's your portfolio overview</p>
            </div>
          </div>

          <!-- STATS GRID -->
          <div class="stats-grid">
            <div class="stat-card glass-card animate-in">
              <div class="stat-icon wallet-icon">💰</div>
              <div class="stat-info">
                <div class="stat-label">Wallet Balance</div>
                <div class="stat-value">${Utils.formatCurrency(profile?.wallet_balance)}</div>
                <div class="stat-change text-success">Available to withdraw</div>
              </div>
            </div>
            <div class="stat-card glass-card animate-in" style="animation-delay:0.1s">
              <div class="stat-icon invest-icon">📈</div>
              <div class="stat-info">
                <div class="stat-label">Total Invested</div>
                <div class="stat-value">${Utils.formatCurrency(profile?.total_invested)}</div>
                <div class="stat-change">${orders.length} orders total</div>
              </div>
            </div>
            <div class="stat-card glass-card animate-in" style="animation-delay:0.2s">
              <div class="stat-icon cashback-icon">💸</div>
              <div class="stat-info">
                <div class="stat-label">Total Cashback</div>
                <div class="stat-value">${Utils.formatCurrency(profile?.total_cashback_earned)}</div>
                <div class="stat-change text-success">All time earnings</div>
              </div>
            </div>
            <div class="stat-card glass-card animate-in" style="animation-delay:0.3s">
              <div class="stat-icon today-icon">⚡</div>
              <div class="stat-info">
                <div class="stat-label">Today's Cashback</div>
                <div class="stat-value text-success">${Utils.formatCurrency(todayCashback)}</div>
                <div class="stat-change">${activeOrders.length} active plans</div>
              </div>
            </div>
          </div>

          <!-- ACTIVE ORDERS -->
          ${activeOrders.length > 0 ? `
          <div class="section-card glass-card animate-in" style="animation-delay:0.4s">
            <div class="card-header">
              <h2 class="card-title">Active Plans</h2>
              <button class="btn btn-outline btn-sm" onclick="Router.navigate('orders')">View All</button>
            </div>
            <div class="active-orders-list" id="active-orders-list">
              ${activeOrders.slice(0,3).map(o => renderOrderCard(o)).join('')}
            </div>
          </div>` : `
          <div class="empty-state glass-card animate-in">
            <div class="empty-icon">📦</div>
            <h3>No active investments</h3>
            <p>Start your first investment plan to begin earning daily cashback</p>
            <button class="btn btn-primary" onclick="Router.navigate('products')">Browse Plans →</button>
          </div>`}

          <!-- RECENT TRANSACTIONS -->
          <div class="section-card glass-card animate-in" style="animation-delay:0.5s">
            <div class="card-header">
              <h2 class="card-title">Recent Transactions</h2>
              <button class="btn btn-outline btn-sm" onclick="Router.navigate('wallet')">View All</button>
            </div>
            ${transactions.length > 0 ? `
            <div class="transactions-list">
              ${transactions.map(t => `
                <div class="transaction-item">
                  <div class="tx-icon tx-${t.type}">${{cashback:'💸',withdrawal:'📤',reinvest:'🔄',refund:'↩️',bonus:'🎁',debit:'📤'}[t.type] || '💳'}</div>
                  <div class="tx-info">
                    <div class="tx-desc">${t.description || t.type}</div>
                    <div class="tx-time">${Utils.timeAgo(t.created_at)}</div>
                  </div>
                  <div class="tx-amount ${['cashback','refund','bonus'].includes(t.type) ? 'text-success' : 'text-danger'}">
                    ${['cashback','refund','bonus'].includes(t.type) ? '+' : '-'}${Utils.formatCurrency(t.amount)}
                  </div>
                </div>
              `).join('')}
            </div>` : `<p class="empty-text">No transactions yet</p>`}
          </div>

          <!-- QUICK ACTIONS -->
          <div class="quick-actions glass-card animate-in">
            <div class="card-header"><h2 class="card-title">Quick Actions</h2></div>
            <div class="qa-grid">
              <button class="qa-btn" onclick="Router.navigate('products')"><span>🛍️</span>Buy Plan</button>
              <button class="qa-btn" onclick="Router.navigate('wallet')"><span>💰</span>Wallet</button>
              <button class="qa-btn" onclick="Router.navigate('withdrawals')"><span>📤</span>Withdraw</button>
              <button class="qa-btn" onclick="Router.navigate('orders')"><span>📋</span>Orders</button>
            </div>
          </div>
        </div>
      </div>
      ${renderMobileNav('dashboard')}
    </div>
  `;

  // Start countdown timers
  activeOrders.forEach(o => {
    if (o.next_cashback_at) startOrderTimer(o.id, o.next_cashback_at);
  });
};

function renderOrderCard(order) {
  const progress = order.duration_days > 0 ? (order.cashback_days_credited / order.duration_days) * 100 : 0;
  const snap = order.product_snapshot || {};
  return `
    <div class="order-card glass-card-inner" onclick="openOrderDetail('${order.id}')">
      <div class="order-card-header">
        <div class="order-name">${snap.name || 'Investment Plan'}</div>
        ${Utils.statusBadge(order.status)}
      </div>
      <div class="order-details">
        <div class="order-detail">
          <span>Invested</span>
          <strong>${Utils.formatCurrency(order.amount)}</strong>
        </div>
        <div class="order-detail">
          <span>Daily Cashback</span>
          <strong class="text-success">+${Utils.formatCurrency(order.cashback_per_day)}</strong>
        </div>
        <div class="order-detail">
          <span>Earned So Far</span>
          <strong>${Utils.formatCurrency(order.cashback_earned)}</strong>
        </div>
        <div class="order-detail">
          <span>Days: ${order.cashback_days_credited}/${order.duration_days}</span>
          <strong>Next cashback</strong>
        </div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${progress}%"></div>
      </div>
      <div class="order-timer" id="timer-${order.id}">
        <span class="timer-label">Next cashback in:</span>
        <span class="timer-value" id="timer-val-${order.id}">Loading...</span>
      </div>
    </div>
  `;
}

function startOrderTimer(orderId, nextCashbackAt) {
  const update = () => {
    const el = document.getElementById(`timer-val-${orderId}`);
    if (!el) { clearInterval(ActiveTimers[`timer-${orderId}`]); return; }
    const { hours, minutes, seconds, total } = Utils.countdown(nextCashbackAt);
    if (total <= 0) { el.textContent = 'Processing...'; el.style.color = '#22c55e'; return; }
    el.textContent = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  };
  update();
  ActiveTimers[`timer-${orderId}`] = setInterval(update, 1000);
}

// ============================================================
// ORDER DETAIL MODAL
// ============================================================
window.openOrderDetail = async function(orderId) {
  const { data: orders } = await DB.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  const logs = await DB.getCashbackLogs(orderId);
  const snap = order.product_snapshot || {};
  const progress = order.duration_days > 0 ? (order.cashback_days_credited / order.duration_days) * 100 : 0;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;
  const totalCashback = order.cashback_per_day * order.duration_days;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'order-modal';
  modal.innerHTML = `
    <div class="modal glass-card">
      <div class="modal-header">
        <h2 class="modal-title">Order Details</h2>
        <button class="modal-close" onclick="document.getElementById('order-modal').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="order-modal-grid">
          <div class="order-modal-left">
            <div class="progress-ring-container">
              <svg width="120" height="120" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" stroke-width="8"/>
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#ringGradient)" stroke-width="8"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
                  stroke-linecap="round" transform="rotate(-90 50 50)"/>
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#6366f1"/>
                    <stop offset="100%" stop-color="#22d3ee"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="ring-label">
                <div class="ring-percent">${Math.round(progress)}%</div>
                <div class="ring-sub">Complete</div>
              </div>
            </div>
            <div class="order-modal-info">
              <h3>${snap.name || 'Plan'}</h3>
              <div class="info-grid">
                <div class="info-row"><span>Amount</span><strong>${Utils.formatCurrency(order.amount)}</strong></div>
                <div class="info-row"><span>Daily Rate</span><strong>${order.cashback_percent}%</strong></div>
                <div class="info-row"><span>Daily Cashback</span><strong class="text-success">+${Utils.formatCurrency(order.cashback_per_day)}</strong></div>
                <div class="info-row"><span>Days Credited</span><strong>${order.cashback_days_credited}/${order.duration_days}</strong></div>
                <div class="info-row"><span>Earned So Far</span><strong class="text-success">${Utils.formatCurrency(order.cashback_earned)}</strong></div>
                <div class="info-row"><span>Remaining</span><strong>${Utils.formatCurrency(totalCashback - order.cashback_earned)}</strong></div>
                <div class="info-row"><span>Status</span><strong>${Utils.statusBadge(order.status)}</strong></div>
                <div class="info-row"><span>Started</span><strong>${Utils.formatDate(order.started_at)}</strong></div>
                <div class="info-row"><span>Ends</span><strong>${Utils.formatDate(order.ends_at)}</strong></div>
              </div>
            </div>
          </div>

          <div class="order-modal-right">
            ${order.status === 'active' && order.next_cashback_at ? `
            <div class="countdown-container glass-card-inner">
              <div class="countdown-label">⏰ Next Cashback In</div>
              <div class="countdown-display" id="modal-timer-display">
                <div class="countdown-unit">
                  <div class="countdown-val" id="m-hours">00</div>
                  <div class="countdown-unit-label">Hours</div>
                </div>
                <div class="countdown-colon">:</div>
                <div class="countdown-unit">
                  <div class="countdown-val" id="m-mins">00</div>
                  <div class="countdown-unit-label">Mins</div>
                </div>
                <div class="countdown-colon">:</div>
                <div class="countdown-unit">
                  <div class="countdown-val" id="m-secs">00</div>
                  <div class="countdown-unit-label">Secs</div>
                </div>
              </div>
              <div class="countdown-amount">+${Utils.formatCurrency(order.cashback_per_day)} incoming</div>
            </div>` : ''}

            <div class="cashback-log-section">
              <h4 class="log-title">Cashback History</h4>
              <div class="log-list">
                ${logs.length > 0
                  ? logs.slice(-10).reverse().map(l => `
                    <div class="log-item">
                      <span class="log-day">Day ${l.day_number}</span>
                      <span class="log-amount text-success">+${Utils.formatCurrency(l.amount)}</span>
                      <span class="log-date">${Utils.formatDate(l.credited_at)}</span>
                    </div>
                  `).join('')
                  : '<p class="empty-text">No cashback credited yet</p>'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Start modal timer
  if (order.status === 'active' && order.next_cashback_at) {
    const updateTimer = () => {
      const { hours, minutes, seconds } = Utils.countdown(order.next_cashback_at);
      document.getElementById('m-hours').textContent = String(hours).padStart(2,'0');
      document.getElementById('m-mins').textContent = String(minutes).padStart(2,'0');
      document.getElementById('m-secs').textContent = String(seconds).padStart(2,'0');
    };
    updateTimer();
    ActiveTimers['modal-timer'] = setInterval(updateTimer, 1000);
  }

  modal.addEventListener('click', e => { if (e.target === modal) { modal.remove(); clearInterval(ActiveTimers['modal-timer']); } });
};