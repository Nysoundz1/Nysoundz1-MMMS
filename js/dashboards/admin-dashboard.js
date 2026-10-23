// Dedicated Dashboard Controller for Administrator & User Approvals
// File: js/dashboards/admin-dashboard.js
// Persona: Sr. Beatrice Osei (System Administrator & Head of Liturgical Operations)
// Aesthetic: Clean, Simple, Focused Access Governance

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

  filterBy(filter) {
    this.activeFilter = filter;
    this.render();
  }

  handleSearch(query) {
    this.searchQuery = query;
    this.render();
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
      <!-- 1. Sleek Compact Action Header -->
      <div class="compact-action-header" style="border-left: 4px solid #f59e0b;">
        <div class="compact-header-left">
          <div class="compact-header-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
            🛡️
          </div>
          <div>
            <h1 class="compact-header-title">User Approvals & Access Gate</h1>
            <div class="compact-header-subtitle">
              <span>Admin: <strong>Sr. Beatrice Osei</strong></span>
              <span>•</span>
              <span>Policy: <strong>Individual Approval Enforced</strong></span>
              <span>•</span>
              <span class="badge-pill ${pendingCount > 0 ? 'badge-orange' : 'badge-green'}" style="font-size: 0.7rem;">
                ${pendingCount} Pending Review
              </span>
            </div>
          </div>
        </div>

        <div class="compact-header-actions">
          ${pendingCount > 0 ? `
            <button class="btn btn-sm btn-primary" onclick="adminApp.batchApproveAll()" style="background: #059669; border-color: #059669; padding: 0.45rem 0.85rem;">
              ⚡ Approve All Pending (${pendingCount})
            </button>
          ` : ''}
          <button class="btn btn-sm btn-outline" onclick="adminApp.openNewUserModal()" style="padding: 0.45rem 0.85rem;">
            ➕ Enroll User
          </button>
        </div>
      </div>

      <!-- 2. Streamlined Stat Strip -->
      <div class="clean-stat-strip">
        <div class="clean-stat-unit" style="cursor: pointer;" onclick="adminApp.filterBy('pending')">
          <span>⏳ Pending Review:</span>
          <strong style="color: #f59e0b;">${pendingCount}</strong>
        </div>
        <span>•</span>
        <div class="clean-stat-unit" style="cursor: pointer;" onclick="adminApp.filterBy('approved')">
          <span>✅ Approved Active:</span>
          <strong style="color: #10b981;">${approvedCount}</strong>
        </div>
        <span>•</span>
        <div class="clean-stat-unit" style="cursor: pointer;" onclick="adminApp.filterBy('all')">
          <span>👥 Total Accounts:</span>
          <strong>${totalUsers}</strong>
        </div>
      </div>

      <!-- 3. Clean Filter Tabs & Search Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;">
        <div class="clean-segmented-tabs" style="margin-bottom: 0;">
          <button class="clean-tab-pill ${this.activeFilter === 'pending' ? 'active' : ''}" onclick="adminApp.filterBy('pending')">
            ⏳ Pending Queue (${pendingCount})
          </button>
          <button class="clean-tab-pill ${this.activeFilter === 'approved' ? 'active' : ''}" onclick="adminApp.filterBy('approved')">
            ✅ Approved (${approvedCount})
          </button>
          <button class="clean-tab-pill ${this.activeFilter === 'rejected' ? 'active' : ''}" onclick="adminApp.filterBy('rejected')">
            🚫 Rejected (${rejectedUsers.length})
          </button>
          <button class="clean-tab-pill ${this.activeFilter === 'all' ? 'active' : ''}" onclick="adminApp.filterBy('all')">
            All (${totalUsers})
          </button>
        </div>

        <div>
          <input type="text"
            placeholder="🔍 Search name, email, choir..."
            value="${this.searchQuery}"
            oninput="adminApp.handleSearch(this.value)"
            style="padding: 0.45rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-size: 0.82rem; width: 220px;"
          />
        </div>
      </div>

      <!-- 4. Streamlined User Table Card -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div class="table-responsive">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: var(--bg-subtle, #f8fafc); border-bottom: 2px solid var(--border-color);">
                <th style="padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase;">User Profile</th>
                <th style="padding: 0.75rem 0.85rem; text-align: left; font-size: 0.75rem; text-transform: uppercase;">Role & Ministry</th>
                <th style="padding: 0.75rem 0.85rem; text-align: left; font-size: 0.75rem; text-transform: uppercase;">Choir Group</th>
                <th style="padding: 0.75rem 0.85rem; text-align: left; font-size: 0.75rem; text-transform: uppercase;">Status</th>
                <th style="padding: 0.75rem 1rem; text-align: right; font-size: 0.75rem; text-transform: uppercase;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.length === 0 ? `
                <tr>
                  <td colspan="5" style="padding: 2.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
                    No accounts found for the current filter.
                  </td>
                </tr>
              ` : filteredUsers.map(u => `
                <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.12s;" onmouseover="this.style.background='var(--bg-subtle, #f8fafc)'" onmouseout="this.style.background='transparent'">
                  <!-- Profile -->
                  <td style="padding: 0.75rem 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img src="${u.avatar || 'assets/avatar.jpg'}" alt="${u.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--border-color);" />
                      <div>
                        <div style="font-weight: 600; font-size: 0.875rem; color: var(--text-main);">${u.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${u.email}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Role -->
                  <td style="padding: 0.75rem 0.85rem;">
                    <span class="badge-pill ${
                      u.role === 'chaplain' ? 'badge-purple' :
                      u.role === 'coordinator' ? 'badge-blue' :
                      u.role === 'admin' ? 'badge-orange' : 'badge-gold'
                    }" style="font-size: 0.72rem;">
                      ${u.role === 'chaplain' ? '✝️ Chaplain' :
                        u.role === 'coordinator' ? '🎼 Coordinator' :
                        u.role === 'admin' ? '🛡️ Admin' : '🎵 Chorister'}
                    </span>
                  </td>

                  <!-- Group -->
                  <td style="padding: 0.75rem 0.85rem; font-size: 0.82rem;">
                    <div>${u.groupName || 'School Staff'}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${u.voicePart || 'Member'}</div>
                  </td>

                  <!-- Status -->
                  <td style="padding: 0.75rem 0.85rem;">
                    ${u.status === 'approved' ? `
                      <span class="badge-pill badge-green" style="font-size: 0.7rem;">● Approved</span>
                    ` : u.status === 'pending' ? `
                      <span class="badge-pill badge-orange" style="font-size: 0.7rem;">⏳ Pending Review</span>
                    ` : `
                      <span class="badge-pill badge-red" style="font-size: 0.7rem;">🚫 Rejected</span>
                    `}
                  </td>

                  <!-- Action -->
                  <td style="padding: 0.75rem 1rem; text-align: right;">
                    <div style="display: inline-flex; gap: 0.35rem; justify-content: flex-end;">
                      ${u.status === 'pending' ? `
                        <button class="btn btn-sm btn-primary" onclick="adminApp.approveUser('${u.id}', '${u.name}')" style="background: #10b981; border-color: #10b981; font-size: 0.75rem; padding: 0.25rem 0.65rem;">
                          ✅ Approve
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="adminApp.openRejectModal('${u.id}', '${u.name}')" style="color: #ef4444; border-color: #ef4444; font-size: 0.75rem; padding: 0.25rem 0.55rem;">
                          ❌
                        </button>
                      ` : u.status === 'approved' ? `
                        ${u.role !== 'admin' ? `
                          <button class="btn btn-sm btn-outline" onclick="adminApp.revokeUser('${u.id}', '${u.name}')" style="color: #f59e0b; border-color: #f59e0b; font-size: 0.75rem; padding: 0.25rem 0.55rem;" title="Revoke access back to pending">
                            🔒 Revoke
                          </button>
                        ` : ''}
                      ` : `
                        <button class="btn btn-sm btn-outline" onclick="adminApp.approveUser('${u.id}', '${u.name}')" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;">
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
    `;
  }

  approveUser(userId, userName) {
    const adminUser = store.getCurrentUser();
    const adminName = adminUser ? adminUser.name : 'Sr. Beatrice Osei';
    store.approveUser(userId, adminName);
    alert(`✅ Access Approved for ${userName}!`);
    this.render();
  }

  openRejectModal(userId, userName) {
    const reason = prompt(`Enter rejection reason for ${userName}:`, 'Choir membership could not be confirmed.');
    if (reason !== null && reason.trim() !== '') {
      store.rejectUser(userId, reason.trim());
      alert(`Account for ${userName} marked as rejected.`);
      this.render();
    }
  }

  revokeUser(userId, userName) {
    if (confirm(`Revoke access for ${userName}? Account will be locked until re-approved.`)) {
      store.setPendingUser(userId);
      this.render();
    }
  }

  batchApproveAll() {
    const pendingUsers = store.getUsers().filter(u => u.status === 'pending');
    if (pendingUsers.length === 0) return;
    if (confirm(`Approve all ${pendingUsers.length} pending user(s)?`)) {
      const adminName = store.getCurrentUser()?.name || 'Sr. Beatrice Osei';
      pendingUsers.forEach(u => store.approveUser(u.id, adminName));
      alert(`🎉 Successfully approved ${pendingUsers.length} user(s)!`);
      this.render();
    }
  }

  openNewUserModal() {
    const name = prompt('Enter Full Name:');
    if (!name) return;
    const email = prompt('Enter Email Address:', `${name.toLowerCase().replace(/\s+/g, '')}@olagshs.edu.gh`);
    if (!email) return;

    store.registerUser({
      name,
      email,
      role: 'group',
      roleLabel: 'Music Group Member',
      groupName: 'Marian Voices',
      voicePart: 'Soprano'
    });
    alert(`Account for ${name} enrolled successfully in pending status!`);
    this.render();
  }
}

// Global instance
const adminApp = new AdminDashboardController();
