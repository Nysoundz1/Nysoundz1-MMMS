// Dedicated Dashboard Controller for Music Coordinator
// File: js/dashboards/coordinator-dashboard.js
// Persona: Mr. Faith Mensah (Music Coordinator & Organist)
// Aesthetic: Clean, Simple, Focused Music Coordination Experience

class CoordinatorDashboardController {
  constructor() {
    this.activeTab = 'phases'; // 'phases' | 'pipeline' | 'choirs'
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

  setTab(tab) {
    this.activeTab = tab;
    this.render();
  }

  render() {
    const container = document.getElementById('coordinator-dashboard-container');
    if (!container) return;

    const masses = store.getMasses();
    const arrangements = store.getArrangements();
    const upcoming = masses.find(m => m.date >= '2025-05-25') || masses[0];
    const targetArr = store.getArrangementById(upcoming.arrangementId) || arrangements[0];
    const songs = targetArr?.songs || {};

    const pendingReviewCount = arrangements.filter(a => a.status === 'submitted').length;

    container.innerHTML = `
      <!-- 1. Sleek Compact Action Header -->
      <div class="compact-action-header" style="border-left: 4px solid #2563eb;">
        <div class="compact-header-left">
          <div class="compact-header-icon" style="background: rgba(37, 99, 235, 0.1); color: #2563eb;">
            🎼
          </div>
          <div>
            <h1 class="compact-header-title">${upcoming.theme}</h1>
            <div class="compact-header-subtitle">
              <span>📅 ${upcoming.displayDate} • ${upcoming.time}</span>
              <span>•</span>
              <span>👥 Assigned: <strong>${upcoming.assignedGroupName || 'Marian Voices'}</strong></span>
              <span>•</span>
              <span class="badge-pill badge-green" style="font-size: 0.7rem;">${upcoming.status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div class="compact-header-actions">
          <button class="btn btn-sm btn-primary" onclick="coordinatorApp.openCreateMassModal()" style="padding: 0.45rem 0.85rem;">
            ➕ Schedule Mass
          </button>
          <button class="btn btn-sm btn-outline" onclick="coordinatorApp.copyWhatsAppProgramme('${upcoming.id}')" style="padding: 0.45rem 0.85rem;">
            📱 WhatsApp Summary
          </button>
        </div>
      </div>

      <!-- 2. Clean Segmented Focus Tabs -->
      <div class="clean-segmented-tabs">
        <button class="clean-tab-pill ${this.activeTab === 'phases' ? 'active' : ''}" onclick="coordinatorApp.setTab('phases')">
          🎼 4 Liturgical Phases & Hymn Swaps
        </button>
        <button class="clean-tab-pill ${this.activeTab === 'pipeline' ? 'active' : ''}" onclick="coordinatorApp.setTab('pipeline')">
          📊 5-Stage Approval Pipeline (${pendingReviewCount} Action Needed)
        </button>
        <button class="clean-tab-pill ${this.activeTab === 'choirs' ? 'active' : ''}" onclick="coordinatorApp.setTab('choirs')">
          👥 Choir Group Rosters
        </button>
      </div>

      <!-- 3. Focused Tab Content -->
      ${this.activeTab === 'phases' ? this.renderPhasesTab(upcoming, songs) : ''}
      ${this.activeTab === 'pipeline' ? this.renderPipelineTab(arrangements) : ''}
      ${this.activeTab === 'choirs' ? this.renderChoirsTab() : ''}
    `;
  }

  // TAB 1: 4 Classical Liturgical Phases with In-Line Song Swap
  renderPhasesTab(mass, songs) {
    const phases = [
      {
        name: '1. Introductory Rites',
        color: '#6366f1',
        parts: [
          { key: 'entrance', num: 1, label: 'Entrance Hymn', song: songs.entrance },
          { key: 'kyrie', num: 2, label: 'Penitential Rite (Kyrie)', song: songs.kyrie },
          { key: 'gloria', num: 3, label: 'Gloria', song: songs.gloria }
        ]
      },
      {
        name: '2. Liturgy of the Word',
        color: '#059669',
        parts: [
          { key: 'psalm', num: 4, label: 'Responsorial Psalm', song: songs.psalm },
          { key: 'alleluia', num: 5, label: 'Gospel Acclamation', song: songs.alleluia }
        ]
      },
      {
        name: '3. Liturgy of the Eucharist',
        color: '#ea580c',
        parts: [
          { key: 'offertory', num: 6, label: 'Offertory Hymn', song: songs.offertory },
          { key: 'sanctus', num: 7, label: 'Sanctus (Holy, Holy)', song: songs.sanctus },
          { key: 'mystery', num: 8, label: 'Memorial Acclamation', song: songs.mystery },
          { key: 'amen', num: 9, label: 'Great Amen', song: songs.amen },
          { key: 'agnus', num: 10, label: 'Agnus Dei (Lamb of God)', song: songs.agnus },
          { key: 'communion', num: 11, label: 'Communion Hymn', song: songs.communion },
          { key: 'thanksgiving', num: 12, label: 'Thanksgiving Hymn', song: songs.thanksgiving }
        ]
      },
      {
        name: '4. Concluding Rites',
        color: '#7c3aed',
        parts: [
          { key: 'recessional', num: 13, label: 'Recessional Hymn', song: songs.recessional }
        ]
      }
    ];

    return `
      <div class="liturgical-phases-grid">
        ${phases.map(p => `
          <div class="phase-card">
            <div class="phase-card-header" style="border-top: 3px solid ${p.color};">
              <h3 class="phase-card-title">${p.name}</h3>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${p.parts.length} Songs</span>
            </div>
            <div class="phase-song-list">
              ${p.parts.map(item => `
                <div class="phase-song-row">
                  <div class="phase-song-meta">
                    <span class="phase-song-num">${item.num}</span>
                    <div style="min-width: 0;">
                      <div class="phase-song-title">${item.song?.title || 'No song selected'}</div>
                      <div class="phase-song-part-label">${item.label}</div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="badge-pill" style="font-size: 0.68rem; padding: 2px 6px;">
                      ${item.song?.key || 'Key C'}
                    </span>
                    <button class="btn btn-sm btn-outline" onclick="coordinatorApp.openSongSwapModal('${mass.id}', '${item.key}', '${item.label}')" style="font-size: 0.72rem; padding: 0.2rem 0.45rem;" title="Swap or correct hymn">
                      ✏️ Swap
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // TAB 2: Streamlined 5-Stage Approval Pipeline Board
  renderPipelineTab(arrangements) {
    const stages = [
      { id: 'draft', label: '1. Drafts', color: '#94a3b8' },
      { id: 'submitted', label: '2. Submitted', color: '#f59e0b' },
      { id: 'under_review', label: '3. Under Review', color: '#3b82f6' },
      { id: 'approved', label: '4. Approved', color: '#10b981' }
    ];

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
        ${stages.map(stage => {
          const items = arrangements.filter(a => a.status === stage.id);
          return `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
              <div style="padding: 0.65rem 0.85rem; background: var(--bg-subtle, #f8fafc); border-bottom: 1px solid var(--border-color); border-top: 3px solid ${stage.color}; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.8rem; font-weight: 700;">${stage.label}</span>
                <span class="badge-pill" style="font-size: 0.7rem; padding: 1px 6px;">${items.length}</span>
              </div>
              <div style="padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; min-height: 120px;">
                ${items.length === 0 ? `
                  <div style="text-align: center; color: var(--text-muted); font-size: 0.78rem; padding: 1.5rem 0;">No items</div>
                ` : items.map(item => `
                  <div style="padding: 0.65rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-surface);">
                    <div style="font-weight: 600; font-size: 0.82rem; margin-bottom: 0.15rem;">${item.massTheme || item.title}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${item.groupName || 'School Choir'} • ${item.date}</div>
                    ${stage.id === 'submitted' ? `
                      <button class="btn btn-sm btn-primary" onclick="coordinatorApp.approveArrangement('${item.id}')" style="margin-top: 0.5rem; font-size: 0.72rem; padding: 0.2rem 0.5rem; width: 100%;">
                        ✅ Approve Programme
                      </button>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // TAB 3: Choir Groups & Rosters
  renderChoirsTab() {
    const groups = store.getGroups();
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
        ${groups.map(g => `
          <div class="card" style="padding: 1.25rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <h3 style="font-size: 0.95rem; font-weight: 700; margin: 0;">${g.name}</h3>
              <span class="badge-pill badge-blue" style="font-size: 0.7rem;">${g.type || 'SATB Ensemble'}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">
              Director: <strong>${g.director || 'Staff'}</strong> • Members: <strong>${g.memberCount || 24}</strong>
            </div>
            <div style="background: var(--bg-subtle, #f8fafc); border-radius: var(--radius-sm); padding: 0.6rem; font-size: 0.75rem; color: var(--text-muted);">
              Rehearsals: <strong>${g.rehearsalTime || 'Fridays 4:00 PM'}</strong> in School Chapel
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // In-line Song Swap Modal
  openSongSwapModal(massId, partKey, partLabel) {
    const songs = store.getSongs();
    const songOptions = songs.map(s => `<option value="${s.id}">${s.title} (${s.key} • ${s.category})</option>`).join('');

    const modalBox = document.createElement('div');
    modalBox.className = 'modal-backdrop';
    modalBox.style.display = 'flex';
    modalBox.id = 'song-swap-modal-box';

    modalBox.innerHTML = `
      <div class="modal-content" style="max-width: 440px;">
        <div class="modal-header">
          <h2 class="modal-title">Swap Hymn: ${partLabel}</h2>
          <button class="modal-close" onclick="document.getElementById('song-swap-modal-box').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Select a replacement Catholic hymn from the school repository:
          </p>
          <select id="swap-select-song" class="form-control" style="margin-bottom: 1rem;">
            ${songOptions}
          </select>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('song-swap-modal-box').remove()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="coordinatorApp.confirmSongSwap('${massId}', '${partKey}')">Confirm Swap</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalBox);
  }

  confirmSongSwap(massId, partKey) {
    const select = document.getElementById('swap-select-song');
    if (!select) return;
    const songId = select.value;
    const song = store.getSongById(songId);

    const mass = store.getMassById(massId);
    if (mass && mass.arrangementId) {
      const arr = store.getArrangementById(mass.arrangementId);
      if (arr && arr.songs) {
        arr.songs[partKey] = song;
        store.saveState();
        alert(`Hymn for ${partKey} updated to "${song.title}"!`);
      }
    }

    document.getElementById('song-swap-modal-box')?.remove();
    this.render();
  }

  approveArrangement(arrId) {
    store.approveArrangement(arrId);
    alert('Arrangement approved!');
    this.render();
  }

  openCreateMassModal() {
    const theme = prompt('Enter Mass Occasion / Liturgical Theme:', 'Solemnity of Corpus Christi');
    if (theme) {
      store.createMassAndAssignGroup({
        theme,
        date: '2025-06-15',
        displayDate: 'Sunday, June 15, 2025',
        time: '7:00 AM',
        assignedGroupId: 'grp-001',
        celebrant: 'Fr. Emmanuel K. Aidoo'
      });
      alert(`Mass "${theme}" scheduled successfully!`);
      this.render();
    }
  }

  copyWhatsAppProgramme(massId) {
    const text = `OLAG SHS Mass Music Programme\nSolemnity of the Most Holy Trinity\n1. Entrance: Holy, Holy, Holy (Key D)\n2. Psalm: Psalm 8 (Key F)\n3. Offertory: Take and Sanctify (Key G)\n4. Communion: Panis Angelicus (Key F)\n5. Recessional: Holy God We Praise Thy Name (Key F)`;
    navigator.clipboard?.writeText(text);
    alert('WhatsApp summary copied to clipboard!');
  }
}

// Global instance
const coordinatorApp = new CoordinatorDashboardController();
