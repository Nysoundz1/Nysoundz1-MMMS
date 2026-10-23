// Dedicated Dashboard Controller for Music Coordinator
// File: js/dashboards/coordinator-dashboard.js
// Persona: Mr. Gabriel K. Mensah (School Music Coordinator)

class CoordinatorDashboardController {
  constructor() {
    this.init();
  }

  init() {
    // Access Guard: Enforce individual Admin approval & coordinator role (or admin)
    if (typeof auth !== 'undefined') {
      const allowed = auth.requireAuth(['coordinator']);
      if (!allowed) return;
    }

    this.render();
    if (typeof auth !== 'undefined') {
      auth.renderPageHeader();
    }
  }

  render() {
    const container = document.getElementById('coordinator-dashboard-container');
    if (!container) return;

    const user = store.getCurrentUser();
    const masses = store.getMasses();
    const arrangements = store.getArrangements();
    const songs = store.getSongs();
    const pendingArrangements = arrangements.filter(a => a.status === 'submitted');

    container.innerHTML = `
      <!-- Role Quick Actions Ribbon -->
      <div class="role-quick-ribbon">
        <div class="quick-ribbon-title">
          <span>📋</span> <span>Music Direction Quick Actions</span>
        </div>
        <div class="quick-ribbon-actions">
          <button class="quick-action-chip chip-primary" onclick="coordinatorApp.openCreateMassModal()">
            ➕ Schedule Mass & Assign Choir
          </button>
          <button class="quick-action-chip" onclick="coordinatorApp.scrollToReviews()">
            📋 Review Submissions Queue (${pendingArrangements.length})
          </button>
          <button class="quick-action-chip" onclick="coordinatorApp.openAddSongModal()">
            🎵 Add Hymn to Library
          </button>
          <button class="quick-action-chip" onclick="coordinatorApp.openChoirMatrixModal()">
            👥 Choir Duty Matrix
          </button>
        </div>
      </div>

      <!-- Coordinator Hero Identity Banner -->
      <div class="role-hero-banner banner-coordinator">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">
            📋 Liturgical Music Direction & Administration
          </span>
          <h1 class="role-hero-title">Good day, ${user.name} 👋</h1>
          <p class="role-hero-subtitle">
            School Music Coordinator &bull; Schedule celebrations, assign music groups, review submissions, and manage the master song library.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn-primary" style="background: #ffffff; color: #0b152d; border-color: #ffffff;" onclick="coordinatorApp.openCreateMassModal()">
            ➕ Create Mass & Assign Group
          </button>
          <button class="btn-outline" style="color: #ffffff; border-color: rgba(255,255,255,0.4);" onclick="coordinatorApp.scrollToReviews()">
            📋 Review Queue (${pendingArrangements.length})
          </button>
        </div>
      </div>

      <!-- 4 Top Coordinator Stat Cards -->
      <div class="dash-stats-row">
        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-blue">📅</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Scheduled Masses</span>
            <div class="stat-main-value">${masses.length} Masses</div>
            <span class="stat-subtext">Liturgical calendar</span>
          </div>
        </div>

        <div class="stat-item-card" style="border-left: 3px solid #ea580c;">
          <div class="stat-icon-box stat-icon-orange">📄</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge" style="color: #ea580c;">Pending Reviews</span>
            <div class="stat-main-value" style="color: #ea580c;">${pendingArrangements.length} Queue</div>
            <span class="stat-subtext">Action required</span>
          </div>
        </div>

        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-green">👥</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Active Choirs</span>
            <div class="stat-main-value">5 Groups</div>
            <span class="stat-subtext">All ministries assigned</span>
          </div>
        </div>

        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-purple">🎼</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Master Song Library</span>
            <div class="stat-main-value">${songs.length} Hymns</div>
            <span class="stat-subtext">Catholic repertoire</span>
          </div>
        </div>
      </div>

      <!-- Centerpiece Widget: 5-Stage Liturgical Approval Pipeline Board -->
      <div class="dash-panel-card" style="margin-bottom: 1.5rem;">
        <div class="panel-header-row">
          <div>
            <h3 class="panel-header-title">📊 Liturgical Mass Music Pipeline Board</h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">
              Track progress from initial Mass creation to final Chaplain blessing across all school choirs.
            </span>
          </div>
          <button class="btn-primary" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="coordinatorApp.openCreateMassModal()">
            ➕ Schedule New Mass
          </button>
        </div>

        <div class="pipeline-board">
          <!-- Stage 1: Mass Created -->
          <div class="pipeline-col">
            <div class="pipeline-stage-header">
              <span class="pipeline-stage-title">1. Scheduled</span>
              <span class="badge-pill badge-blue" style="font-size: 0.65rem;">1</span>
            </div>
            <div class="pipeline-card" onclick="coordinatorApp.showMassDetails('Feast of Corpus Christi', 'Sun, 22 Jun 2025', 'Chapel Choir', 'Draft')">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">Feast of Corpus Christi</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Sun, 22 Jun &bull; Chapel Choir</div>
              <div style="margin-top: 6px;">
                <span class="badge-pill badge-gray" style="font-size: 0.62rem;">Choir Assigned</span>
              </div>
            </div>
          </div>

          <!-- Stage 2: Drafting 0-12/13 -->
          <div class="pipeline-col">
            <div class="pipeline-stage-header">
              <span class="pipeline-stage-title">2. Drafting</span>
              <span class="badge-pill badge-orange" style="font-size: 0.65rem;">1</span>
            </div>
            <div class="pipeline-card" onclick="coordinatorApp.showMassDetails('Trinity Sunday', 'Sun, 15 Jun 2025', 'Inspirational Band', '8/13 Selected')">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">Trinity Sunday</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Sun, 15 Jun &bull; Inspirational Band</div>
              <div style="margin-top: 6px;">
                <span class="badge-pill badge-orange" style="font-size: 0.62rem;">8 of 13 Selected</span>
              </div>
            </div>
          </div>

          <!-- Stage 3: Submitted (13/13) -->
          <div class="pipeline-col" style="border-color: #fdba74; background: #fffaf5;">
            <div class="pipeline-stage-header">
              <span class="pipeline-stage-title" style="color: #ea580c;">3. Review Queue</span>
              <span class="badge-pill badge-orange" style="font-size: 0.65rem;">${pendingArrangements.length}</span>
            </div>
            ${pendingArrangements.map(arr => `
              <div class="pipeline-card" style="border-left: 3px solid #ea580c;" onclick="coordinatorApp.coordinatorApprove('${arr.id}')">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">${arr.massTitle}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${arr.groupName}</div>
                <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                  <span class="badge-pill badge-orange" style="font-size: 0.62rem;">13 Parts Ready</span>
                  <span style="font-size: 0.7rem; color: #2563eb; font-weight: 700;">Review &rarr;</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Stage 4: Reviewed & Corrected -->
          <div class="pipeline-col">
            <div class="pipeline-stage-header">
              <span class="pipeline-stage-title">4. Approved</span>
              <span class="badge-pill badge-green" style="font-size: 0.65rem;">1</span>
            </div>
            <div class="pipeline-card" onclick="coordinatorApp.showMassDetails('Easter Sunday Mass', 'Sun, 25 May 2025', 'School Choir', 'Approved')">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">Easter Sunday Mass</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Sun, 25 May &bull; School Choir</div>
              <div style="margin-top: 6px;">
                <span class="badge-pill badge-green" style="font-size: 0.62rem;">Approved by Coordinator</span>
              </div>
            </div>
          </div>

          <!-- Stage 5: Chaplain Blessed -->
          <div class="pipeline-col" style="border-color: #86efac; background: #f0fdf4;">
            <div class="pipeline-stage-header">
              <span class="pipeline-stage-title" style="color: #15803d;">5. Blessed</span>
              <span class="badge-pill badge-green" style="font-size: 0.65rem;">1</span>
            </div>
            <div class="pipeline-card" style="border-left: 3px solid #10b981;">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">Easter Vigil High Mass</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">Combined Choirs</div>
              <div style="margin-top: 6px;">
                <span class="pastoral-endorsement-badge" style="font-size: 0.62rem;">✝️ Pastoral Blessing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2 Panels Row: Review Queue & Assignment Matrix -->
      <div class="dash-panels-row">
        <!-- Left: Urgent Arrangement Review & Approvals Queue -->
        <div class="dash-panel-card" id="reviews-queue-panel">
          <div class="panel-header-row">
            <h3 class="panel-header-title">Submissions Awaiting Coordinator Review (${pendingArrangements.length})</h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">Verify hymns before granting approval</span>
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
                  <button class="btn-primary" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="coordinatorApp.coordinatorApprove('${arr.id}')">
                    ✅ Approve Programme
                  </button>
                  <button class="btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="coordinatorApp.openSwapHymnModal('${arr.id}')">
                    ✏️ Review & Swap Hymn
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
            <span style="font-size: 0.78rem; color: var(--text-muted);">Upcoming celebrations</span>
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
            <button class="btn-outline" style="width: 100%; font-size: 0.78rem;" onclick="coordinatorApp.openCreateMassModal()">
              ➕ Assign Another Celebration
            </button>
          </div>
        </div>
      </div>
    `;
  }

  scrollToReviews() {
    document.getElementById('reviews-queue-panel')?.scrollIntoView({ behavior: 'smooth' });
  }

  coordinatorApprove(arrId) {
    const arr = store.getArrangementById(arrId);
    if (arr) {
      arr.status = 'approved';
      arr.reviewedBy = 'Mr. Gabriel K. Mensah (Coordinator)';
      arr.reviewedDate = new Date().toISOString().split('T')[0];
      const mass = store.getMassById(arr.massId);
      if (mass) mass.status = 'approved';
      store.saveState();
      this.showToast(`✅ Approved Mass arrangement for ${arr.groupName}! Ready for Chaplain blessing.`, 'success');
      this.render();
    }
  }

  openSwapHymnModal(arrId) {
    const arr = store.getArrangementById(arrId);
    if (!arr) return;
    const newHymn = prompt('In-Line Hymn Correction: Enter replacement Offertory or Entrance hymn title for this arrangement:', 'Take Our Bread');
    if (newHymn) {
      if (arr.songs && arr.songs.offertory) {
        arr.songs.offertory.title = newHymn;
      }
      store.saveState();
      this.showToast(`Updated arrangement hymn to "${newHymn}".`, 'success');
      this.render();
    }
  }

  showMassDetails(theme, date, group, status) {
    alert(`Mass: ${theme}\nDate: ${date}\nAssigned Group: ${group}\nStatus: ${status}`);
  }

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
    const date = document.getElementById('new-mass-date')?.value;
    const time = document.getElementById('new-mass-time')?.value;
    const theme = document.getElementById('new-mass-theme')?.value;
    const season = document.getElementById('new-mass-season')?.value;
    const groupId = document.getElementById('new-mass-group')?.value;
    const celebrant = document.getElementById('new-mass-celebrant')?.value;
    const venue = document.getElementById('new-mass-venue')?.value;

    const newMass = store.addMass({
      date,
      time,
      theme,
      season,
      assignedGroupId: groupId,
      celebrant,
      venue,
      status: 'assigned'
    });

    this.closeCreateMassModal();
    this.showToast(`Created celebration: "${newMass.theme}" and notified music group!`, 'success');
    this.render();
  }

  openAddSongModal() {
    const modal = document.getElementById('add-song-modal');
    if (modal) modal.classList.add('active');
  }

  closeAddSongModal() {
    const modal = document.getElementById('add-song-modal');
    if (modal) modal.classList.remove('active');
  }

  openChoirMatrixModal() {
    window.location.href = 'index.html#groups';
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

let coordinatorApp;
document.addEventListener('DOMContentLoaded', () => {
  coordinatorApp = new CoordinatorDashboardController();
});
