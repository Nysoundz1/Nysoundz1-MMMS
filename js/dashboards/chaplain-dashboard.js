// Dedicated Dashboard Controller for School Chaplain & Priest Celebrant
// File: js/dashboards/chaplain-dashboard.js
// Persona: Fr. Emmanuel K. Aidoo (School Chaplain & Celebrant)

class ChaplainDashboardController {
  constructor() {
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

  render() {
    const container = document.getElementById('chaplain-dashboard-container');
    if (!container) return;

    const user = store.getCurrentUser();
    const masses = store.getMasses();
    const arrangements = store.getArrangements();
    const myMasses = masses.filter(m => m.celebrant && m.celebrant.includes('Aidoo'));
    const nextCelebration = myMasses.find(m => m.date >= '2025-05-25') || myMasses[0] || masses[0];
    const endorsedCount = masses.filter(m => m.chaplainEndorsed).length;
    const pendingEndorseCount = masses.filter(m => !m.chaplainEndorsed && m.status === 'approved').length;
    const targetArr = store.getArrangementById(nextCelebration.arrangementId) || arrangements[0];
    const songs = targetArr?.songs || {};

    container.innerHTML = `
      <!-- Role Quick Actions Ribbon -->
      <div class="role-quick-ribbon">
        <div class="quick-ribbon-title">
          <span>✝️</span> <span>Chaplaincy Pastoral Shortcuts</span>
        </div>
        <div class="quick-ribbon-actions">
          <button class="quick-action-chip chip-primary" onclick="chaplainApp.scrollToReadings()">
            📖 Sunday Lectionary Readings
          </button>
          <button class="quick-action-chip" onclick="chaplainApp.openChaplainNotesModal('${nextCelebration.id}')">
            ✍️ Celebrant Note to Choir
          </button>
          <button class="quick-action-chip chip-green" onclick="chaplainApp.openChaplainEndorseModal('${nextCelebration.id}')">
            ✝️ Grant Pastoral Blessing
          </button>
          <button class="quick-action-chip" onclick="chaplainApp.printCurrentProgramme()">
            🖨️ Print Leaflet
          </button>
        </div>
      </div>

      <!-- Chaplain Hero Identity Banner with Dynamic Liturgical Season -->
      <div class="role-hero-banner banner-chaplain">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">
            ✝️ Catholic Liturgical & Pastoral Oversight
          </span>
          <h1 class="role-hero-title">Pax Christi, ${user.name} 👋</h1>
          <p class="role-hero-subtitle">
            School Chaplain & Priest Celebrant &bull; Oversee sacred Scripture readings, verify hymn theological harmony, and grant pastoral liturgical blessings.
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
        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-blue">✝️</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Masses as Celebrant</span>
            <div class="stat-main-value">${myMasses.length} Masses</div>
            <span class="stat-subtext">School Chapel</span>
          </div>
        </div>

        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-green">📜</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Liturgical Readings</span>
            <div class="stat-main-value">Year C</div>
            <span class="stat-subtext">Lectionary Alignment</span>
          </div>
        </div>

        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-orange">🕊️</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Pastoral Endorsements</span>
            <div class="stat-main-value">${endorsedCount} Endorsed</div>
            <span class="stat-subtext">${pendingEndorseCount} Awaiting blessing</span>
          </div>
        </div>

        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-purple">👥</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Ministering Choirs</span>
            <div class="stat-main-value">5 Groups</div>
            <span class="stat-subtext">Liturgical ministries</span>
          </div>
        </div>
      </div>

      <!-- Centerpiece Widget: Side-by-Side Scripture & Hymn Theological Alignment -->
      <div class="dash-panel-card" id="scripture-alignment-panel" style="margin-bottom: 1.5rem;">
        <div class="panel-header-row">
          <div>
            <h3 class="panel-header-title">📖 Sunday Lectionary Readings & Hymn Theological Alignment</h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">
              ${nextCelebration.theme} &bull; ${nextCelebration.displayDate || nextCelebration.date} &bull; St. Thomas Aquinas Chapel
            </span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            ${nextCelebration.chaplainEndorsed ? `
              <span class="pastoral-endorsement-badge">✝️ Pastoral Blessing Granted</span>
            ` : `
              <button class="btn-primary" style="font-size: 0.75rem; background: #10b981; border-color: #10b981;" onclick="chaplainApp.openChaplainEndorseModal('${nextCelebration.id}')">
                ✝️ Grant Pastoral Blessing
              </button>
            `}
            <button class="btn-outline" style="font-size: 0.75rem;" onclick="chaplainApp.openChaplainNotesModal('${nextCelebration.id}')">
              ✍️ Celebrant Note
            </button>
          </div>
        </div>

        <div class="scripture-hymn-split">
          <!-- Left: Lectionary Readings (Year C) -->
          <div class="scripture-column">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <strong style="font-size: 0.88rem; color: var(--text-main);">📜 Holy Scripture Readings (Lectionary)</strong>
              <span class="badge-pill badge-blue" style="font-size: 0.68rem;">Year C</span>
            </div>

            <div class="scripture-reading-item">
              <div style="font-size: 0.72rem; font-weight: 700; color: #2563eb; text-transform: uppercase;">First Reading</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-top: 2px;">Acts 10:34a, 37-43</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 3px; line-height: 1.4;">
                "Peter proceeded to speak and said: 'You know what has happened all over Judea... He commissioned us to preach to the people and testify that he is the one appointed by God as judge of the living and the dead.'"
              </div>
            </div>

            <div class="scripture-reading-item" style="border-left-color: #10b981;">
              <div style="font-size: 0.72rem; font-weight: 700; color: #10b981; text-transform: uppercase;">Responsorial Psalm</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-top: 2px;">Psalm 118: 1-2, 16-17, 22-23</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 3px; line-height: 1.4;">
                <strong>Response:</strong> <em>"This is the day the Lord has made; let us rejoice and be glad in it."</em>
              </div>
            </div>

            <div class="scripture-reading-item" style="border-left-color: #8b5cf6;">
              <div style="font-size: 0.72rem; font-weight: 700; color: #8b5cf6; text-transform: uppercase;">Second Reading</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-top: 2px;">Colossians 3:1-4</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 3px; line-height: 1.4;">
                "Brothers and sisters: If then you were raised with Christ, seek what is above, where Christ is seated at the right hand of God."
              </div>
            </div>

            <div class="scripture-reading-item" style="border-left-color: #dc2626;">
              <div style="font-size: 0.72rem; font-weight: 700; color: #dc2626; text-transform: uppercase;">Holy Gospel</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-top: 2px;">John 20:1-9</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 3px; line-height: 1.4;">
                "On the first day of the week, Mary of Magdala came to the tomb early in the morning, while it was still dark, and saw the stone removed from the tomb."
              </div>
            </div>
          </div>

          <!-- Right: Choir Hymns Selected (Theological Match) -->
          <div class="hymn-column">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <strong style="font-size: 0.88rem; color: var(--text-main);">🎵 Choir Selected Hymns</strong>
              <span class="badge-pill badge-green" style="font-size: 0.68rem;">School Choir</span>
            </div>

            <div class="hymn-align-row">
              <div>
                <div style="font-size: 0.7rem; font-weight: 700; color: #2563eb;">1. Entrance Hymn</div>
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">${songs.entrance?.title || 'Christ the Lord Is Risen Today'}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Theological Theme: Resurrection Proclamation</div>
              </div>
              <span class="badge-pill badge-green" style="font-size: 0.65rem;">Conforms ✅</span>
            </div>

            <div class="hymn-align-row">
              <div>
                <div style="font-size: 0.7rem; font-weight: 700; color: #10b981;">4. Responsorial Psalm</div>
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">${songs.psalm?.title || 'Psalm 118: This Is the Day'}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Matches Lectionary Response exact text</div>
              </div>
              <span class="badge-pill badge-green" style="font-size: 0.65rem;">Direct Match ✅</span>
            </div>

            <div class="hymn-align-row">
              <div>
                <div style="font-size: 0.7rem; font-weight: 700; color: #8b5cf6;">6. Offertory Hymn</div>
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">${songs.offertory?.title || 'Take Our Bread'}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Sacrificial Presentation of Gifts</div>
              </div>
              <span class="badge-pill badge-green" style="font-size: 0.65rem;">Conforms ✅</span>
            </div>

            <div class="hymn-align-row">
              <div>
                <div style="font-size: 0.7rem; font-weight: 700; color: #dc2626;">11. Communion Hymn</div>
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">${songs.communion?.title || 'I Am the Bread of Life'}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Eucharistic Solemnity & Reverence</div>
              </div>
              <span class="badge-pill badge-green" style="font-size: 0.65rem;">Conforms ✅</span>
            </div>

            <div class="hymn-align-row">
              <div>
                <div style="font-size: 0.7rem; font-weight: 700; color: #d97706;">13. Recessional Hymn</div>
                <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">${songs.recessional?.title || 'Sing with All the Saints in Glory'}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">Easter Mission Sending Forth</div>
              </div>
              <span class="badge-pill badge-green" style="font-size: 0.65rem;">Conforms ✅</span>
            </div>

            <div style="margin-top: 0.85rem; display: flex; gap: 0.5rem;">
              <button class="btn-primary" style="flex: 1; font-size: 0.75rem;" onclick="chaplainApp.openAll13PartsModal()">
                Inspect Full 13-Part Score &rarr;
              </button>
              <button class="btn-outline" style="font-size: 0.75rem;" onclick="chaplainApp.printCurrentProgramme()">
                🖨️ Print Order of Service
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Celebrant Upcoming Liturgies List -->
      <div class="dash-panel-card" style="margin-bottom: 1.5rem;">
        <div class="panel-header-row">
          <h3 class="panel-header-title">Celebrant Upcoming Masses & Ministries on Duty</h3>
          <span style="font-size: 0.78rem; color: var(--text-muted);">School Chapel &bull; OLAG SHS</span>
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
                      <button class="btn-primary" style="font-size: 0.72rem; padding: 0.2rem 0.55rem; background: #10b981; border-color: #10b981;" onclick="chaplainApp.openChaplainEndorseModal('${m.id}')">
                        ✝️ Endorse
                      </button>
                    `}
                  </div>
                </div>

                <div class="readings-box-strip">
                  📖 <strong>Liturgical Readings:</strong> ${m.readings || 'Proper readings for the Sunday'}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; font-size: 0.78rem;">
                  <div>👥 <strong>Music Group:</strong> ${group ? group.name : 'School Choir'}</div>
                  <button class="btn-outline" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;" onclick="chaplainApp.openChaplainNotesModal('${m.id}')">
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

      <!-- Sacred Music Pastoral Guidance Reminder -->
      <div class="reminder-banner">
        <span style="font-size: 1.1rem;">✝️</span>
        <span>
          <strong>Pastoral Guidance for Liturgical Music:</strong> Sacred music in the Catholic liturgy serves the glory of God and the sanctification of the faithful. Ensure all chosen texts are rooted in Holy Scripture and liturgical tradition.
        </span>
      </div>
    `;
  }

  scrollToReadings() {
    document.getElementById('scripture-alignment-panel')?.scrollIntoView({ behavior: 'smooth' });
  }

  openAll13PartsModal() {
    window.location.href = 'index.html#arrangement';
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

  printCurrentProgramme() {
    window.print();
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

let chaplainApp;
document.addEventListener('DOMContentLoaded', () => {
  chaplainApp = new ChaplainDashboardController();
});
