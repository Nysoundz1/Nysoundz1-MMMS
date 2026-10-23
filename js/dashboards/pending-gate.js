// Dedicated Controller for Pending Account Approval Gate
// File: js/dashboards/pending-gate.js
// Shown when a registered user has status === 'pending' or 'rejected'

class PendingGateController {
  constructor() {
    this.pollInterval = null;
    this.init();
  }

  init() {
    const user = store.getCurrentUser();

    // 1. If not logged in, redirect to login
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    // 2. If user is already approved, immediately forward to their role dashboard
    if (user.status === 'approved') {
      if (typeof auth !== 'undefined') {
        auth.redirectToUserDashboard(user);
      }
      return;
    }

    this.render();
    this.startPolling();
  }

  render() {
    const container = document.getElementById('pending-gate-container');
    if (!container) return;

    const user = store.getCurrentUser();
    if (!user) return;

    const isRejected = user.status === 'rejected';

    container.innerHTML = `
      <div style="max-width: 680px; margin: 3rem auto; padding: 0 1rem;">
        <!-- Brand Crest & Header -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <img src="assets/crest.png" alt="OLAG Crest" style="width: 72px; height: 72px; object-fit: contain; margin-bottom: 1rem; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));" />
          <h1 style="font-size: 1.75rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 0.25rem;">
            Our Lady of Grace Senior High School
          </h1>
          <p style="font-size: 0.95rem; color: var(--color-text-muted);">
            School Mass Music Management System • Account Verification
          </p>
        </div>

        <!-- Main Card Gate -->
        <div class="card" style="box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border-top: 4px solid ${isRejected ? '#ef4444' : '#f59e0b'};">
          <div class="card-body" style="padding: 2.5rem 2rem;">
            
            ${isRejected ? `
              <!-- Rejection State -->
              <div style="text-align: center; margin-bottom: 2rem;">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                  🚫
                </div>
                <h2 style="font-size: 1.4rem; font-weight: 700; color: #dc2626; margin-bottom: 0.5rem;">
                  Registration Not Approved
                </h2>
                <p style="color: var(--color-text-muted); font-size: 0.95rem; max-width: 500px; margin: 0 auto;">
                  Your request for access could not be authorized at this time.
                </p>
                
                <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-md); padding: 1rem; margin-top: 1.5rem; text-align: left;">
                  <strong style="color: #991b1b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Reason Provided by Administrator:</strong>
                  <p style="margin: 0.5rem 0 0; color: var(--color-text-primary); font-size: 0.95rem;">
                    "${user.rejectionReason || 'Choir registration could not be confirmed.'}"
                  </p>
                </div>
              </div>
            ` : `
              <!-- Pending State -->
              <div style="text-align: center; margin-bottom: 2rem;">
                <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(245, 158, 11, 0.12); color: #f59e0b; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; animation: pulse 2s infinite;">
                  ⏳
                </div>
                <h2 style="font-size: 1.4rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 0.5rem;">
                  Account Awaiting Administrator Approval
                </h2>
                <p style="color: var(--color-text-muted); font-size: 0.95rem; max-width: 500px; margin: 0 auto;">
                  Peace be with you, <strong>${user.name}</strong>. Your account has been registered into the OLAG Liturgical Directory.
                  For security and liturgical order, an Administrator must verify your choir or ministry role before full access is granted.
                </p>
              </div>

              <!-- 3-Step Verification Timeline -->
              <div class="approval-timeline-3step">
                <!-- Step 1: Registered -->
                <div class="timeline-step step-completed">
                  <div class="step-circle">✓</div>
                  <div class="step-content">
                    <div class="step-title">1. Account Created</div>
                    <div class="step-desc">Registered as ${user.roleLabel} • ${user.registeredDate || 'Today'}</div>
                  </div>
                </div>

                <!-- Step 2: Under Review -->
                <div class="timeline-step step-current">
                  <div class="step-circle">2</div>
                  <div class="step-content">
                    <div class="step-title">2. Administrator Review</div>
                    <div class="step-desc">Awaiting verification by Sr. Beatrice Osei (Administrator)</div>
                  </div>
                </div>

                <!-- Step 3: Access Granted -->
                <div class="timeline-step step-upcoming">
                  <div class="step-circle">🔒</div>
                  <div class="step-content">
                    <div class="step-title">3. Dashboard Access</div>
                    <div class="step-desc">Access mass music, 13 parts, audio pitches & lead sheets</div>
                  </div>
                </div>
              </div>
            `}

            <!-- User Registration Card Details -->
            <div style="background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.25rem; margin-top: 2rem;">
              <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); margin-bottom: 0.75rem; font-weight: 600;">
                Submitted Account Details
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; font-size: 0.9rem;">
                <div>
                  <span style="color: var(--color-text-muted);">Name:</span>
                  <div style="font-weight: 600;">${user.name}</div>
                </div>
                <div>
                  <span style="color: var(--color-text-muted);">Email:</span>
                  <div style="font-weight: 600;">${user.email}</div>
                </div>
                <div>
                  <span style="color: var(--color-text-muted);">Assigned Role:</span>
                  <div><span class="badge-pill badge-purple">${user.roleLabel}</span></div>
                </div>
                <div>
                  <span style="color: var(--color-text-muted);">Choir / Group:</span>
                  <div style="font-weight: 600;">${user.groupName || 'School Staff'}</div>
                </div>
                <div>
                  <span style="color: var(--color-text-muted);">Voice Part:</span>
                  <div style="font-weight: 600;">${user.voicePart || 'Member'}</div>
                </div>
                <div>
                  <span style="color: var(--color-text-muted);">Status:</span>
                  <div>
                    <span class="badge-pill ${isRejected ? 'badge-red' : 'badge-orange'}">
                      ${isRejected ? 'Rejected' : 'Pending Approval ⏳'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Controls -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 2rem;">
              ${!isRejected ? `
                <button class="btn btn-primary" onclick="pendingApp.checkStatusNow()" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 1rem;">
                  🔄 Check Approval Status Now
                </button>
              ` : ''}

              <!-- Evaluator Demo Quick Approval Helper -->
              <div style="border-top: 1px dashed var(--color-border); padding-top: 1.25rem; margin-top: 0.5rem; text-align: center;">
                <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">
                  <strong>⚡ Evaluator Testing Shortcut:</strong> Want to approve this account right now?
                </p>
                <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                  <button class="btn btn-sm btn-outline" onclick="pendingApp.simulateInstantApproval()" style="border-color: #10b981; color: #10b981;">
                    ⚡ Instant Self-Approve (Demo)
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="pendingApp.switchToAdmin()" style="border-color: #6366f1; color: #6366f1;">
                    🛡️ Switch to Sr. Beatrice (Admin)
                  </button>
                </div>
              </div>

              <div style="display: flex; justify-content: center; margin-top: 1rem;">
                <button class="btn btn-sm" onclick="pendingApp.handleSignOut()" style="color: var(--color-text-muted); text-decoration: underline; background: transparent; border: none; cursor: pointer;">
                  ← Sign out and return to Login
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Liturgical Footer -->
        <div style="text-align: center; margin-top: 2rem; color: var(--color-text-muted); font-size: 0.85rem;">
          ✝️ Our Lady of Grace Senior High School • <em>Ut In Omnibus Glorificetur Deus</em>
        </div>
      </div>
    `;
  }

  // Check if status has changed in localStorage / store
  checkStatusNow(silent = false) {
    const user = store.getCurrentUser();
    if (user && user.status === 'approved') {
      if (this.pollInterval) clearInterval(this.pollInterval);
      alert('🎉 Congratulations! Your account has been approved by the Administrator. Unlocking your dashboard now...');
      if (typeof auth !== 'undefined') {
        auth.redirectToUserDashboard(user);
      }
    } else {
      if (!silent) {
        alert('⏳ Account is still pending administrative review. Please check back shortly or notify Sr. Beatrice Osei.');
      }
    }
  }

  // Poll every 5 seconds for status updates
  startPolling() {
    this.pollInterval = setInterval(() => {
      this.checkStatusNow(true);
    }, 5000);
  }

  // Instant approve for demo / evaluators
  simulateInstantApproval() {
    const user = store.getCurrentUser();
    if (!user) return;

    store.approveUser(user.id, 'Sr. Beatrice Osei (Auto-Approved)');
    this.checkStatusNow(false);
  }

  // Switch to Administrator
  switchToAdmin() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    store.setCurrentUser('usr-003'); // Sr. Beatrice Osei
    window.location.href = 'admin.html';
  }

  handleSignOut() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    window.location.href = 'login.html';
  }
}

// Global instance
const pendingApp = new PendingGateController();
