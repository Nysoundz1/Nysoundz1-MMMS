// Dedicated Dashboard Controller for School Chaplain & Priest Celebrant
// File: js/dashboards/chaplain-dashboard.js
// Persona: Fr. Emmanuel K. Aidoo (School Chaplain & Celebrant)
// Aesthetic: Clean, Simple, Focused Liturgical Catholic Experience

class ChaplainDashboardController {
  constructor() {
    this.activeTab = 'readings'; // 'readings' | 'phases' | 'notes'
    this.init();
  }

  init() {
    // Access Guard: Enforce individual Admin approval & chaplain role (or admin)
    if (typeof auth !== 'undefined') {
      const allowed = auth.requireAuth(['chaplain']);
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
    const container = document.getElementById('chaplain-dashboard-container');
    if (!container) return;

    const masses = store.getMasses();
    const arrangements = store.getArrangements();
    const myMasses = masses.filter(m => m.celebrant && m.celebrant.includes('Aidoo'));
    const nextCelebration = myMasses.find(m => m.date >= '2025-05-25') || myMasses[0] || masses[0];
    const targetArr = store.getArrangementById(nextCelebration.arrangementId) || arrangements[0];
    const songs = targetArr?.songs || {};

    const isEndorsed = nextCelebration.chaplainEndorsed;

    container.innerHTML = `
      <!-- 1. Sleek Compact Action Header -->
      <div class="compact-action-header" style="border-left: 4px solid #7c3aed;">
        <div class="compact-header-left">
          <div class="compact-header-icon" style="background: rgba(124, 58, 237, 0.1); color: #7c3aed;">
            ✝️
          </div>
          <div>
            <h1 class="compact-header-title">${nextCelebration.theme}</h1>
            <div class="compact-header-subtitle">
              <span>📅 ${nextCelebration.displayDate} • ${nextCelebration.time}</span>
              <span>•</span>
              <span>👥 Choir: <strong>${nextCelebration.assignedGroupName || 'Marian Voices'}</strong></span>
              <span>•</span>
              <span>${isEndorsed ? '<span class="badge-pill badge-green" style="font-size: 0.7rem;">✝️ Pastoral Blessing Granted</span>' : '<span class="badge-pill badge-orange" style="font-size: 0.7rem;">⏳ Endorsement Pending</span>'}</span>
            </div>
          </div>
        </div>

        <div class="compact-header-actions">
          ${!isEndorsed ? `
            <button class="btn btn-sm btn-primary" onclick="chaplainApp.openChaplainEndorseModal('${nextCelebration.id}')" style="background: #059669; border-color: #059669; padding: 0.45rem 0.85rem;">
              ✝️ Grant Pastoral Blessing
            </button>
          ` : `
            <button class="btn btn-sm btn-outline" onclick="chaplainApp.openChaplainNotesModal('${nextCelebration.id}')" style="padding: 0.45rem 0.85rem;">
              ✍️ Celebrant Directives
            </button>
          `}
          <button class="btn btn-sm btn-outline" onclick="chaplainApp.printCurrentProgramme()" style="padding: 0.45rem 0.85rem;">
            🖨️ Print Leaflet
          </button>
        </div>
      </div>

      <!-- 2. Clean Segmented Focus Tabs -->
      <div class="clean-segmented-tabs">
        <button class="clean-tab-pill ${this.activeTab === 'readings' ? 'active' : ''}" onclick="chaplainApp.setTab('readings')">
          📖 Sunday Lectionary Readings (Year C)
        </button>
        <button class="clean-tab-pill ${this.activeTab === 'phases' ? 'active' : ''}" onclick="chaplainApp.setTab('phases')">
          🎼 4 Liturgical Rites & Hymns
        </button>
        <button class="clean-tab-pill ${this.activeTab === 'notes' ? 'active' : ''}" onclick="chaplainApp.setTab('notes')">
          ✍️ Celebrant Directives (${nextCelebration.chaplainNotes ? '1' : '0'})
        </button>
      </div>

      <!-- 3. Focused Tab Content -->
      ${this.activeTab === 'readings' ? this.renderReadingsTab(nextCelebration, songs) : ''}
      ${this.activeTab === 'phases' ? this.renderPhasesTab(songs) : ''}
      ${this.activeTab === 'notes' ? this.renderNotesTab(nextCelebration) : ''}
    `;
  }

  // TAB 1: Sunday Lectionary Scripture Readings & Theological Alignment
  renderReadingsTab(mass, songs) {
    return `
      <!-- Theological Alignment Highlight Callout -->
      <div style="background: rgba(124, 58, 237, 0.05); border: 1px solid rgba(124, 58, 237, 0.2); border-radius: var(--radius-md); padding: 0.85rem 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
        <div style="font-size: 0.85rem; color: var(--text-main);">
          <strong>🕊️ Theological Hymn Alignment:</strong> Entrance hymn <em>"${songs.entrance?.title || 'Holy, Holy, Holy'}"</em> & Communion hymn <em>"${songs.communion?.title || 'Panis Angelicus'}"</em> directly reflect today's Trinitarian Gospel (John 16:12-15).
        </div>
        <button class="btn btn-sm btn-outline" onclick="chaplainApp.setTab('phases')" style="font-size: 0.75rem; padding: 0.25rem 0.6rem;">
          View All 13 Hymn Parts →
        </button>
      </div>

      <!-- 4 Scripture Readings Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem;">
        <!-- 1st Reading -->
        <div class="card" style="padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <span class="badge-pill badge-purple" style="font-size: 0.7rem;">First Reading</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: #7c3aed;">Proverbs 8:22-31</span>
          </div>
          <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.55; margin: 0;">
            <em>"The Lord created me at the beginning of his work, the first of his acts of long ago. Before the mountains were settled, I was brought forth..."</em>
          </p>
        </div>

        <!-- Responsorial Psalm -->
        <div class="card" style="padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <span class="badge-pill badge-blue" style="font-size: 0.7rem;">Responsorial Psalm</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: #2563eb;">Psalm 8:4-9</span>
          </div>
          <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.55; margin: 0;">
            <strong>Response:</strong> <em>"O Lord, our God, how majestic is your name through all the earth!"</em>
          </p>
        </div>

        <!-- 2nd Reading -->
        <div class="card" style="padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <span class="badge-pill badge-purple" style="font-size: 0.7rem;">Second Reading</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: #7c3aed;">Romans 5:1-5</span>
          </div>
          <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.55; margin: 0;">
            <em>"Since we are justified by faith, we have peace with God through our Lord Jesus Christ... God's love has been poured into our hearts through the Holy Spirit."</em>
          </p>
        </div>

        <!-- Gospel Passage -->
        <div class="card" style="padding: 1.25rem; border-left: 4px solid #ea580c;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
            <span class="badge-pill badge-orange" style="font-size: 0.7rem;">Holy Gospel</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: #ea580c;">John 16:12-15</span>
          </div>
          <p style="font-size: 0.86rem; color: var(--text-muted); line-height: 1.55; margin: 0;">
            <em>"When the Spirit of truth comes, he will guide you into all the truth. He will not speak on his own, but will speak whatever he hears... All that the Father has is mine."</em>
          </p>
        </div>
      </div>
    `;
  }

  // TAB 2: The 13 Mass Parts Grouped into 4 Classical Catholic Liturgical Phases
  renderPhasesTab(songs) {
    const phases = [
      {
        name: '1. Introductory Rites',
        color: '#6366f1',
        parts: [
          { num: 1, name: 'Entrance Hymn', song: songs.entrance },
          { num: 2, name: 'Penitential Rite (Kyrie)', song: songs.kyrie },
          { num: 3, name: 'Gloria', song: songs.gloria }
        ]
      },
      {
        name: '2. Liturgy of the Word',
        color: '#059669',
        parts: [
          { num: 4, name: 'Responsorial Psalm', song: songs.psalm },
          { num: 5, name: 'Gospel Acclamation', song: songs.alleluia }
        ]
      },
      {
        name: '3. Liturgy of the Eucharist',
        color: '#ea580c',
        parts: [
          { num: 6, name: 'Offertory Hymn', song: songs.offertory },
          { num: 7, name: 'Sanctus (Holy, Holy)', song: songs.sanctus },
          { num: 8, name: 'Memorial Acclamation', song: songs.mystery },
          { num: 9, name: 'Great Amen', song: songs.amen },
          { num: 10, name: 'Agnus Dei (Lamb of God)', song: songs.agnus },
          { num: 11, name: 'Communion Hymn', song: songs.communion },
          { num: 12, name: 'Thanksgiving Hymn', song: songs.thanksgiving }
        ]
      },
      {
        name: '4. Concluding Rites',
        color: '#7c3aed',
        parts: [
          { num: 13, name: 'Recessional Hymn', song: songs.recessional }
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
                    <div>
                      <div class="phase-song-title">${item.song?.title || 'Selection Pending'}</div>
                      <div class="phase-song-part-label">${item.name}</div>
                    </div>
                  </div>
                  <div>
                    <span class="badge-pill" style="font-size: 0.68rem; padding: 2px 6px;">
                      ${item.song?.key || 'Key C'}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // TAB 3: Celebrant Directives & Pastoral Notes
  renderNotesTab(mass) {
    return `
      <div class="card" style="max-width: 680px; margin: 0 auto; padding: 1.5rem;">
        <h3 style="font-size: 1.05rem; font-weight: 700; margin: 0 0 0.5rem;">
          ✍️ Celebrant Note & Instructions to Music Director
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          These pastoral instructions appear at the top of the choir director's console and rehearsal sheets.
        </p>

        <div style="background: var(--bg-subtle, #f8fafc); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
          ${mass.chaplainNotes ? `
            <div style="font-size: 0.9rem; color: var(--text-main); line-height: 1.6;">
              "${mass.chaplainNotes}"
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
              — Fr. Emmanuel K. Aidoo (School Chaplain)
            </div>
          ` : `
            <div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
              No special celebrant note entered yet for this celebration.
            </div>
          `}
        </div>

        <button class="btn btn-primary" onclick="chaplainApp.openChaplainNotesModal('${mass.id}')">
          ✏️ Edit Celebrant Note
        </button>
      </div>
    `;
  }

  // Modals
  openChaplainEndorseModal(massId) {
    const mass = store.getMassById(massId);
    if (!mass) return;

    if (confirm(`Grant pastoral blessing and final celebrant approval for "${mass.theme}" (${mass.displayDate})?`)) {
      store.endorseMassByChaplain(massId, 'Fr. Emmanuel K. Aidoo');
      alert(`✝️ Pastoral Blessing Granted for ${mass.theme}!`);
      this.render();
    }
  }

  openChaplainNotesModal(massId) {
    const mass = store.getMassById(massId);
    if (!mass) return;

    const currentNote = mass.chaplainNotes || 'Please ensure the Responsorial Psalm tone is sung meditatively and without rush. Communion hymn must extend through the post-communion reflection.';
    const note = prompt('Enter Celebrant Directives to the Choir Director:', currentNote);
    if (note !== null) {
      store.updateChaplainNotes(massId, note);
      this.render();
    }
  }

  printCurrentProgramme() {
    window.print();
  }
}

// Global instance
const chaplainApp = new ChaplainDashboardController();
