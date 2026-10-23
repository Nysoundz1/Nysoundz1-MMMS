// Dedicated Dashboard Controller for Administrator & User Approvals
// File: js/dashboards/admin-dashboard.js
// Persona: Sr. Beatrice Osei (System Administrator & Head of Liturgical Operations)

class AdminDashboardController {
  constructor() {
    this.activeFilter = 'pending'; // 'pending' | 'approved' | 'all' | 'rejected'
    this.searchQuery = '';
    this.init();
  }

  init() {
    // Access Guard: Enforce individual Admin role
    if (typeof auth !== 'undefined') {
      const allowed = auth.requireAuth(['admin']);
      if (!allowed) return;
    }

    this.render();
    if (typeof auth !== 'undefined') {
      auth.renderPageHeader();
    }
  }

  render() {
    const container = document.getElementById('admin-dashboard-container');
    if (!container) return;

    const users = store.getUsers();
    const pendingUsers = users.filter(u => u.status === 'pending');
    const approvedUsers = users.filter(u => u.status === 'approved');
    const rejectedUsers = users.filter(u => u.status === 'rejected');

    const totalUsers = users.length;
    const pendingCount = pendingUsers.length;
    const approvedCount = approvedUsers.length;

    // Filter users list based on active tab and search
    let filteredUsers = users;
    if (this.activeFilter === 'pending') {
      filteredUsers = pendingUsers;
    } else if (this.activeFilter === 'approved') {
      filteredUsers = approvedUsers;
    } else if (this.activeFilter === 'rejected') {
      filteredUsers = rejectedUsers;
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roleLabel.toLowerCase().includes(q) ||
        (u.groupName && u.groupName.toLowerCase().includes(q))
      );
    }

    container.innerHTML = `
      <!-- Role Quick Ribbon -->
      <div class="role-quick-ribbon">
        <div class="quick-ribbon-title">
          <span>🛡️</span> <span>Admin Access Gate & Governance</span>
        </div>
        <div class="quick-ribbon-actions">
          <button class="quick-action-chip chip-primary" onclick="adminApp.batchApproveAll()">
            ⚡ Batch Approve All Pending (${pendingCount})
          </button>
          <button class="quick-action-chip chip-green" onclick="adminApp.openNewUserModal()">
            ➕ Add / Enroll User
          </button>
          <button class="quick-action-chip" onclick="adminApp.filterBy('pending')">
            ⏳ Pending Queue (${pendingCount})
          </button>
          <button class="quick-action-chip" onclick="adminApp.filterBy('approved')">
            ✅ Approved (${approvedCount})
          </button>
          <button class="quick-action-chip" onclick="adminApp.resetDatabaseState()">
            🔄 Reset Demo DB
          </button>
        </div>
      </div>

      <!-- Admin Identity Hero Banner -->
      <div class="role-hero-banner" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
        <div class="role-hero-content">
          <div class="role-hero-badge" style="background: rgba(234, 179, 8, 0.2); color: #fbbf24; border: 1px solid rgba(234, 179, 8, 0.4);">
            🛡️ Administrative Authority • User Access Gatekeeper
          </div>
          <h1 class="role-hero-title">User Approvals & Role Authorization</h1>
          <p class="role-hero-subtitle">
            Every user who registers for OLAG SMMMS is placed in a strict pending holding state. As Administrator, you must inspect their identity, role, and choir assignment before granting active access to mass music, liturgy, and rehearsal scores.
          </p>
          <div class="role-hero-meta">
            <span>👤 Logged in as: <strong>Sr. Beatrice Osei</strong> (Liturgical Administrator)</span>
            <span>🏛️ School: <strong>Our Lady of Grace Senior High (OLAG)</strong></span>
            <span>🛡️ Gate Policy: <strong>Individual Admin Approval Enforced</strong></span>
          </div>
        </div>
      </div>

      <!-- Quick Triage Metric Stat Cards -->
      <div class="stats-grid" style="margin-top: 1.5rem;">
        <div class="stat-card" style="border-top: 4px solid #f59e0b; cursor: pointer;" onclick="adminApp.filterBy('pending')">
          <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">⏳</div>
          <div class="stat-info">
            <span class="stat-value" style="color: #f59e0b;">${pendingCount}</span>
            <span class="stat-label">Pending Approval Requests</span>
          </div>
        </div>

        <div class="stat-card" style="border-top: 4px solid #10b981; cursor: pointer;" onclick="adminApp.filterBy('approved')">
          <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">✅</div>
          <div class="stat-info">
            <span class="stat-value" style="color: #10b981;">${approvedCount}</span>
            <span class="stat-label">Active Approved Users</span>
          </div>
        </div>

        <div class="stat-card" style="border-top: 4px solid #6366f1; cursor: pointer;" onclick="adminApp.filterBy('all')">
          <div class="stat-icon" style="background: rgba(99, 102, 241, 0.15); color: #6366f1;">👥</div>
          <div class="stat-info">
            <span class="stat-value">${totalUsers}</span>
            <span class="stat-label">Total Registered Accounts</span>
          </div>
        </div>

        <div class="stat-card" style="border-top: 4px solid #ef4444; cursor: pointer;" onclick="adminApp.filterBy('rejected')">
          <div class="stat-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">🚫</div>
          <div class="stat-info">
            <span class="stat-value" style="color: #ef4444;">${rejectedUsers.length}</span>
            <span class="stat-label">Rejected / Revoked Accounts</span>
          </div>
        </div>
      </div>

      ${pendingCount > 0 ? `
        <!-- High Priority Pending Alert Banner -->
        <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%); border: 1.5px solid #f59e0b; border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="font-size: 2rem;">🔔</div>
            <div>
              <h3 style="margin: 0; color: #b45309; font-weight: 700;">Action Required: ${pendingCount} User${pendingCount > 1 ? 's' : ''} Awaiting Access Approval</h3>
              <p style="margin: 0.25rem 0 0 0; color: var(--color-text-muted); font-size: 0.9rem;">
                These accounts cannot view liturgical schedules, hymn parts, or rehearsals until you approve them individually.
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-primary" onclick="adminApp.batchApproveAll()" style="background: #d97706; border-color: #d97706;">
              ⚡ Approve All (${pendingCount})
            </button>
          </div>
        </div>
      ` : `
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-lg); padding: 1rem 1.5rem; margin-top: 1.5rem; display: flex; align-items: center; gap: 1rem;">
          <div style="font-size: 1.5rem;">🎉</div>
          <div>
            <strong style="color: #065f46;">All user approvals are up to date!</strong>
            <p style="margin: 0.15rem 0 0; font-size: 0.85rem; color: var(--color-text-muted);">No pending registration requests in queue.</p>
          </div>
        </div>
      `}

      <!-- User Directory & Approvals Table Section -->
      <div class="card" style="margin-top: 2rem;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 class="card-title">User Roster & Access Controls</h2>
            <p class="card-subtitle">Manage system credentials, approve new users, or revoke authorization</p>
          </div>

          <!-- Controls: Filter Pills & Search Input -->
          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <div class="filter-pills" style="margin-bottom: 0;">
              <button class="filter-pill ${this.activeFilter === 'pending' ? 'active' : ''}" onclick="adminApp.filterBy('pending')">
                Pending (${pendingCount})
              </button>
              <button class="filter-pill ${this.activeFilter === 'approved' ? 'active' : ''}" onclick="adminApp.filterBy('approved')">
                Approved (${approvedCount})
              </button>
              <button class="filter-pill ${this.activeFilter === 'rejected' ? 'active' : ''}" onclick="adminApp.filterBy('rejected')">
                Rejected (${rejectedUsers.length})
              </button>
              <button class="filter-pill ${this.activeFilter === 'all' ? 'active' : ''}" onclick="adminApp.filterBy('all')">
                All (${totalUsers})
              </button>
            </div>

            <div style="position: relative;">
              <input type="text"
                placeholder="🔍 Search name, role, email..."
                value="${this.searchQuery}"
                oninput="adminApp.handleSearch(this.value)"
                style="padding: 0.5rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); font-size: 0.875rem; width: 220px;"
              />
            </div>

            <button class="btn btn-outline btn-sm" onclick="adminApp.openNewUserModal()">
              ➕ Add User
            </button>
          </div>
        </div>

        <div class="card-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="data-table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: var(--color-bg-secondary); border-bottom: 2px solid var(--color-border);">
                  <th style="padding: 0.85rem 1.25rem; text-align: left; font-size: 0.8rem; text-transform: uppercase;">User Profile</th>
                  <th style="padding: 0.85rem 1rem; text-align: left; font-size: 0.8rem; text-transform: uppercase;">Role & Permissions</th>
                  <th style="padding: 0.85rem 1rem; text-align: left; font-size: 0.8rem; text-transform: uppercase;">Group / Choir</th>
                  <th style="padding: 0.85rem 1rem; text-align: left; font-size: 0.8rem; text-transform: uppercase;">Access Status</th>
                  <th style="padding: 0.85rem 1rem; text-align: left; font-size: 0.8rem; text-transform: uppercase;">Registered / Approved</th>
                  <th style="padding: 0.85rem 1.25rem; text-align: right; font-size: 0.8rem; text-transform: uppercase;">Admin Action</th>
                </tr>
              </thead>
              <tbody>
                ${filteredUsers.length === 0 ? `
                  <tr>
                    <td colspan="6" style="padding: 3rem; text-align: center; color: var(--color-text-muted);">
                      <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
                      <p style="font-size: 1rem; font-weight: 500;">No users match the selected filter.</p>
                      <button class="btn btn-sm btn-outline" onclick="adminApp.filterBy('all')" style="margin-top: 0.5rem;">View All Users</button>
                    </td>
                  </tr>
                ` : filteredUsers.map(u => `
                  <tr style="border-bottom: 1px solid var(--color-border); transition: background 0.15s;" onmouseover="this.style.background='var(--color-bg-secondary)'" onmouseout="this.style.background='transparent'">
                    <!-- User Profile -->
                    <td style="padding: 1rem 1.25rem;">
                      <div style="display: flex; align-items: center; gap: 0.85rem;">
                        <img src="${u.avatar || 'assets/avatar.jpg'}" alt="${u.name}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-border);" />
                        <div>
                          <div style="font-weight: 600; color: var(--color-text-primary);">${u.name}</div>
                          <div style="font-size: 0.8rem; color: var(--color-text-muted);">${u.email}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Role & Permissions -->
                    <td style="padding: 1rem;">
                      <span class="badge-pill ${
                        u.role === 'chaplain' ? 'badge-purple' :
                        u.role === 'coordinator' ? 'badge-blue' :
                        u.role === 'admin' ? 'badge-orange' : 'badge-gold'
                      }">
                        ${u.role === 'chaplain' ? '✝️ Chaplain' :
                          u.role === 'coordinator' ? '🎼 Coordinator' :
                          u.role === 'admin' ? '🛡️ Administrator' : '🎵 Chorister'}
                      </span>
                      <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">
                        ${u.roleLabel}
                      </div>
                    </td>

                    <!-- Group / Choir -->
                    <td style="padding: 1rem;">
                      <div style="font-weight: 500; font-size: 0.875rem;">${u.groupName || 'Staff'}</div>
                      <div style="font-size: 0.75rem; color: var(--color-text-muted);">
                        Voice: <span class="badge-pill" style="font-size: 0.7rem; padding: 2px 6px;">${u.voicePart || 'General'}</span>
                      </div>
                    </td>

                    <!-- Status -->
                    <td style="padding: 1rem;">
                      ${u.status === 'approved' ? `
                        <span class="badge-pill badge-green" style="display: inline-flex; align-items: center; gap: 4px;">
                          <span>●</span> Approved Active
                        </span>
                      ` : u.status === 'pending' ? `
                        <span class="badge-pill badge-orange" style="display: inline-flex; align-items: center; gap: 4px; animation: pulse 2s infinite;">
                          <span>⏳</span> Pending Review
                        </span>
                      ` : `
                        <span class="badge-pill badge-red" style="display: inline-flex; align-items: center; gap: 4px;">
                          <span>🚫</span> Rejected
                        </span>
                      `}
                    </td>

                    <!-- Date & Notes -->
                    <td style="padding: 1rem; font-size: 0.8rem; color: var(--color-text-muted);">
                      <div>Reg: <strong>${u.registeredDate || '2025-05-15'}</strong></div>
                      ${u.approvedBy ? `
                        <div style="color: #059669; font-size: 0.75rem;">By: ${u.approvedBy}</div>
                      ` : ''}
                      ${u.rejectionReason ? `
                        <div style="color: #dc2626; font-size: 0.75rem; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${u.rejectionReason}">Reason: ${u.rejectionReason}</div>
                      ` : ''}
                    </td>

                    <!-- Actions -->
                    <td style="padding: 1rem 1.25rem; text-align: right;">
                      <div style="display: inline-flex; gap: 0.4rem; justify-content: flex-end; flex-wrap: wrap;">
                        ${u.status === 'pending' ? `
                          <button class="btn btn-sm btn-primary" onclick="adminApp.approveUser('${u.id}', '${u.name}')" style="background: #10b981; border-color: #10b981; padding: 0.35rem 0.75rem; font-size: 0.8rem;">
                            ✅ Approve
                          </button>
                          <button class="btn btn-sm btn-outline" onclick="adminApp.openRejectModal('${u.id}', '${u.name}')" style="color: #ef4444; border-color: #ef4444; padding: 0.35rem 0.65rem; font-size: 0.8rem;">
                            ❌ Reject
                          </button>
                        ` : u.status === 'approved' ? `
                          ${u.role !== 'admin' ? `
                            <button class="btn btn-sm btn-outline" onclick="adminApp.revokeUser('${u.id}', '${u.name}')" style="color: #f59e0b; border-color: #f59e0b; padding: 0.35rem 0.65rem; font-size: 0.8rem;" title="Lock account back to pending">
                              🔒 Revoke
                            </button>
                          ` : ''}
                          <button class="btn btn-sm btn-outline" onclick="adminApp.previewUserExperience('${u.id}')" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;" title="Simulate this user's view">
                            👁️ Switch
                          </button>
                        ` : `
                          <button class="btn btn-sm btn-primary" onclick="adminApp.approveUser('${u.id}', '${u.name}')" style="background: #10b981; border-color: #10b981; padding: 0.35rem 0.65rem; font-size: 0.8rem;">
                            Re-Approve
                          </button>
                        `}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Persona Dashboard Switcher for Admin Testing -->
      <div class="card" style="margin-top: 2rem;">
        <div class="card-header">
          <h2 class="card-title">🔍 Admin Persona Dashboard Inspector</h2>
          <p class="card-subtitle">Test and verify how each user experiences their dedicated dashboard</p>
        </div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
            <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.25rem; background: var(--color-bg-secondary);">
              <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">✝️</div>
              <h3 style="font-size: 1rem; margin: 0 0 0.25rem;">Chaplain Dashboard</h3>
              <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 1rem;">
                Lectionary readings, Celebrant instructions & pastoral blessing endorsement.
              </p>
              <button class="btn btn-sm btn-outline" style="width: 100%;" onclick="adminApp.previewUserExperience('usr-002')">
                View as Fr. Aidoo
              </button>
            </div>

            <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.25rem; background: var(--color-bg-secondary);">
              <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎼</div>
              <h3 style="font-size: 1rem; margin: 0 0 0.25rem;">Coordinator Dashboard</h3>
              <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 1rem;">
                5-stage approval pipeline, hymn swap, choir scheduling & calendar.
              </p>
              <button class="btn btn-sm btn-outline" style="width: 100%;" onclick="adminApp.previewUserExperience('usr-001')">
                View as Mr. Mensah
              </button>
            </div>

            <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.25rem; background: var(--color-bg-secondary);">
              <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎵</div>
              <h3 style="font-size: 1rem; margin: 0 0 0.25rem;">Group Member Dashboard</h3>
              <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 1rem;">
                13-part rehearsal readiness, audio pitch pipes, lead sheets & WhatsApp export.
              </p>
              <button class="btn btn-sm btn-outline" style="width: 100%;" onclick="adminApp.previewUserExperience('usr-004')">
                View as Emmanuel Mensah
              </button>
            </div>

            <div style="border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.25rem; background: var(--color-bg-secondary);">
              <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⏳</div>
              <h3 style="font-size: 1rem; margin: 0 0 0.25rem;">Pending Lock Gate</h3>
              <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 1rem;">
                The 3-step holding screen shown to users awaiting approval.
              </p>
              <button class="btn btn-sm btn-outline" style="width: 100%;" onclick="adminApp.previewUserExperience('usr-005')">
                View as Pending User
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  filterBy(filter) {
    this.activeFilter = filter;
    this.render();
  }

  handleSearch(query) {
    this.searchQuery = query;
    this.render();
  }

  // Approve a single user
  approveUser(userId, userName) {
    const adminUser = store.getCurrentUser();
    const adminName = adminUser ? adminUser.name : 'Sr. Beatrice Osei';

    store.approveUser(userId, adminName);
    this.showNotification(`✅ Access Approved for ${userName}! Account is now active.`, 'success');
    this.render();
  }

  // Open modal to reject user with reason
  openRejectModal(userId, userName) {
    const reason = prompt(`Enter rejection reason for ${userName}:`, 'Choir membership could not be verified by Music Directorate.');
    if (reason !== null && reason.trim() !== '') {
      store.rejectUser(userId, reason.trim());
      this.showNotification(`Account for ${userName} has been marked as rejected.`, 'warning');
      this.render();
    }
  }

  // Revoke user access (locks them back to pending)
  revokeUser(userId, userName) {
    if (confirm(`Are you sure you want to revoke access for ${userName}? They will be immediately locked out until re-approved.`)) {
      store.setPendingUser(userId);
      this.showNotification(`🔒 Access revoked for ${userName}. Account set back to pending.`, 'info');
      this.render();
    }
  }

  // Batch approve all pending users
  batchApproveAll() {
    const users = store.getUsers();
    const pendingUsers = users.filter(u => u.status === 'pending');
    if (pendingUsers.length === 0) {
      alert('No pending users to approve.');
      return;
    }

    if (confirm(`Approve all ${pendingUsers.length} pending user(s) at once?`)) {
      const adminName = store.getCurrentUser()?.name || 'Sr. Beatrice Osei';
      pendingUsers.forEach(u => store.approveUser(u.id, adminName));
      this.showNotification(`🎉 Successfully approved ${pendingUsers.length} user(s)!`, 'success');
      this.render();
    }
  }

  // Open modal to enroll a new user directly
  openNewUserModal() {
    const modalEl = document.getElementById('admin-modal-container') || document.body;
    let modalWrapper = document.getElementById('new-user-modal-box');
    if (!modalWrapper) {
      modalWrapper = document.createElement('div');
      modalWrapper.id = 'new-user-modal-box';
      modalWrapper.className = 'modal-backdrop';
      modalWrapper.style.display = 'flex';
      modalEl.appendChild(modalWrapper);
    }

    const groups = store.getGroups();

    modalWrapper.innerHTML = `
      <div class="modal-content" style="max-width: 520px;">
        <div class="modal-header">
          <h2 class="modal-title">➕ Enroll New Liturgical User</h2>
          <button class="modal-close" onclick="document.getElementById('new-user-modal-box').style.display='none'">&times;</button>
        </div>
        <form id="new-user-form" onsubmit="adminApp.handleCreateUserSubmit(event)">
          <div class="modal-body">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="font-weight: 600;">Full Name *</label>
              <input type="text" id="nu-name" class="form-control" placeholder="e.g., Sister Maria Goretti" required />
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="font-weight: 600;">Email Address *</label>
              <input type="email" id="nu-email" class="form-control" placeholder="e.g., maria@olagshs.edu.gh" required />
            </div>

            <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Role *</label>
                <select id="nu-role" class="form-control" required onchange="adminApp.onRoleSelectChange(this.value)">
                  <option value="group">Music Group Member / Chorister</option>
                  <option value="coordinator">Music Coordinator</option>
                  <option value="chaplain">Chaplain / Priest Celebrant</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Choir Group Assignment</label>
                <select id="nu-group" class="form-control">
                  <option value="">General Staff / Unassigned</option>
                  ${groups.map(g => `<option value="${g.name}">${g.name}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Voice Part</label>
                <select id="nu-voice" class="form-control">
                  <option value="Soprano">Soprano</option>
                  <option value="Alto">Alto</option>
                  <option value="Tenor">Tenor</option>
                  <option value="Bass">Bass</option>
                  <option value="Organist">Organist / Accompanist</option>
                  <option value="Cantor">Cantor</option>
                  <option value="Member">General Member</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Initial Access State</label>
                <select id="nu-status" class="form-control">
                  <option value="approved">Pre-Approve Immediately ✅</option>
                  <option value="pending">Start as Pending Review ⏳</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" style="font-weight: 600;">Administrative Notes</label>
              <textarea id="nu-notes" class="form-control" rows="2" placeholder="e.g., Verified chorister from Marian Voices, admitted for Trinity term."></textarea>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button type="button" class="btn btn-outline" onclick="document.getElementById('new-user-modal-box').style.display='none'">Cancel</button>
            <button type="submit" class="btn btn-primary">Enroll User</button>
          </div>
        </form>
      </div>
    `;
    modalWrapper.style.display = 'flex';
  }

  onRoleSelectChange(role) {
    const voiceSelect = document.getElementById('nu-voice');
    if (voiceSelect) {
      if (role === 'chaplain') voiceSelect.value = 'Cantor';
      else if (role === 'coordinator') voiceSelect.value = 'Organist';
    }
  }

  handleCreateUserSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('nu-name').value.trim();
    const email = document.getElementById('nu-email').value.trim();
    const role = document.getElementById('nu-role').value;
    const groupName = document.getElementById('nu-group').value;
    const voicePart = document.getElementById('nu-voice').value;
    const status = document.getElementById('nu-status').value;
    const notes = document.getElementById('nu-notes').value.trim();

    if (!name || !email) {
      alert('Please fill in required fields.');
      return;
    }

    const roleLabels = {
      chaplain: 'School Chaplain & Celebrant',
      coordinator: 'Music Coordinator',
      group: 'Music Group Member',
      admin: 'Liturgical Administrator'
    };

    const newUser = store.registerUser({
      name,
      email,
      role,
      roleLabel: roleLabels[role] || role,
      groupName: groupName || (role === 'chaplain' ? 'Chaplaincy Team' : 'School Music Directorate'),
      voicePart,
      notes
    });

    if (status === 'approved') {
      store.approveUser(newUser.id, store.getCurrentUser()?.name || 'Sr. Beatrice Osei');
    }

    document.getElementById('new-user-modal-box').style.display = 'none';
    this.showNotification(`User ${name} has been enrolled successfully!`, 'success');
    this.render();
  }

  // Preview another user's view
  previewUserExperience(userId) {
    const user = store.getUserById(userId);
    if (!user) return;

    store.setCurrentUser(user.id);
    if (typeof auth !== 'undefined') {
      auth.redirectToUserDashboard(user);
    }
  }

  // Reset database state to defaults
  resetDatabaseState() {
    if (confirm('Are you sure you want to reset all demo database state to default? All newly registered test users and mass changes will be reinitialized.')) {
      store.resetState();
      this.showNotification('State has been reinitialized to defaults.', 'info');
      this.render();
    }
  }

  showNotification(msg, type = 'info') {
    if (typeof showToast === 'function') {
      showToast(msg, type);
    } else {
      alert(msg);
    }
  }
}

// Global instance
const adminApp = new AdminDashboardController();
