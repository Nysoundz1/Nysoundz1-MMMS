// SMMMS Application Controller for Our Lady of Grace Senior High School (OLAG)

class SMMMSApp {
  constructor() {
    this.currentView = 'dashboard';
    this.activeArrangementId = 'arr-2025-05-25';
    this.selectedCalDate = 25; // 25 May 2025
    this.calMonth = 4; // May (0-indexed)
    this.calYear = 2025;
    this.currentSongInModal = null;
    this.chordTransposeOffset = 0;
    this.init();
  }

  init() {
    this.bindEvents();
    this.render();

    // Check URL hash if present
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      this.navigateTo(hash);
    }
  }

  bindEvents() {
    // Navigation items
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.getAttribute('data-nav');
        this.navigateTo(view);
        this.closeMobileSidebar();
      });
    });

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('app-sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Toggle Phone Mockup floating frame
    const phoneToggleBtn = document.getElementById('toggle-phone-mockup-btn');
    const phoneMockup = document.getElementById('phone-mockup-floating');
    if (phoneToggleBtn && phoneMockup) {
      phoneToggleBtn.addEventListener('click', () => {
        phoneMockup.classList.toggle('active');
        const isActive = phoneMockup.classList.contains('active');
        phoneToggleBtn.classList.toggle('btn-primary', isActive);
        phoneToggleBtn.classList.toggle('btn-outline', !isActive);
        this.showToast(isActive ? 'Opened phone preview mockup' : 'Closed phone preview', 'info');
      });
    }

    // Role / User switcher dropdown
    const roleSelect = document.getElementById('user-role-select');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const userId = e.target.value;
        store.setCurrentUser(userId);
        const user = store.getCurrentUser();
        const statusLabel = user.status === 'approved' ? 'Active' : 'Pending Approval ⏳';
        this.showToast(`Switched account to ${user.name} (${user.roleLabel} • ${statusLabel})`, user.status === 'approved' ? 'success' : 'info');
        this.render();
      });
    }

    // Subscribe to store updates
    store.subscribe(() => {
      this.render();
    });
  }

  closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }

  navigateTo(view) {
    const currentUser = store.getCurrentUser();
    // Access Gate: If account is pending approval, restrict access to Dashboard only
    if (currentUser && currentUser.status === 'pending' && view !== 'dashboard') {
      this.showToast('Account is Pending Administrator Approval. Full access is locked until approved.', 'error');
      view = 'dashboard';
    }

    this.currentView = view;
    window.location.hash = view;

    // Update active nav link
    document.querySelectorAll('[data-nav]').forEach(el => {
      if (el.getAttribute('data-nav') === view) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSec = document.getElementById(`view-${view}`);
    if (targetSec) {
      targetSec.classList.add('active');
    }

    // Update Header Title
    const titleEl = document.getElementById('page-header-title');
    if (titleEl) {
      const titleMap = {
        dashboard: 'Dashboard',
        schedule: 'Mass Schedule',
        arrangement: 'Mass Arrangement',
        library: 'Song Library',
        groups: 'Music Groups',
        approvals: 'Coordinator Review & Approvals',
        archive: 'Mass Music Archive',
        users: 'User Access & Admin Approvals',
        settings: 'Settings'
      };
      titleEl.textContent = titleMap[view] || 'Dashboard';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render() {
    this.renderUserSelector();
    this.renderDashboard();
    this.renderSchedule();
    this.renderArrangement();
    this.renderSongsTable();
    this.renderGroups();
    this.renderApprovals();
    this.renderArchive();
    this.renderUsers();
    this.renderPhoneMockupContent();
  }

  // ==========================================
  // USER SELECTOR & ACCESS GATE CONTROLLER
  // ==========================================
  renderUserSelector() {
    const roleSelect = document.getElementById('user-role-select');
    const userDisplayName = document.getElementById('user-display-name');
    const userDisplayAvatar = document.getElementById('user-display-avatar');
    const userStatusBadge = document.getElementById('user-display-status-badge');
    const navUsers = document.getElementById('nav-users');
    const navUsersBadge = document.getElementById('nav-users-badge');

    const users = store.getUsers();
    const currentUser = store.getCurrentUser();
    const pendingUsers = users.filter(u => u.status === 'pending');
    const approvedUsers = users.filter(u => u.status === 'approved');

    // Update Top Header User Display
    if (userDisplayName) userDisplayName.textContent = currentUser.name;
    if (userDisplayAvatar && currentUser.avatar) userDisplayAvatar.src = currentUser.avatar;
    if (userStatusBadge) {
      if (currentUser.status === 'approved') {
        userStatusBadge.textContent = 'Approved';
        userStatusBadge.className = 'badge-pill badge-green';
      } else if (currentUser.status === 'pending') {
        userStatusBadge.textContent = 'Pending ⏳';
        userStatusBadge.className = 'badge-pill badge-orange';
      } else {
        userStatusBadge.textContent = 'Rejected ❌';
        userStatusBadge.className = 'badge-pill badge-orange';
      }
    }

    // Admin Sidebar Link & Badge
    if (navUsers) {
      navUsers.style.display = (currentUser.role === 'admin') ? 'flex' : 'flex'; // Visible for easy access
    }
    if (navUsersBadge) {
      navUsersBadge.textContent = pendingUsers.length;
      navUsersBadge.style.display = pendingUsers.length > 0 ? 'inline-block' : 'none';
    }

    // Populate Account Switcher Dropdown
    if (roleSelect) {
      roleSelect.innerHTML = `
        <optgroup label="✅ Approved Accounts (Full Access)">
          ${approvedUsers.map(u => `
            <option value="${u.id}" ${u.id === currentUser.id ? 'selected' : ''}>
              ${u.name} — ${u.roleLabel} (${u.groupName || 'Staff'})
            </option>
          `).join('')}
        </optgroup>
        <optgroup label="⏳ Pending Admin Approval (Locked Access)">
          ${pendingUsers.map(u => `
            <option value="${u.id}" ${u.id === currentUser.id ? 'selected' : ''}>
              ⚠️ ${u.name} — ${u.roleLabel} [PENDING APPROVAL]
            </option>
          `).join('')}
        </optgroup>
      `;
      roleSelect.value = currentUser.id;
    }

    // Visually reflect lock state on navigation when user is pending
    document.querySelectorAll('.nav-item').forEach(item => {
      const navTarget = item.getAttribute('data-nav');
      if (currentUser.status === 'pending' && navTarget !== 'dashboard') {
        item.style.opacity = '0.4';
        item.style.pointerEvents = 'none';
        item.title = 'Access locked until approved by Administrator';
      } else {
        item.style.opacity = '1';
        item.style.pointerEvents = 'auto';
        item.title = '';
      }
    });
  }

  // ==========================================
  // MODULE 1: DYNAMIC ROLE-BASED DASHBOARD ROUTER
  // ==========================================
  renderDashboard() {
    const container = document.getElementById('dashboard-dynamic-content');
    if (!container) return;

    const currentUser = store.getCurrentUser();

    // 1. If user is Pending Approval, show Security Lock Gate
    if (currentUser.status === 'pending') {
      container.innerHTML = this.renderPendingApprovalGate(currentUser);
      return;
    }

    // 2. Role-specific dashboards for approved users
    switch (currentUser.role) {
      case 'chaplain':
        container.innerHTML = this.renderChaplainDashboard(currentUser);
        break;
      case 'coordinator':
        container.innerHTML = this.renderCoordinatorDashboard(currentUser);
        break;
      case 'admin':
        container.innerHTML = this.renderAdminDashboard(currentUser);
        break;
      case 'group':
      case 'student':
      default:
        container.innerHTML = this.renderGroupMemberDashboard(currentUser);
        break;
    }
  }

  // ----------------------------------------------------
  // DASHBOARD 1: PENDING APPROVAL SECURITY LOCK GATE
  // ----------------------------------------------------
  renderPendingApprovalGate(user) {
    return `
      <div class="pending-lock-container">
        <div class="pending-lock-header">
          <div class="pending-lock-shield">🔒</div>
          <h2 class="pending-lock-title">Account Pending Administrator Approval</h2>
          <p class="pending-lock-subtitle">
            In accordance with OLAG SHS Chaplaincy policy, new accounts for Priests, Music Coordinators, and Music Group Members must be individually verified and approved by the Administrator before accessing the app.
          </p>
        </div>

        <div class="pending-lock-body">
          <div class="pending-step-indicator">
            <span style="font-size: 1.25rem;">⏳</span>
            <div>
              <strong>Current Status: Awaiting Admin Verification</strong>
              <div style="font-size: 0.78rem; opacity: 0.9; margin-top: 2px;">
                Your registration was submitted on <strong>${user.registeredDate || 'May 24, 2025'}</strong>. Once approved, all Mass arrangements, songs, and schedules will unlock immediately.
              </div>
            </div>
          </div>

          <div class="pending-user-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">${user.name}</h4>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${user.email}</div>
              </div>
              <span class="badge-pill badge-orange" style="font-size: 0.75rem;">Status: Pending Review ⏳</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.82rem; margin-top: 0.5rem;">
              <div>👤 <strong>Requested Role:</strong> ${user.roleLabel}</div>
              <div>👥 <strong>Assigned Ministry:</strong> ${user.groupName || 'Unassigned'}</div>
              <div>🎙️ <strong>Voice Part / Title:</strong> ${user.voicePart || 'Member'}</div>
              <div>📅 <strong>Registration ID:</strong> <code style="font-family: var(--font-mono); font-size: 0.75rem;">${user.id}</code></div>
            </div>

            ${user.notes ? `
              <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-color); font-size: 0.78rem; color: var(--text-secondary);">
                💬 <strong>Applicant Note:</strong> "${user.notes}"
              </div>
            ` : ''}
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: space-between; align-items: center;">
            <button class="btn-primary" onclick="app.switchToAdminAndApprove('${user.id}')">
              🛡️ Switch to Administrator & Approve This User
            </button>
            <button class="btn-outline" onclick="app.showToast('Checking approval status... Still pending Administrator clearance.', 'info')">
              🔁 Check Status
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // DASHBOARD 2: CHAPLAIN (PRIEST / FR. EMMANUEL K. AIDOO)
  // ----------------------------------------------------
  renderChaplainDashboard(user) {
    const masses = store.getMasses();
    const arrangements = store.getArrangements();
    const myMasses = masses.filter(m => m.celebrant && m.celebrant.includes('Aidoo'));
    const nextCelebration = myMasses.find(m => m.date >= '2025-05-25') || myMasses[0] || masses[0];
    const endorsedCount = masses.filter(m => m.chaplainEndorsed).length;
    const pendingEndorseCount = masses.filter(m => !m.chaplainEndorsed && m.status === 'approved').length;

    return `
      <!-- Chaplain Hero Identity Banner -->
      <div class="role-hero-banner banner-chaplain">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">
            ✝️ Catholic Liturgical & Pastoral Oversight
          </span>
          <h1 class="role-hero-title">Pax Christi, ${user.name} 👋</h1>
          <p class="role-hero-subtitle">
            School Chaplain & Priest Celebrant &bull; Oversee Mass Scripture Readings, review music programmes, and grant pastoral liturgical blessings.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <span class="vestment-tag" style="background: rgba(255,255,255,0.15); color: #ffffff; border-color: rgba(255,255,255,0.3);">
            ⚪ Vestment: White & Gold
          </span>
          <span class="vestment-tag" style="background: rgba(255,255,255,0.15); color: #ffffff; border-color: rgba(255,255,255,0.3);">
            🌅 Easter Season (Year C)
          </span>
        </div>
      </div>

      <!-- 4 Top Chaplain Stat Cards -->
      <div class="dash-stats-row">
        <div class="stat-item-card" onclick="app.navigateTo('schedule')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-blue">✝️</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Masses as Celebrant</span>
            <div class="stat-main-value">${myMasses.length} Masses</div>
            <span class="stat-subtext">School Chapel</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('schedule')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-green">📜</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Liturgical Readings</span>
            <div class="stat-main-value">Year C</div>
            <span class="stat-subtext">Lectionary Alignment</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('approvals')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-orange">🕊️</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Pastoral Endorsements</span>
            <div class="stat-main-value">${endorsedCount} Endorsed</div>
            <span class="stat-subtext">${pendingEndorseCount} Awaiting blessing</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('groups')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-purple">👥</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Ministering Choirs</span>
            <div class="stat-main-value">5 Groups</div>
            <span class="stat-subtext">Liturgical ministries</span>
          </div>
        </div>
      </div>

      <!-- 2 Major Panels Row -->
      <div class="dash-panels-row">
        <!-- Left: Celebrant's Upcoming Liturgies & Readings -->
        <div class="dash-panel-card">
          <div class="panel-header-row">
            <h3 class="panel-header-title">Celebrant's Upcoming Liturgies & Readings</h3>
            <a class="panel-link-action" onclick="app.navigateTo('schedule')">Full Schedule</a>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${masses.slice(0, 3).map(m => {
              const group = store.getGroupById(m.assignedGroupId);
              return `
                <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.95rem;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.45rem; flex-wrap: wrap; gap: 0.4rem;">
                    <div>
                      <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--text-main);">${m.theme}</h4>
                      <div style="font-size: 0.78rem; color: var(--text-muted);">
                        📅 ${m.displayDate || m.date} &bull; ⏰ ${m.time} &bull; 🏛️ ${m.venue}
                      </div>
                    </div>
                    <div style="display: flex; gap: 0.35rem; align-items: center;">
                      <span class="vestment-tag">${m.vestmentIcon || '⚪'} ${m.vestment || 'White'}</span>
                      ${m.chaplainEndorsed ? `
                        <span class="pastoral-endorsement-badge">✝️ Pastoral Blessing Granted</span>
                      ` : `
                        <button class="btn-primary" style="font-size: 0.72rem; padding: 0.2rem 0.55rem; background: #10b981; border-color: #10b981;" onclick="app.openChaplainEndorseModal('${m.id}')">
                          ✝️ Endorse
                        </button>
                      `}
                    </div>
                  </div>

                  <!-- Scripture Readings -->
                  <div class="readings-box-strip">
                    📖 <strong>Liturgical Readings:</strong> ${m.readings || 'Proper readings for the Sunday'}
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; font-size: 0.78rem;">
                    <div>👥 <strong>Music Group:</strong> ${group ? group.name : 'School Choir'}</div>
                    <button class="btn-outline" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;" onclick="app.openChaplainNotesModal('${m.id}')">
                      ✍️ Celebrant Instructions
                    </button>
                  </div>

                  ${m.chaplainNotes ? `
                    <div style="margin-top: 0.45rem; font-size: 0.75rem; color: #b45309; background: #fef3c7; padding: 0.35rem 0.65rem; border-radius: 4px;">
                      💬 <strong>Celebrant Note to Choir:</strong> "${m.chaplainNotes}"
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Today's High Mass Liturgical Arrangement Review -->
        <div class="dash-panel-card">
          <div class="panel-header-row">
            <h3 class="panel-header-title">Music Programme Liturgical Review</h3>
            <a class="panel-link-action" onclick="app.navigateTo('arrangement')">View All 13 Parts</a>
          </div>

          <div style="background: var(--bg-surface-subtle); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong style="font-size: 0.88rem; color: var(--text-main);">${nextCelebration.theme}</strong>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${nextCelebration.displayDate || nextCelebration.date} &bull; School Choir</div>
            </div>
            <span class="badge-pill badge-green">Coordinator Approved</span>
          </div>

          <div class="arrangement-preview-list">
            <div class="preview-part-row">
              <span class="part-name-label">1. Entrance</span>
              <span class="part-song-label">Christ the Lord Is Risen Today</span>
              <span class="part-performer-label">G &bull; 4/4</span>
            </div>
            <div class="preview-part-row">
              <span class="part-name-label">2. Penitential Rite</span>
              <span class="part-song-label">Lord, Have Mercy (Kyrie)</span>
              <span class="part-performer-label">D &bull; 4/4</span>
            </div>
            <div class="preview-part-row">
              <span class="part-name-label">3. Gloria</span>
              <span class="part-song-label">Glory to God in the Highest</span>
              <span class="part-performer-label">D &bull; 4/4</span>
            </div>
            <div class="preview-part-row">
              <span class="part-name-label">4. Responsorial Psalm</span>
              <span class="part-song-label">Psalm 118: This Is the Day</span>
              <span class="part-performer-label">G &bull; Cantor</span>
            </div>
            <div class="preview-part-row">
              <span class="part-name-label">7. Sanctus</span>
              <span class="part-song-label">Holy, Holy, Holy (Missa de Angelis)</span>
              <span class="part-performer-label">F &bull; SATB</span>
            </div>
            <div class="preview-part-row">
              <span class="part-name-label">11. Communion</span>
              <span class="part-song-label">I Am the Bread of Life</span>
              <span class="part-performer-label">G &bull; 4/4</span>
            </div>
          </div>

          <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
            <button class="btn-primary" style="flex: 1; font-size: 0.78rem;" onclick="app.navigateTo('arrangement')">
              Inspect All 13 Parts &rarr;
            </button>
            <button class="btn-outline" style="font-size: 0.78rem;" onclick="app.printCurrentProgramme()">
              🖨️ Print Leaflet
            </button>
          </div>
        </div>
      </div>

      <!-- Sacred Music Pastoral Guidance Reminder -->
      <div class="reminder-banner">
        <span style="font-size: 1.1rem;">✝️</span>
        <span>
          <strong>Pastoral Reminder:</strong> Sacred music in the Catholic liturgy serves the glory of God and the sanctification of the faithful. Ensure all chosen texts are rooted in Holy Scripture and liturgical tradition.
        </span>
      </div>
    `;
  }

  // ----------------------------------------------------
  // DASHBOARD 3: MUSIC COORDINATOR (MR. GABRIEL K. MENSAH)
  // ----------------------------------------------------
  renderCoordinatorDashboard(user) {
    const masses = store.getMasses();
    const arrangements = store.getArrangements();
    const songs = store.getSongs();
    const pendingArrangements = arrangements.filter(a => a.status === 'submitted');

    return `
      <!-- Coordinator Hero Identity Banner -->
      <div class="role-hero-banner banner-coordinator">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">
            📋 Music Direction & Liturgical Administration
          </span>
          <h1 class="role-hero-title">Good day, ${user.name} 👋</h1>
          <p class="role-hero-subtitle">
            School Music Coordinator &bull; Schedule celebrations, assign music groups, review submissions, and manage the master song library.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn-primary" style="background: #ffffff; color: #0b152d; border-color: #ffffff;" onclick="app.openCreateMassModal()">
            ➕ Create Mass & Assign Group
          </button>
          <button class="btn-outline" style="color: #ffffff; border-color: rgba(255,255,255,0.4);" onclick="app.navigateTo('approvals')">
            📋 Review Submissions (${pendingArrangements.length})
          </button>
        </div>
      </div>

      <!-- 4 Top Stat Cards -->
      <div class="dash-stats-row">
        <div class="stat-item-card" onclick="app.navigateTo('schedule')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-blue">📅</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Scheduled Masses</span>
            <div class="stat-main-value">${masses.length} Masses</div>
            <span class="stat-subtext">Upcoming celebrations</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('approvals')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-orange">📄</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge" style="color: #ea580c;">Pending Reviews</span>
            <div class="stat-main-value" style="color: #ea580c;">${pendingArrangements.length} Queue</div>
            <span class="stat-subtext">Requires review</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('groups')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-green">👥</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Active Choirs</span>
            <div class="stat-main-value">5 Groups</div>
            <span class="stat-subtext">All ministries assigned</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('library')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-purple">🎼</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Master Song Library</span>
            <div class="stat-main-value">${songs.length} Hymns</div>
            <span class="stat-subtext">Catholic repertoire</span>
          </div>
        </div>
      </div>

      <!-- 2 Major Panels Row -->
      <div class="dash-panels-row">
        <!-- Left: Urgent Arrangement Review & Approvals Queue -->
        <div class="dash-panel-card">
          <div class="panel-header-row">
            <h3 class="panel-header-title">Arrangements Awaiting Coordinator Review (${pendingArrangements.length})</h3>
            <a class="panel-link-action" onclick="app.navigateTo('approvals')">Open Approval Hub</a>
          </div>

          ${pendingArrangements.length === 0 ? `
            <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-subtle); border-radius: var(--radius-md);">
              <span style="font-size: 2rem;">🎉</span>
              <p style="margin-top: 0.5rem; font-size: 0.85rem;">All choir arrangements are reviewed and up to date!</p>
            </div>
          ` : pendingArrangements.map(arr => {
            const mass = store.getMassById(arr.massId);
            return `
              <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <div>
                    <h4 style="font-size: 1rem; font-weight: 800; color: var(--text-main);">${mass ? mass.theme : arr.massTitle}</h4>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">
                      Choir: <strong>${arr.groupName}</strong> &bull; Date: ${mass ? (mass.displayDate || mass.date) : arr.massDate}
                    </div>
                  </div>
                  <span class="badge-pill badge-orange">Submitted</span>
                </div>

                <div style="font-size: 0.78rem; background: var(--bg-surface); padding: 0.65rem; border-radius: 4px; margin-bottom: 0.75rem;">
                  <div>🚪 <strong>Entrance:</strong> ${arr.songs?.entrance?.title || 'None'}</div>
                  <div style="margin-top: 2px;">🍞 <strong>Offertory:</strong> ${arr.songs?.offertory?.title || 'None'}</div>
                  <div style="margin-top: 2px;">🍷 <strong>Communion:</strong> ${arr.songs?.communion?.title || 'None'}</div>
                </div>

                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn-primary" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="app.coordinatorApprove('${arr.id}')">
                    ✅ Approve Programme
                  </button>
                  <button class="btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="app.coordinatorMakeCorrections('${arr.id}')">
                    ✏️ Review & Make Corrections
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Right: Choir Duty Assignment Matrix -->
        <div class="dash-panel-card">
          <div class="panel-header-row">
            <h3 class="panel-header-title">Choir Duty & Assignment Matrix</h3>
            <a class="panel-link-action" onclick="app.navigateTo('schedule')">View Calendar</a>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.65rem;">
            ${masses.slice(0, 4).map(m => {
              const group = store.getGroupById(m.assignedGroupId);
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-surface-subtle); border-radius: var(--radius-sm); border-left: 3px solid #2563eb;">
                  <div>
                    <strong style="font-size: 0.85rem; color: var(--text-main);">${m.theme}</strong>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${m.displayDate || m.date} &bull; ${m.venue}</div>
                  </div>
                  <div style="text-align: right;">
                    <span class="badge-pill badge-blue" style="font-size: 0.72rem;">${group ? group.name : 'School Choir'}</span>
                    <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">Celebrant: ${m.celebrant.split(' ')[1] || m.celebrant}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="margin-top: 1rem;">
            <button class="btn-outline" style="width: 100%; font-size: 0.78rem;" onclick="app.openCreateMassModal()">
              ➕ Assign Another Celebration
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // DASHBOARD 4: MUSIC GROUP MEMBER (FAITH MENSAH / CHOIRS)
  // ----------------------------------------------------
  renderGroupMemberDashboard(user) {
    const masses = store.getMasses();
    const arrangements = store.getArrangements();
    const myGroupId = user.groupId || 'grp-school-choir';
    const myGroup = store.getGroupById(myGroupId);
    const assignedMasses = masses.filter(m => m.assignedGroupId === myGroupId);
    const nextMass = assignedMasses.find(m => m.date >= '2025-05-25') || assignedMasses[0] || masses[0];
    const targetArr = nextMass ? store.getArrangementById(nextMass.arrangementId) : arrangements[0];

    return `
      <!-- Musician Hero Identity Banner -->
      <div class="role-hero-banner banner-group">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">
            🎵 Choir Loft & Musician Rehearsal Portal
          </span>
          <h1 class="role-hero-title">Good day, ${user.name}! 👋</h1>
          <p class="role-hero-subtitle">
            ${myGroup ? myGroup.name : 'School Choir'} &bull; ${user.voicePart || 'Soprano Section'} &bull; Enter your 13 Mass parts, verify pitch, and review transposable chords.
          </p>
        </div>
        <div>
          <button class="btn-primary" style="background: #ffffff; color: #064e3b; border-color: #ffffff;" onclick="app.navigateTo('arrangement')">
            🎼 Open 13-Part Arrangement
          </button>
        </div>
      </div>

      <!-- 4 Top Musician Stat Cards -->
      <div class="dash-stats-row">
        <div class="stat-item-card" onclick="app.navigateTo('schedule')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-blue">📅</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Next Assigned Mass</span>
            <div class="stat-main-value">${nextMass ? (nextMass.displayDate || nextMass.date) : 'Sun, 25 May'}</div>
            <span class="stat-subtext">${nextMass ? nextMass.theme : 'Easter Sunday'}</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('arrangement')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-green">🎵</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Arrangement Status</span>
            <div class="stat-main-value">${targetArr ? targetArr.status.toUpperCase() : 'APPROVED'}</div>
            <span class="stat-subtext">13 Parts Completed</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('groups')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-orange">⏰</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Choir Rehearsal</span>
            <div class="stat-main-value">Thurs 4:30 PM</div>
            <span class="stat-subtext">School Chapel</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('library')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-purple">🎹</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Voice Section</span>
            <div class="stat-main-value">${user.voicePart ? user.voicePart.split(' ')[0] : 'Soprano'}</div>
            <span class="stat-subtext">SATB Harmonization</span>
          </div>
        </div>
      </div>

      <!-- 2 Major Panels Row -->
      <div class="dash-panels-row">
        <!-- Left: My Group's Mass Arrangement & 13 Parts -->
        <div class="dash-panel-card">
          <div class="panel-header-row">
            <h3 class="panel-header-title">My Choir's Next Mass Arrangement</h3>
            <a class="panel-link-action" onclick="app.navigateTo('arrangement')">Edit Full Arrangement</a>
          </div>

          <div class="next-mass-content" style="margin-bottom: 1rem;">
            <img src="assets/chalice.jpg" alt="Chalice" class="next-mass-thumb-img">
            <div class="next-mass-details">
              <div>
                <h4 class="next-mass-name">${nextMass ? nextMass.theme : 'Easter Sunday'}</h4>
                <div class="next-mass-metadata">
                  <div>👤 <strong>Celebrant:</strong> ${nextMass ? nextMass.celebrant : 'Fr. Emmanuel K. Aidoo'}</div>
                  <div>🏛️ <strong>Venue:</strong> ${nextMass ? nextMass.venue : 'School Chapel'}</div>
                  <div>🌿 <strong>Liturgical Season:</strong> ${nextMass ? nextMass.season : 'Easter'}</div>
                </div>
              </div>
              <div class="next-mass-status-badge">
                <span class="badge-pill badge-green">Approved Official Programme</span>
              </div>
            </div>
          </div>

          <!-- 5-Part Preview -->
          <div class="arrangement-preview-list">
            <div class="preview-part-row">
              <span class="part-name-label">1. Entrance</span>
              <span class="part-song-label">Christ the Lord Is Risen Today</span>
              <span class="part-performer-label">Key G &bull; 120 BPM</span>
            </div>
            <div class="preview-part-row">
              <span class="part-name-label">2. Penitential Rite</span>
              <span class="part-song-label">Lord, Have Mercy (Kyrie)</span>
              <span class="part-performer-label">Key D &bull; 100 BPM</span>
            </div>
            <div class="preview-part-row">
              <span class="part-name-label">3. Gloria</span>
              <span class="part-song-label">Glory to God in the Highest</span>
              <span class="part-performer-label">Key D &bull; SATB</span>
            </div>
            <div class="preview-part-row">
              <span class="part-name-label">4. Responsorial Psalm</span>
              <span class="part-song-label">Psalm 118: This Is the Day</span>
              <span class="part-performer-label">Key G &bull; Cantor</span>
            </div>
            <div class="preview-part-row">
              <span class="part-name-label">11. Communion</span>
              <span class="part-song-label">I Am the Bread of Life</span>
              <span class="part-performer-label">Key G &bull; 96 BPM</span>
            </div>
          </div>

          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn-primary" onclick="app.navigateTo('arrangement')">
              Open 13-Part Editor &rarr;
            </button>
            <button class="btn-outline" onclick="app.copyWhatsAppSummary(app.activeArrangementId)">
              📱 Copy WhatsApp Summary
            </button>
          </div>
        </div>

        <!-- Right: Choir Loft Musician Toolkit -->
        <div class="dash-panel-card">
          <div class="panel-header-row">
            <h3 class="panel-header-title">Choir Loft Musician Toolkit</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Web Audio Synthesizer</span>
          </div>

          <!-- Pitch Pipe Quick Generator -->
          <div style="background: var(--bg-surface-subtle); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
            <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">
              🎵 Concert Pitch Pipe Tone Generator:
            </label>
            <p style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.75rem;">
              Click any note to sound reference pitch tone before your choir sings:
            </p>

            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
              <button class="pitch-pipe-btn" onclick="audioSynth.playPitchTone('C4')">C</button>
              <button class="pitch-pipe-btn" onclick="audioSynth.playPitchTone('D4')">D</button>
              <button class="pitch-pipe-btn" onclick="audioSynth.playPitchTone('Eb4')">Eb</button>
              <button class="pitch-pipe-btn" onclick="audioSynth.playPitchTone('F4')">F</button>
              <button class="pitch-pipe-btn" onclick="audioSynth.playPitchTone('G4')">G</button>
              <button class="pitch-pipe-btn" onclick="audioSynth.playPitchTone('A4')">A</button>
              <button class="pitch-pipe-btn" onclick="audioSynth.playPitchTone('Bb4')">Bb</button>
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="audioSynth.playTriad('G')">
                🎶 Sound G Major Triad
              </button>
              <button class="btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="audioSynth.playTriad('D')">
                🎶 Sound D Major Triad
              </button>
            </div>
          </div>

          <!-- Transposable Chords Quick Shortcut -->
          <div style="background: var(--bg-surface-subtle); padding: 1rem; border-radius: var(--radius-md);">
            <strong style="font-size: 0.85rem; color: var(--text-main);">🎸 Transposable Chords & Lead Sheets</strong>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem; margin-bottom: 0.75rem;">
              Quickly transpose chords into any key for keyboard, guitar, or brass accompanists.
            </p>
            <button class="btn-primary" style="font-size: 0.75rem; width: 100%;" onclick="app.openChordModal('song-easter-1')">
              Open Chord Viewer & Transposer
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // DASHBOARD 5: SYSTEM ADMINISTRATOR (USER APPROVALS HUB)
  // ----------------------------------------------------
  renderAdminDashboard(user) {
    const users = store.getUsers();
    const pendingUsers = users.filter(u => u.status === 'pending');
    const approvedUsers = users.filter(u => u.status === 'approved');
    const masses = store.getMasses();

    return `
      <!-- Admin Hero Identity Banner -->
      <div class="role-hero-banner banner-admin">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">
            🛡️ System Administration & User Security
          </span>
          <h1 class="role-hero-title">Administration & Access Approvals 👋</h1>
          <p class="role-hero-subtitle">
            Manage user accounts, verify credentials, and grant individual access approvals to Priests, Coordinators, and Music Group Members.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn-primary" style="background: #ffffff; color: #31104b; border-color: #ffffff;" onclick="app.openRegisterUserModal()">
            ➕ Register New User
          </button>
          <button class="btn-outline" style="color: #ffffff; border-color: rgba(255,255,255,0.4);" onclick="app.navigateTo('users')">
            🛡️ User Approvals Hub (${pendingUsers.length})
          </button>
        </div>
      </div>

      <!-- 4 Top Admin Stat Cards -->
      <div class="dash-stats-row">
        <div class="stat-item-card" onclick="app.navigateTo('users')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-blue">👥</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Total Users</span>
            <div class="stat-main-value">${users.length} Users</div>
            <span class="stat-subtext">Registered accounts</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('users')" style="cursor: pointer; border-left: 3px solid #ea580c;">
          <div class="stat-icon-box stat-icon-orange">⏳</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge" style="color: #ea580c;">Pending Admin Approval</span>
            <div class="stat-main-value" style="color: #ea580c;">${pendingUsers.length} Action Needed</div>
            <span class="stat-subtext">Awaiting clearance</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('users')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-green">✅</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Approved Users</span>
            <div class="stat-main-value">${approvedUsers.length} Active</div>
            <span class="stat-subtext">Full system access</span>
          </div>
        </div>

        <div class="stat-item-card" onclick="app.navigateTo('schedule')" style="cursor: pointer;">
          <div class="stat-icon-box stat-icon-purple">⛪</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Scheduled Masses</span>
            <div class="stat-main-value">${masses.length} Masses</div>
            <span class="stat-subtext">Liturgical calendar</span>
          </div>
        </div>
      </div>

      <!-- User Approvals Action Panel -->
      <div class="dash-panel-card" style="margin-bottom: 1.5rem;">
        <div class="panel-header-row">
          <div>
            <h3 class="panel-header-title">Pending User Approval Queue (${pendingUsers.length})</h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">
              These accounts are currently locked and cannot access the app until you click Approve.
            </span>
          </div>
          <button class="btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="app.navigateTo('users')">
            Manage All Accounts &rarr;
          </button>
        </div>

        ${pendingUsers.length === 0 ? `
          <div style="padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-surface-subtle); border-radius: var(--radius-md);">
            <span style="font-size: 2rem;">🎉</span>
            <p style="margin-top: 0.5rem; font-size: 0.88rem;">All user registrations have been reviewed and approved!</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${pendingUsers.map(u => `
              <div style="background: var(--bg-surface-subtle); border: 1px solid #fed7aa; border-radius: var(--radius-md); padding: 0.95rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <strong style="font-size: 0.95rem; color: var(--text-main);">${u.name}</strong>
                    <span class="badge-pill badge-orange" style="font-size: 0.7rem;">${u.roleLabel}</span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">
                    ${u.email} &bull; Assigned: <strong>${u.groupName || 'Unassigned'}</strong> &bull; Registered: ${u.registeredDate}
                  </div>
                  ${u.notes ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 3px;">💬 "${u.notes}"</div>` : ''}
                </div>

                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn-primary" style="font-size: 0.78rem; padding: 0.35rem 0.75rem;" onclick="app.approveUser('${u.id}')">
                    ✅ Approve Account
                  </button>
                  <button class="btn-outline" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; color: #dc2626; border-color: #fca5a5;" onclick="app.rejectUser('${u.id}')">
                    ❌ Reject
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  // ==========================================
  // MODULE 2: MASS SCHEDULE & CALENDAR
  // ==========================================
  renderSchedule() {
    this.renderCalendarWidget();
    this.renderScheduledMassesList();
  }

  renderCalendarWidget() {
    const tbody = document.getElementById('calendar-days-tbody');
    const label = document.getElementById('cal-month-year-label');
    if (!tbody) return;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (label) {
      label.textContent = `${monthNames[this.calMonth]} ${this.calYear}`;
    }

    const firstDayIndex = new Date(this.calYear, this.calMonth, 1).getDay();
    const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate();
    const prevMonthDays = new Date(this.calYear, this.calMonth, 0).getDate();

    let rowsHtml = '';
    let currentDay = 1;
    let nextMonthDay = 1;

    for (let r = 0; r < 5; r++) {
      let cellsHtml = '';
      for (let c = 0; c < 7; c++) {
        const cellIndex = r * 7 + c;
        if (cellIndex < firstDayIndex) {
          const prevDate = prevMonthDays - firstDayIndex + cellIndex + 1;
          cellsHtml += `<td><div class="cal-day-cell muted">${prevDate}</div></td>`;
        } else if (currentDay <= daysInMonth) {
          const isSelected = (currentDay === this.selectedCalDate);
          const hasMass = (currentDay === 25 || currentDay === 1 || currentDay === 8 || currentDay === 15);
          cellsHtml += `
            <td>
              <div class="cal-day-cell ${isSelected ? 'active-date' : ''} ${hasMass ? 'has-mass' : ''}" onclick="app.selectCalendarDate(${currentDay})">
                ${currentDay}
              </div>
            </td>
          `;
          currentDay++;
        } else {
          cellsHtml += `<td><div class="cal-day-cell muted">${nextMonthDay}</div></td>`;
          nextMonthDay++;
        }
      }
      rowsHtml += `<tr>${cellsHtml}</tr>`;
    }

    tbody.innerHTML = rowsHtml;
  }

  selectCalendarDate(day) {
    this.selectedCalDate = day;
    this.renderCalendarWidget();

    // If day 25 clicked, open Mass Details modal matching the ref screenshot
    if (day === 25) {
      this.openMassDetailsModal('mass-2025-05-25');
    }
  }

  prevMonth() {
    this.calMonth--;
    if (this.calMonth < 0) {
      this.calMonth = 11;
      this.calYear--;
    }
    this.renderCalendarWidget();
  }

  nextMonth() {
    this.calMonth++;
    if (this.calMonth > 11) {
      this.calMonth = 0;
      this.calYear++;
    }
    this.renderCalendarWidget();
  }

  goToMay2025() {
    this.calMonth = 4;
    this.calYear = 2025;
    this.selectedCalDate = 25;
    this.renderCalendarWidget();
    this.showToast('Jumped to May 2025', 'info');
  }

  renderScheduledMassesList() {
    const container = document.getElementById('upcoming-masses-list-container');
    if (!container) return;

    const masses = store.getMasses().filter(m => !m.date.startsWith('2024'));

    container.innerHTML = masses.map(m => {
      const group = store.getGroupById(m.assignedGroupId);
      const badgeClass = m.status === 'approved' ? 'badge-green' : (m.status === 'submitted' ? 'badge-orange' : 'badge-gray');
      const statusText = m.status === 'approved' ? 'Approved' : (m.status === 'submitted' ? 'Pending' : (m.status === 'draft' ? 'Draft' : 'Assigned'));

      return `
        <div class="upcoming-item-row" style="cursor: pointer;" onclick="app.openMassDetailsModal('${m.id}')">
          <div class="upcoming-date-col">
            <div class="upcoming-date-text">${m.displayDate ? m.displayDate.split(', ')[1] || m.displayDate : m.date}</div>
            <div class="upcoming-year-text">${m.date.split('-')[0]}</div>
          </div>

          <div class="upcoming-meta-col">
            <div class="upcoming-theme-text">${m.theme}</div>
            <div class="upcoming-details-sub">${m.time} &bull; ${m.venue} &bull; <strong style="color: var(--primary-blue);">${group ? group.name : 'School Choir'}</strong></div>
          </div>

          <div>
            <span class="badge-pill ${badgeClass}">${statusText}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Coordinator Creates Mass & Assigns Music Group ---
  openCreateMassModal() {
    const modal = document.getElementById('create-mass-modal');
    if (modal) modal.classList.add('active');
  }

  closeCreateMassModal() {
    const modal = document.getElementById('create-mass-modal');
    if (modal) modal.classList.remove('active');
  }

  handleCreateMassSubmit(e) {
    e.preventDefault();
    const date = document.getElementById('new-mass-date').value;
    const time = document.getElementById('new-mass-time').value;
    const theme = document.getElementById('new-mass-theme').value;
    const season = document.getElementById('new-mass-season').value;
    const groupId = document.getElementById('new-mass-group').value;
    const celebrant = document.getElementById('new-mass-celebrant').value;
    const venue = document.getElementById('new-mass-venue').value;

    const group = store.getGroupById(groupId);

    const newMass = store.createMassAndAssignGroup({
      date,
      displayDate: `Sun, ${new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      time,
      theme,
      season,
      assignedGroupId: groupId,
      celebrant,
      venue
    });

    this.closeCreateMassModal();
    this.activeArrangementId = newMass.arrangementId;
    this.showToast(`Mass created and assigned to ${group ? group.name : 'Choir'}!`, 'success');
    this.render();
    this.navigateTo('arrangement');
  }

  // ==========================================
  // MODULE 3: MASS ARRANGEMENT (13 PARTS)
  // ==========================================
  renderArrangement() {
    const masses = store.getMasses();
    const selector = document.getElementById('arrangement-mass-selector');
    if (selector) {
      selector.innerHTML = masses.map(m => `
        <option value="${m.arrangementId}" ${m.arrangementId === this.activeArrangementId ? 'selected' : ''}>
          ${m.displayDate || m.date} — ${m.theme}
        </option>
      `).join('');
    }

    const arr = store.getArrangementById(this.activeArrangementId) || DEFAULT_ARRANGEMENTS[0];
    const mass = store.getMassById(arr.massId);
    const group = store.getGroupById(arr.groupId);

    // Meta bar
    const metaContainer = document.getElementById('arrangement-meta-strip-container');
    if (metaContainer) {
      const badgeClass = arr.status === 'approved' ? 'badge-green' : (arr.status === 'submitted' ? 'badge-orange' : (arr.status === 'reviewed' ? 'badge-blue' : 'badge-gray'));
      const statusLabel = arr.status ? arr.status.toUpperCase() : 'DRAFT';

      metaContainer.innerHTML = `
        <div class="meta-pill-item">
          <span>📅</span>
          <span>Date: <strong>${mass ? (mass.displayDate || mass.date) : arr.massDisplayDate}</strong></span>
        </div>
        <div class="meta-pill-item">
          <span>⛪</span>
          <span>Occasion: <strong>${mass ? mass.theme : arr.massTitle}</strong></span>
        </div>
        <div class="meta-pill-item">
          <span>✝️</span>
          <span>Celebrant: <strong>${mass ? mass.celebrant : 'Fr. Emmanuel K. Aidoo'}</strong></span>
        </div>
        <div class="meta-pill-item">
          <span>👥</span>
          <span>Music Group: <strong>${group ? group.name : arr.groupName}</strong></span>
        </div>
        <div style="margin-left: auto;">
          <span class="badge-pill ${badgeClass}">${statusLabel}</span>
        </div>
      `;
    }

    // 13 Parts List
    const partsContainer = document.getElementById('arrangement-13-parts-container');
    if (partsContainer) {
      const songs = arr.songs || {};
      partsContainer.innerHTML = MASS_PARTS.map(part => {
        const partSong = songs[part.id] || {
          title: 'Not assigned yet',
          key: '—',
          timeSig: '4/4',
          tempo: '—',
          performer: 'Choir'
        };

        return `
          <div class="part-item-row" data-part="${part.id}">
            <div class="part-item-left">
              <span class="part-circle-num" style="background-color: ${part.color || '#2563eb'};">
                ${part.order}
              </span>
              <span class="part-name-text">${part.name}</span>
            </div>

            <div class="part-item-mid">
              <div class="part-song-title-text">${partSong.title}</div>
              <div class="part-song-meta-text">
                Key: ${partSong.key} &bull; ${partSong.timeSig || '4/4'} &bull; Tempo: ${partSong.tempo || '100'}
              </div>
            </div>

            <div class="part-item-right">
              <button class="btn-sm-blue" onclick="app.openPartEditModal('${part.id}')">
                Edit
              </button>
              <button class="btn-sm-action" title="View Chords & Transpose" onclick="app.openChordModal('${partSong.songId || ''}', '${part.id}')">
                •••
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Submit button text based on status
    const submitBtn = document.getElementById('btn-submit-arrangement');
    if (submitBtn) {
      if (arr.status === 'approved') {
        submitBtn.textContent = '✅ Approved (Official Programme)';
        submitBtn.disabled = true;
      } else if (arr.status === 'submitted') {
        submitBtn.textContent = '⏳ Submitted (Under Review)';
        submitBtn.disabled = false;
      } else {
        submitBtn.textContent = 'Submit for Review';
        submitBtn.disabled = false;
      }
    }
  }

  switchActiveMassArrangement(arrId) {
    this.activeArrangementId = arrId;
    this.renderArrangement();
  }

  openPartEditModal(partId) {
    const partMeta = MASS_PARTS.find(p => p.id === partId);
    const arr = store.getArrangementById(this.activeArrangementId) || DEFAULT_ARRANGEMENTS[0];
    const currentPartSong = (arr.songs && arr.songs[partId]) || {};

    const modal = document.getElementById('part-edit-modal');
    const title = document.getElementById('part-edit-modal-title');
    const pickSelect = document.getElementById('edit-pick-library-select');
    if (!modal) return;

    if (title) title.textContent = `Edit Hymn: ${partMeta ? partMeta.name : 'Part'}`;
    document.getElementById('edit-part-id').value = partId;
    document.getElementById('edit-song-title').value = currentPartSong.title || '';
    document.getElementById('edit-song-key').value = currentPartSong.key || 'G';
    document.getElementById('edit-song-timesig').value = currentPartSong.timeSig || '4/4';
    document.getElementById('edit-song-tempo').value = currentPartSong.tempo || '120';

    if (pickSelect) {
      const allSongs = store.getSongs();
      pickSelect.innerHTML = `<option value="">-- Or choose from Song Library --</option>` +
        allSongs.map(s => `<option value="${s.id}">${s.title} (${s.category} - Key ${s.key})</option>`).join('');
    }

    modal.classList.add('active');
  }

  handleLibraryHymnSelect(songId) {
    if (!songId) return;
    const song = store.getSongById(songId);
    if (!song) return;

    document.getElementById('edit-song-title').value = song.title;
    document.getElementById('edit-song-key').value = song.key;
    document.getElementById('edit-song-timesig').value = song.timeSignature || '4/4';
    document.getElementById('edit-song-tempo').value = song.tempo || '100';
  }

  closePartEditModal() {
    const modal = document.getElementById('part-edit-modal');
    if (modal) modal.classList.remove('active');
  }

  handleSavePartEdit(e) {
    e.preventDefault();
    const partId = document.getElementById('edit-part-id').value;
    const title = document.getElementById('edit-song-title').value.trim();
    const key = document.getElementById('edit-song-key').value.trim();
    const timeSig = document.getElementById('edit-song-timesig').value.trim();
    const tempo = document.getElementById('edit-song-tempo').value.trim();

    const arr = store.getArrangementById(this.activeArrangementId) || DEFAULT_ARRANGEMENTS[0];
    if (!arr.songs) arr.songs = {};
    arr.songs[partId] = {
      songId: arr.songs[partId] ? arr.songs[partId].songId : `custom-${Date.now()}`,
      title: title,
      key: key,
      timeSig: timeSig,
      tempo: tempo,
      performer: 'Choir'
    };

    store.saveArrangement(arr);
    this.closePartEditModal();
    this.render();
    this.showToast(`Updated "${title}" in Mass arrangement.`, 'success');
  }

  submitCurrentArrangement() {
    store.submitArrangement(this.activeArrangementId);
    this.showToast('Arrangement submitted to Music Coordinator for review!', 'success');
    this.render();
  }

  // ==========================================
  // MODULE 4: SONG LIBRARY
  // ==========================================
  renderSongsTable(filteredList = null) {
    const tbody = document.getElementById('songs-table-tbody');
    if (!tbody) return;

    const songs = filteredList || store.getSongs();
    const countText = document.getElementById('pagination-info-text');
    if (countText) {
      countText.textContent = `Showing 1 - ${songs.length} of ${songs.length} songs`;
    }

    tbody.innerHTML = songs.map(s => `
      <tr>
        <td><strong>${s.title}</strong></td>
        <td>${s.composer}</td>
        <td>${s.key}</td>
        <td>${s.timeSignature || '4/4'}</td>
        <td>${s.tempo || '100'}</td>
        <td>
          <span class="badge-pill ${this.getCategoryBadgeClass(s.category)}">
            ${s.category}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn-sm-action" title="View Chords & Transpose" onclick="app.openChordModal('${s.id}')">
            👁️ Chords
          </button>
          <button class="btn-sm-action" title="Play Pitch Reference" onclick="audioSynth.playPitchPipe('${s.key}4')">
            🔊 Pitch
          </button>
          <button class="btn-sm-action" title="Download / Preview Score" onclick="app.showToast('Opening score for ${s.title}', 'info')">
            📄 Score
          </button>
        </td>
      </tr>
    `).join('');
  }

  getCategoryBadgeClass(cat = '') {
    const c = cat.toLowerCase();
    if (c.includes('easter')) return 'badge-green';
    if (c.includes('penitential')) return 'badge-blue';
    if (c.includes('gloria')) return 'badge-purple';
    if (c.includes('psalm') || c.includes('acclamation')) return 'badge-green';
    if (c.includes('offertory')) return 'badge-orange';
    if (c.includes('communion')) return 'badge-purple';
    if (c.includes('thanksgiving')) return 'badge-green';
    return 'badge-gray';
  }

  filterSongsTable(searchTerm = '') {
    const searchVal = (searchTerm || document.getElementById('song-search-input')?.value || '').toLowerCase();
    const catVal = document.getElementById('filter-cat-select')?.value || 'all';
    const keyVal = document.getElementById('filter-key-select')?.value || 'all';
    const timeSigVal = document.getElementById('filter-timesig-select')?.value || 'all';

    const filtered = store.getSongs().filter(s => {
      const matchSearch = !searchVal || 
        s.title.toLowerCase().includes(searchVal) || 
        s.composer.toLowerCase().includes(searchVal) ||
        (s.lyrics && s.lyrics.toLowerCase().includes(searchVal));

      const matchCat = catVal === 'all' || (s.category && s.category.toLowerCase() === catVal.toLowerCase());
      const matchKey = keyVal === 'all' || s.key === keyVal;
      const matchTime = timeSigVal === 'all' || s.timeSignature === timeSigVal;

      return matchSearch && matchCat && matchKey && matchTime;
    });

    this.renderSongsTable(filtered);
  }

  openAddSongModal() {
    const modal = document.getElementById('add-song-modal');
    if (modal) modal.classList.add('active');
  }

  closeAddSongModal() {
    const modal = document.getElementById('add-song-modal');
    if (modal) modal.classList.remove('active');
  }

  handleAddSongSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('new-song-title').value.trim();
    const composer = document.getElementById('new-song-composer').value.trim() || 'Traditional';
    const category = document.getElementById('new-song-category').value;
    const key = document.getElementById('new-song-key').value.trim();
    const timeSignature = document.getElementById('new-song-timesig').value.trim();
    const tempo = document.getElementById('new-song-tempo').value.trim();
    const chords = document.getElementById('new-song-chords').value.trim();

    store.saveSong({
      id: `song-${Date.now()}`,
      title,
      composer,
      category,
      key,
      timeSignature,
      tempo,
      chords,
      lyrics: chords,
      audioPitch: `${key}4`
    });

    this.closeAddSongModal();
    this.render();
    this.showToast(`Hymn "${title}" added to Song Library!`, 'success');
  }

  // ==========================================
  // MODULE 5: MUSIC GROUPS
  // ==========================================
  renderGroups() {
    const container = document.getElementById('groups-list-container');
    if (!container) return;

    const masses = store.getMasses();
    const arrangements = store.getArrangements();

    container.innerHTML = DEFAULT_MUSIC_GROUPS.map(g => {
      const assignedMasses = masses.filter(m => m.assignedGroupId === g.id);
      const groupArrangements = arrangements.filter(a => a.groupId === g.id);

      return `
        <div class="dash-panel-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 1.6rem;">${g.avatar}</span>
              <div>
                <h4 style="font-size: 1.05rem; font-weight: 800;">${g.name}</h4>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Director: ${g.director}</span>
              </div>
            </div>
            <span class="badge-pill badge-blue">${g.membersCount} Members</span>
          </div>

          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.85rem; line-height: 1.4;">
            ${g.description}
          </p>

          <div style="background: var(--bg-surface-subtle); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 0.85rem; font-size: 0.78rem;">
            <div>⏰ <strong>Rehearsals:</strong> ${g.rehearsalTime}</div>
            <div style="margin-top: 3px;">📅 <strong>Assigned Masses:</strong> ${assignedMasses.length} celebrations</div>
            <div style="margin-top: 3px;">🎼 <strong>Arrangements Repertoire:</strong> ${groupArrangements.length} submitted</div>
          </div>

          <div style="margin-bottom: 0.85rem;">
            <strong style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Members Roster:</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.35rem;">
              ${g.roster ? g.roster.map(m => `
                <span style="background: var(--bg-surface); border: 1px solid var(--border-color); font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 4px;">
                  ${m.name} (${m.role})
                </span>
              `).join('') : ''}
            </div>
          </div>

          <button class="btn-outline" style="width: 100%; font-size: 0.8rem; padding: 0.35rem;" onclick="app.promptAddMember('${g.id}')">
            + Add Member
          </button>
        </div>
      `;
    }).join('');
  }

  promptAddMember(groupId) {
    const name = prompt('Enter member full name:');
    if (!name) return;
    const role = prompt('Enter voice part / role (e.g. Soprano, Cantor, Keyboardist):') || 'Member';
    store.addMemberToGroup(groupId, { name, role });
    this.showToast(`Added ${name} to group roster!`, 'success');
    this.render();
  }

  // ==========================================
  // MODULE 6: APPROVAL SYSTEM (COORDINATOR)
  // ==========================================
  renderApprovals() {
    const container = document.getElementById('approvals-cards-container');
    if (!container) return;

    const arrangements = store.getArrangements();
    const pending = arrangements.filter(a => a.status === 'submitted' || a.status === 'reviewed');
    const approved = arrangements.filter(a => a.status === 'approved');

    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.75rem;">
          Awaiting Review & Approvals (${pending.length})
        </h3>
        ${pending.length === 0 ? `
          <div style="background: var(--bg-surface); padding: 2rem; text-align: center; border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
            <span style="font-size: 2rem;">🎉</span>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.5rem;">All submitted arrangements have been reviewed and approved!</p>
          </div>
        ` : pending.map(arr => {
          const mass = store.getMassById(arr.massId);
          const group = store.getGroupById(arr.groupId);
          return `
            <div class="dash-panel-card" style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <h4 style="font-size: 1.05rem; font-weight: 800;">${mass ? mass.theme : arr.massTitle}</h4>
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                    Date: ${mass ? (mass.displayDate || mass.date) : arr.massDate} &bull; Choir: <strong>${group ? group.name : arr.groupName}</strong>
                  </div>
                </div>
                <span class="badge-pill badge-orange">${arr.status.toUpperCase()}</span>
              </div>

              <!-- Hymns Summary -->
              <div style="background: var(--bg-surface-subtle); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.82rem; margin-bottom: 1rem;">
                <strong>Programmed Hymns Preview:</strong>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.35rem; margin-top: 0.35rem;">
                  <div>🚪 Entrance: <em>${arr.songs && arr.songs.entrance ? arr.songs.entrance.title : 'None'}</em></div>
                  <div>✨ Gloria: <em>${arr.songs && arr.songs.gloria ? arr.songs.gloria.title : 'None'}</em></div>
                  <div>📖 Psalm: <em>${arr.songs && arr.songs.psalm ? arr.songs.psalm.title : 'None'}</em></div>
                  <div>🍞 Offertory: <em>${arr.songs && arr.songs.offertory ? arr.songs.offertory.title : 'None'}</em></div>
                  <div>🍷 Communion: <em>${arr.songs && arr.songs.communion ? arr.songs.communion.title : 'None'}</em></div>
                  <div>🚶 Recessional: <em>${arr.songs && arr.songs.recessional ? arr.songs.recessional.title : 'None'}</em></div>
                </div>
              </div>

              <!-- Coordinator Actions -->
              <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
                <button class="btn-primary" onclick="app.coordinatorApprove('${arr.id}')">
                  ✅ Approve Programme
                </button>
                <button class="btn-outline" onclick="app.coordinatorMakeCorrections('${arr.id}')">
                  ✏️ Review & Make Corrections
                </button>
                <button class="btn-outline" onclick="app.copyWhatsAppSummary('${arr.id}')">
                  📱 WhatsApp Summary
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div>
        <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.75rem;">
          Approved Official Programmes (${approved.length})
        </h3>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${approved.map(arr => {
            const mass = store.getMassById(arr.massId);
            return `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-color); padding: 0.85rem 1.15rem; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <strong>${mass ? mass.theme : arr.massTitle}</strong> &bull; <span style="font-size: 0.8rem; color: var(--text-muted);">${mass ? (mass.displayDate || mass.date) : arr.massDate}</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  <span class="badge-pill badge-green">Approved Official</span>
                  <button class="btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="app.switchActiveMassArrangement('${arr.id}'); app.navigateTo('arrangement');">View 13 Parts</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  coordinatorApprove(arrId) {
    store.approveArrangement(arrId, 'Mr. Gabriel Mensah (Music Coordinator)', 'Approved as official Mass music programme.');
    this.showToast('Arrangement approved! Published as official programme for students & musicians.', 'success');
    this.render();
  }

  coordinatorMakeCorrections(arrId) {
    this.activeArrangementId = arrId;
    this.navigateTo('arrangement');
    this.showToast('Editing mode active: Make corrections to any of the 13 parts before approving.', 'info');
  }

  // ==========================================
  // MODULE 7: ARCHIVE (SEARCH & REUSE)
  // ==========================================
  renderArchive(filterTerm = '') {
    const container = document.getElementById('archive-list-container');
    if (!container) return;

    const term = (filterTerm || document.getElementById('archive-search-input')?.value || '').toLowerCase();
    const allMasses = store.getMasses();

    const filtered = allMasses.filter(m => {
      return !term || m.theme.toLowerCase().includes(term) || (m.occasion && m.occasion.toLowerCase().includes(term)) || m.date.includes(term);
    });

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Occasion / Theme</th>
            <th>Liturgical Season</th>
            <th>Assigned Choir</th>
            <th>Status</th>
            <th style="text-align: right;">Archive Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(m => {
            const group = store.getGroupById(m.assignedGroupId);
            return `
              <tr>
                <td><strong>${m.displayDate || m.date}</strong></td>
                <td>${m.theme}</td>
                <td><span class="badge-pill badge-green">${m.season}</span></td>
                <td>${group ? group.name : 'School Choir'}</td>
                <td><span class="badge-pill badge-green">Completed</span></td>
                <td style="text-align: right;">
                  <button class="btn-primary" style="font-size: 0.75rem; padding: 0.3rem 0.65rem;" onclick="app.openReuseModal('${m.arrangementId}')" title="Reuse all 13 song selections for an upcoming Mass">
                    🔄 Reuse Arrangement
                  </button>
                  <button class="btn-outline" style="font-size: 0.75rem; padding: 0.3rem 0.65rem;" onclick="app.printArchivedProgramme('${m.arrangementId}')">
                    🖨️ Print Programme
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  filterArchive(term) {
    this.renderArchive(term);
  }

  // --- Reuse Arrangement Modal ---
  openReuseModal(sourceArrId) {
    const sourceArr = store.getArrangementById(sourceArrId);
    if (!sourceArr) return;

    const modal = document.getElementById('reuse-arrangement-modal');
    const titleEl = document.getElementById('reuse-source-title');
    const selectEl = document.getElementById('reuse-target-mass-id');
    const hiddenId = document.getElementById('reuse-source-arr-id');

    if (modal && selectEl) {
      if (titleEl) titleEl.textContent = `"${sourceArr.massTitle}"`;
      if (hiddenId) hiddenId.value = sourceArr.id;

      // Upcoming masses that can receive this arrangement
      const upcoming = store.getMasses().filter(m => !m.date.startsWith('2024'));
      selectEl.innerHTML = upcoming.map(m => `
        <option value="${m.id}">${m.displayDate || m.date} — ${m.theme} (${m.venue})</option>
      `).join('');

      modal.classList.add('active');
    }
  }

  closeReuseModal() {
    const modal = document.getElementById('reuse-arrangement-modal');
    if (modal) modal.classList.remove('active');
  }

  handleReuseArrangementSubmit(e) {
    e.preventDefault();
    const sourceId = document.getElementById('reuse-source-arr-id').value;
    const targetMassId = document.getElementById('reuse-target-mass-id').value;

    const newArr = store.reuseArrangement(sourceId, targetMassId);
    this.closeReuseModal();

    if (newArr) {
      this.activeArrangementId = newArr.id;
      this.showToast('Reused past arrangement! 13 hymns loaded into upcoming Mass.', 'success');
      this.navigateTo('arrangement');
    }
  }

  printArchivedProgramme(arrId) {
    this.activeArrangementId = arrId;
    this.navigateTo('arrangement');
    setTimeout(() => window.print(), 300);
  }

  printCurrentProgramme() {
    window.print();
  }

  // ==========================================
  // CHORD VIEWER & AUDIO SYNTHESIZER
  // ==========================================
  openChordModal(songId, partId = null) {
    let song = songId ? store.getSongById(songId) : null;
    if (!song && partId) {
      const arr = store.getArrangementById(this.activeArrangementId);
      const s = arr && arr.songs ? arr.songs[partId] : null;
      if (s) {
        song = store.getSongs().find(item => item.title.toLowerCase() === s.title.toLowerCase()) || {
          title: s.title,
          composer: 'Liturgical Hymn',
          key: s.key || 'G',
          tempo: s.tempo || '100',
          lyrics: s.title,
          chords: `[Verse 1]\n${s.key}        C        D        ${s.key}\n${s.title} sung in joyful praise!`
        };
      }
    }
    if (!song) song = store.getSongs()[0];

    this.currentSongInModal = song;
    this.chordTransposeOffset = 0;

    const modal = document.getElementById('chord-viewer-modal');
    const content = document.getElementById('chord-modal-content');
    if (!modal || !content) return;

    this.renderChordModalContent();
    modal.classList.add('active');
  }

  closeChordModal() {
    const modal = document.getElementById('chord-viewer-modal');
    if (modal) modal.classList.remove('active');
    audioSynth.stop();
  }

  renderChordModalContent() {
    const song = this.currentSongInModal;
    if (!song) return;
    const content = document.getElementById('chord-modal-content');
    if (!content) return;

    const transposedKey = this.transposeNote(song.key, this.chordTransposeOffset);
    const transposedChords = this.transposeChordText(song.chords || song.lyrics, this.chordTransposeOffset);

    content.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">${song.title}</h3>
          <p style="font-size: 0.78rem; color: var(--text-muted);">Composer: ${song.composer} &bull; Key: <strong>${transposedKey}</strong> &bull; Tempo: ${song.tempo || '100'}</p>
        </div>
      </div>

      <!-- Controls -->
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; align-items: center;">
        <button class="btn-outline" style="padding: 0.3rem 0.65rem; font-size: 0.8rem;" onclick="app.shiftTranspose(-1)">♭ -1</button>
        <button class="btn-outline" style="padding: 0.3rem 0.65rem; font-size: 0.8rem;" onclick="app.resetTranspose()">Reset Key</button>
        <button class="btn-outline" style="padding: 0.3rem 0.65rem; font-size: 0.8rem;" onclick="app.shiftTranspose(1)">♯ +1</button>
        <button class="btn-primary" style="padding: 0.3rem 0.75rem; font-size: 0.8rem; margin-left: auto;" onclick="audioSynth.playPitchPipe('${transposedKey}4')">
          🔊 Sound Pitch (${transposedKey})
        </button>
      </div>

      <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; font-family: var(--font-mono); font-size: 0.88rem; line-height: 1.7; white-space: pre-wrap; max-height: 320px; overflow-y: auto;">
${transposedChords}
      </div>
    `;
  }

  shiftTranspose(delta) {
    this.chordTransposeOffset += delta;
    this.renderChordModalContent();
  }

  resetTranspose() {
    this.chordTransposeOffset = 0;
    this.renderChordModalContent();
  }

  transposeNote(note, semitones) {
    if (!note || semitones === 0) return note;
    const scale = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    const base = note.replace(/m|maj|dim|aug|[0-9]/g, '').trim();
    let idx = scale.indexOf(base);
    if (idx === -1) return note;
    let newIdx = (idx + semitones) % 12;
    if (newIdx < 0) newIdx += 12;
    return scale[newIdx];
  }

  transposeChordText(text, semitones) {
    if (!text || semitones === 0) return text;
    const chordRegex = /\b([A-G][#b]?)(m|maj|min|dim|aug|[0-9]+)?\b/g;
    return text.replace(chordRegex, (m, root, ext = '') => {
      return this.transposeNote(root, semitones) + ext;
    });
  }

  // ==========================================
  // PHONE PREVIEW (IPHONE MOCKUP)
  // ==========================================
  renderPhoneMockupContent() {
    const container = document.getElementById('iphone-mockup-content');
    if (!container) return;

    const arr = store.getArrangementById(this.activeArrangementId) || DEFAULT_ARRANGEMENTS[0];
    const mass = store.getMassById(arr.massId);
    const songs = arr.songs || {};

    container.innerHTML = `
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <img src="assets/logo.jpg" alt="Crest" style="width: 28px; height: 28px; border-radius: 4px;">
          <div>
            <div style="font-size: 0.82rem; font-weight: 800; color: #0f172a; line-height: 1;">OLAG SHS</div>
            <div style="font-size: 0.65rem; color: #64748b;">Mass Music</div>
          </div>
        </div>
        <img src="assets/avatar.jpg" alt="Faith" style="width: 28px; height: 28px; border-radius: 50%;">
      </div>

      <!-- Greeting -->
      <div style="margin-bottom: 1rem;">
        <h3 style="font-size: 1.05rem; font-weight: 800; color: #0f172a;">Good morning, Emmanuel! 👋</h3>
        <p style="font-size: 0.75rem; color: #64748b;">Here's today's Mass arrangement.</p>
      </div>

      <!-- Chalice Card -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.85rem; display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <img src="assets/chalice.jpg" alt="Chalice" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
        <div>
          <h4 style="font-size: 0.9rem; font-weight: 800; color: #0f172a;">${mass ? mass.theme : arr.massTitle}</h4>
          <div style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">${mass ? (mass.displayDate || mass.date) : arr.massDisplayDate} &bull; 7:00 AM</div>
          <div style="font-size: 0.68rem; color: #64748b;">${mass ? mass.venue : 'School Chapel'}</div>
          <span class="badge-pill badge-green" style="font-size: 0.62rem; padding: 0.1rem 0.45rem; margin-top: 4px;">
            ${arr.status === 'approved' ? 'Approved' : 'Official'}
          </span>
        </div>
      </div>

      <!-- Mass Parts List on Phone -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <h4 style="font-size: 0.85rem; font-weight: 800; color: #0f172a;">Mass Parts (13)</h4>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.45rem;">
        ${MASS_PARTS.map(part => {
          const s = songs[part.id] || { title: 'Not assigned', key: 'G' };
          return `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.6rem 0.75rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer;" onclick="app.openChordModal('${s.songId || ''}', '${part.id}')">
              <div>
                <div style="font-size: 0.68rem; font-weight: 700; color: #2563eb;">${part.order}. ${part.name}</div>
                <div style="font-size: 0.78rem; font-weight: 700; color: #0f172a;">${s.title}</div>
              </div>
              <span style="color: #94a3b8; font-size: 0.8rem;">&rsaquo;</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // --- Mass Details Modal ---
  openMassDetailsModal(massId) {
    const mass = store.getMassById(massId) || DEFAULT_MASSES[0];
    const group = store.getGroupById(mass.assignedGroupId);

    const modal = document.getElementById('mass-details-modal');
    if (!modal) return;

    document.getElementById('modal-mass-header-date').textContent = `Mass Details – ${mass.displayDate || mass.date}`;
    document.getElementById('modal-mass-theme').textContent = mass.theme;
    document.getElementById('modal-mass-time-venue').textContent = `${mass.time} • ${mass.venue}`;
    document.getElementById('modal-mass-celebrant').textContent = mass.celebrant;
    document.getElementById('modal-mass-group').textContent = group ? group.name : 'School Choir';
    document.getElementById('modal-mass-season').textContent = mass.season ? (mass.season.charAt(0).toUpperCase() + mass.season.slice(1)) : 'Easter';

    modal.classList.add('active');
  }

  closeMassDetailsModal() {
    const modal = document.getElementById('mass-details-modal');
    if (modal) modal.classList.remove('active');
  }

  openArrangementFromModal() {
    this.closeMassDetailsModal();
    this.navigateTo('arrangement');
  }

  // --- WhatsApp Summary Copy ---
  copyWhatsAppSummary(arrId) {
    const arr = store.getArrangementById(arrId) || DEFAULT_ARRANGEMENTS[0];
    const mass = store.getMassById(arr.massId);
    const group = store.getGroupById(arr.groupId);

    let text = `⛪ *OUR LADY OF GRACE SENIOR HIGH SCHOOL (OLAG)*\n` +
      `🎵 *SCHOOL MASS MUSIC MANAGEMENT SYSTEM (SMMMS)*\n` +
      `════════════════════════════\n` +
      `📅 *Occasion:* ${mass ? mass.theme : arr.massTitle} (${mass ? (mass.displayDate || mass.date) : arr.massDisplayDate})\n` +
      `⏰ *Time:* ${mass ? mass.time : '7:00 AM'} • ${mass ? mass.venue : 'School Chapel'}\n` +
      `✝️ *Celebrant:* ${mass ? mass.celebrant : 'Fr. Emmanuel K. Aidoo'}\n` +
      `👥 *Choir:* ${group ? group.name : arr.groupName}\n` +
      `════════════════════════════\n`;

    MASS_PARTS.forEach(part => {
      const s = arr.songs ? arr.songs[part.id] : null;
      if (s && s.title) {
        text += `${part.order}. ${part.name}: *${s.title}* (Key ${s.key || 'G'}, ${s.timeSig || '4/4'})\n`;
      }
    });

    text += `════════════════════════════\n` +
      `Status: *${arr.status === 'approved' ? 'APPROVED OFFICIAL PROGRAMME ✅' : 'PENDING REVIEW ⏳'}*`;

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Copied WhatsApp summary to clipboard!', 'success');
    }).catch(() => {
      alert(text);
    });
  }

  // ==========================================
  // MODULE: USER ACCESS & ADMIN APPROVALS
  // ==========================================
  renderUsers() {
    this.renderUsersTable(this.currentUserFilter || 'all', this.currentUserSearch || '');
  }

  renderUsersTable(filter = 'all', searchQuery = '') {
    const container = document.getElementById('users-table-container');
    const totalCountEl = document.getElementById('admin-total-users-count');
    const pendingCountEl = document.getElementById('admin-pending-users-count');
    const approvedCountEl = document.getElementById('admin-approved-users-count');
    const filterPendingCountEl = document.getElementById('user-filter-pending-count');

    this.currentUserFilter = filter;
    this.currentUserSearch = searchQuery;

    const allUsers = store.getUsers();
    const pendingUsers = allUsers.filter(u => u.status === 'pending');
    const approvedUsers = allUsers.filter(u => u.status === 'approved');

    if (totalCountEl) totalCountEl.textContent = allUsers.length;
    if (pendingCountEl) pendingCountEl.textContent = pendingUsers.length;
    if (approvedCountEl) approvedCountEl.textContent = approvedUsers.length;
    if (filterPendingCountEl) filterPendingCountEl.textContent = pendingUsers.length;

    if (!container) return;

    let filtered = allUsers;

    // Filter by tab
    if (filter === 'pending') {
      filtered = filtered.filter(u => u.status === 'pending');
    } else if (filter === 'approved') {
      filtered = filtered.filter(u => u.status === 'approved');
    } else if (filter === 'chaplain') {
      filtered = filtered.filter(u => u.role === 'chaplain');
    } else if (filter === 'coordinator') {
      filtered = filtered.filter(u => u.role === 'coordinator');
    } else if (filter === 'group') {
      filtered = filtered.filter(u => u.role === 'group' || u.role === 'student');
    }

    // Search query
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.groupName && u.groupName.toLowerCase().includes(q)) ||
        (u.voicePart && u.voicePart.toLowerCase().includes(q)) ||
        (u.roleLabel && u.roleLabel.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 2.5rem 1rem; text-align: center; color: var(--text-muted);">
          <span style="font-size: 2rem;">🔍</span>
          <p style="margin-top: 0.5rem; font-size: 0.9rem;">No user accounts match your filter criteria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="overflow-x: auto;">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 28%;">User / Ministry Profile</th>
              <th style="width: 18%;">System Role</th>
              <th style="width: 18%;">Assigned Choir / Group</th>
              <th style="width: 16%;">Approval Status</th>
              <th style="width: 20%; text-align: right;">Administrator Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(u => {
              const isApproved = u.status === 'approved';
              const isPending = u.status === 'pending';
              const isRejected = u.status === 'rejected';

              let statusBadge = '';
              if (isApproved) {
                statusBadge = `<span class="badge-pill badge-green">Approved Active ✅</span>`;
              } else if (isPending) {
                statusBadge = `<span class="badge-pill badge-orange">Pending Review ⏳</span>`;
              } else {
                statusBadge = `<span class="badge-pill badge-orange" style="background:#fee2e2; color:#b91c1c;">Rejected ❌</span>`;
              }

              let roleIcon = '👤';
              if (u.role === 'chaplain') roleIcon = '✝️';
              else if (u.role === 'coordinator') roleIcon = '📋';
              else if (u.role === 'admin') roleIcon = '⚙️';
              else if (u.role === 'group') roleIcon = '🎵';

              return `
                <tr style="${isPending ? 'background: #fffbeb;' : ''}">
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                      <img src="${u.avatar || 'assets/avatar.jpg'}" alt="${u.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);">
                      <div>
                        <strong style="color: var(--text-main); font-size: 0.88rem;">${u.name}</strong>
                        <div style="font-size: 0.72rem; color: var(--text-muted);">${u.email}</div>
                        ${u.voicePart ? `<div style="font-size: 0.68rem; color: var(--text-secondary); margin-top: 1px;">🎙️ ${u.voicePart}</div>` : ''}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-main);">
                      ${roleIcon} ${u.roleLabel || u.role}
                    </span>
                    <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">
                      Registered: ${u.registeredDate || 'May 2025'}
                    </div>
                  </td>
                  <td>
                    <span style="font-size: 0.8rem; color: var(--text-main); font-weight: 500;">
                      ${u.groupName || 'Unassigned / Staff'}
                    </span>
                  </td>
                  <td>
                    ${statusBadge}
                    ${isApproved && u.approvedBy ? `
                      <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">
                        By ${u.approvedBy}
                      </div>
                    ` : ''}
                    ${isPending ? `
                      <div style="font-size: 0.65rem; color: #b45309; margin-top: 2px;">
                        Requires Admin Action
                      </div>
                    ` : ''}
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 0.4rem; justify-content: flex-end; flex-wrap: wrap;">
                      ${isPending ? `
                        <button class="btn-primary" style="font-size: 0.72rem; padding: 0.25rem 0.55rem; background: #10b981; border-color: #10b981;" onclick="app.approveUser('${u.id}')" title="Approve this account">
                          ✅ Approve
                        </button>
                        <button class="btn-outline" style="font-size: 0.72rem; padding: 0.25rem 0.55rem; color: #dc2626; border-color: #fca5a5;" onclick="app.rejectUser('${u.id}')" title="Reject access">
                          ❌ Reject
                        </button>
                      ` : ''}
                      ${isApproved ? `
                        <button class="btn-outline" style="font-size: 0.72rem; padding: 0.25rem 0.55rem;" onclick="app.setPendingUser('${u.id}')" title="Revoke approval and put back on pending lock">
                          ⏳ Revoke
                        </button>
                        <button class="btn-outline" style="font-size: 0.72rem; padding: 0.25rem 0.55rem;" onclick="store.setCurrentUser('${u.id}'); app.render(); app.navigateTo('dashboard'); app.showToast('Switched to ${u.name}', 'info');" title="Simulate login as this user">
                          👤 Switch
                        </button>
                      ` : ''}
                      ${isRejected ? `
                        <button class="btn-primary" style="font-size: 0.72rem; padding: 0.25rem 0.55rem; background: #10b981; border-color: #10b981;" onclick="app.approveUser('${u.id}')" title="Re-approve this account">
                          ✅ Re-Approve
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  filterUsersTable(filter, btn) {
    const tabs = document.querySelectorAll('#user-filter-tabs button');
    tabs.forEach(t => {
      t.className = 'btn-outline';
      t.style.padding = '0.25rem 0.65rem';
      t.style.fontSize = '0.75rem';
    });
    if (btn) {
      btn.className = 'btn-primary';
      btn.style.padding = '0.25rem 0.65rem';
      btn.style.fontSize = '0.75rem';
    }
    const searchVal = document.getElementById('user-search-input')?.value || '';
    this.renderUsersTable(filter, searchVal);
  }

  searchUsers(query) {
    this.renderUsersTable(this.currentUserFilter || 'all', query);
  }

  // --- Admin Approval Handlers ---
  approveUser(userId) {
    const adminUser = store.getUserById('usr-admin') || { name: 'System Administrator' };
    const user = store.approveUser(userId, adminUser.name);
    if (user) {
      this.showToast(`Approved ${user.name} (${user.roleLabel}). Full application access is now unlocked!`, 'success');
      this.render();
    }
  }

  rejectUser(userId) {
    const user = store.rejectUser(userId, 'Registration unverified by school administration.');
    if (user) {
      this.showToast(`Rejected registration for ${user.name}.`, 'info');
      this.render();
    }
  }

  setPendingUser(userId) {
    const user = store.setPendingUser(userId);
    if (user) {
      this.showToast(`Revoked approval for ${user.name}. Account is now locked in pending status.`, 'info');
      this.render();
    }
  }

  switchToAdminAndApprove(userId) {
    store.approveUser(userId, 'System Administrator');
    const user = store.getUserById(userId);
    this.showToast(`✅ Approved account for ${user ? user.name : 'user'}! Full access unlocked.`, 'success');
    this.render();
    this.navigateTo('dashboard');
  }

  // --- User Registration Modal Handlers ---
  openRegisterUserModal() {
    const modal = document.getElementById('register-user-modal');
    if (modal) {
      modal.classList.add('active');
      document.getElementById('register-user-form')?.reset();
    }
  }

  closeRegisterUserModal() {
    const modal = document.getElementById('register-user-modal');
    if (modal) modal.classList.remove('active');
  }

  handleRoleChangeInRegisterModal(role) {
    const groupCol = document.getElementById('reg-group-col');
    const voiceInput = document.getElementById('reg-user-voice');

    if (role === 'chaplain') {
      if (groupCol) groupCol.style.display = 'none';
      if (voiceInput) voiceInput.placeholder = 'e.g. Priest Celebrant / Assistant Priest';
    } else if (role === 'coordinator') {
      if (groupCol) groupCol.style.display = 'none';
      if (voiceInput) voiceInput.placeholder = 'e.g. Choir Director / Organist';
    } else {
      if (groupCol) groupCol.style.display = 'block';
      if (voiceInput) voiceInput.placeholder = 'e.g. Soprano / Alto / Tenor / Bass / Instrumentalist';
    }
  }

  handleRegisterUserSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('reg-user-name')?.value.trim();
    const email = document.getElementById('reg-user-email')?.value.trim();
    const role = document.getElementById('reg-user-role')?.value;
    const groupSelect = document.getElementById('reg-user-group');
    const groupId = (role === 'group' && groupSelect) ? groupSelect.value : null;
    const groupName = groupId ? groupSelect.options[groupSelect.selectedIndex].text : (role === 'chaplain' ? 'Chaplaincy Department' : 'Music Administration');
    const voicePart = document.getElementById('reg-user-voice')?.value.trim() || (role === 'chaplain' ? 'Priest Celebrant' : (role === 'coordinator' ? 'Music Coordinator' : 'Member'));
    const notes = document.getElementById('reg-user-notes')?.value.trim() || 'New applicant awaiting Admin clearance.';

    const roleLabelMap = {
      group: 'Music Group Member',
      coordinator: 'Music Coordinator',
      chaplain: 'School Chaplain & Celebrant'
    };

    const newUser = store.registerUser({
      name,
      email,
      role,
      roleLabel: roleLabelMap[role] || role,
      groupId,
      groupName,
      voicePart,
      notes
    });

    this.closeRegisterUserModal();
    this.showToast(`Registration submitted for ${newUser.name}! In accordance with policy, the Administrator must approve this account before access is granted.`, 'info');

    // Switch account to the newly registered user to demonstrate the pending approval security lock screen!
    store.setCurrentUser(newUser.id);
    this.render();
    this.navigateTo('dashboard');
  }

  // --- Chaplain Liturgical Notes Modal ---
  openChaplainNotesModal(massId) {
    const mass = store.getMassById(massId);
    if (!mass) return;

    const modal = document.getElementById('chaplain-notes-modal');
    if (!modal) return;

    document.getElementById('chaplain-notes-mass-id').value = mass.id;
    document.getElementById('chaplain-notes-mass-theme').textContent = `Mass: ${mass.theme} (${mass.displayDate || mass.date})`;
    document.getElementById('chaplain-notes-text').value = mass.chaplainNotes || '';

    modal.classList.add('active');
  }

  closeChaplainNotesModal() {
    const modal = document.getElementById('chaplain-notes-modal');
    if (modal) modal.classList.remove('active');
  }

  handleSaveChaplainNotes(e) {
    e.preventDefault();
    const massId = document.getElementById('chaplain-notes-mass-id')?.value;
    const notes = document.getElementById('chaplain-notes-text')?.value.trim();

    store.updateMassChaplainNotes(massId, notes);
    this.closeChaplainNotesModal();
    this.showToast('Celebrant liturgical instructions saved and communicated to music group.', 'success');
    this.render();
  }

  // --- Chaplain Pastoral Endorsement Modal ---
  openChaplainEndorseModal(massId) {
    const mass = store.getMassById(massId);
    if (!mass) return;

    const modal = document.getElementById('chaplain-endorse-modal');
    if (!modal) return;

    document.getElementById('chaplain-endorse-mass-id').value = mass.id;
    document.getElementById('chaplain-endorse-mass-title').textContent = `${mass.theme} • ${mass.displayDate || mass.date} • ${mass.venue}`;

    modal.classList.add('active');
  }

  closeChaplainEndorseModal() {
    const modal = document.getElementById('chaplain-endorse-modal');
    if (modal) modal.classList.remove('active');
  }

  confirmChaplainEndorsement() {
    const massId = document.getElementById('chaplain-endorse-mass-id')?.value;
    const currentUser = store.getCurrentUser();
    const chaplainName = currentUser.name || 'Fr. Emmanuel K. Aidoo (Chaplain)';

    store.endorseMassArrangement(massId, 'Pastoral Blessing and Liturgical Endorsement granted.', chaplainName);
    this.closeChaplainEndorseModal();
    this.showToast('✝️ Pastoral Blessing and Liturgical Endorsement granted!', 'success');
    this.render();
  }

  resetDemoData() {
    if (confirm('Reset system to default OLAG SMMMS demo data?')) {
      store.resetToDefault();
      this.showToast('Reset to default OLAG SMMMS datasets.', 'success');
      this.render();
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    const icon = type === 'success' ? '✅' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new SMMMSApp();
});
