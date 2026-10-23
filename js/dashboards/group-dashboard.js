// Dedicated Dashboard Controller for Music Group Members & Choristers
// File: js/dashboards/group-dashboard.js
// Persona: Faith Mensah / Choristers (School Choir, Youth Choir, Chapel Choir, Inspirational Band, Cantors Guild)

class GroupDashboardController {
  constructor() {
    this.chordTransposeOffset = 0;
    this.currentSongInModal = null;
    this.init();
  }

  init() {
    // Access Guard: Enforce individual Admin approval & group member role (or admin)
    if (typeof auth !== 'undefined') {
      const allowed = auth.requireAuth(['group', 'student']);
      if (!allowed) return;
    }

    this.render();
    if (typeof auth !== 'undefined') {
      auth.renderPageHeader();
    }
  }

  render() {
    const container = document.getElementById('group-dashboard-container');
    if (!container) return;

    const user = store.getCurrentUser();
    const masses = store.getMasses();
    const arrangements = store.getArrangements();
    const myGroupId = user.groupId || 'grp-school-choir';
    const myGroup = store.getGroupById(myGroupId);
    const assignedMasses = masses.filter(m => m.assignedGroupId === myGroupId);
    const nextMass = assignedMasses.find(m => m.date >= '2025-05-25') || assignedMasses[0] || masses[0];
    const targetArr = nextMass ? store.getArrangementById(nextMass.arrangementId) : arrangements[0];
    const songs = targetArr?.songs || {};

    container.innerHTML = `
      <!-- Role Quick Actions Ribbon -->
      <div class="role-quick-ribbon">
        <div class="quick-ribbon-title">
          <span>🎵</span> <span>Chorister Rehearsal Shortcuts</span>
        </div>
        <div class="quick-ribbon-actions">
          <button class="quick-action-chip chip-primary" onclick="groupApp.openArrangementEditor()">
            🎼 Open 13-Part Mass Editor
          </button>
          <button class="quick-action-chip" onclick="audioSynth.playPitchTone('G4')">
            🔊 Sound G4 Pitch
          </button>
          <button class="quick-action-chip" onclick="groupApp.openChordModal('song-easter-1')">
            🎸 Transpose Chords
          </button>
          <button class="quick-action-chip" onclick="groupApp.copyWhatsAppSummary('${targetArr?.id || 'arr-2025-05-25'}')">
            📱 Copy WhatsApp Summary
          </button>
        </div>
      </div>

      <!-- Musician Hero Identity Banner -->
      <div class="role-hero-banner banner-group">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">
            🎵 Choir Loft & Musician Rehearsal Portal
          </span>
          <h1 class="role-hero-title">Good day, ${user.name}! 👋</h1>
          <p class="role-hero-subtitle">
            ${myGroup ? myGroup.name : 'School Choir'} &bull; ${user.voicePart || 'Soprano Section'} &bull; Rehearse your 13 Mass parts, sound pitch tones, and prepare lead sheets.
          </p>
        </div>
        <div>
          <button class="btn-primary" style="background: #ffffff; color: #064e3b; border-color: #ffffff;" onclick="groupApp.openArrangementEditor()">
            🎼 Open 13-Part Arrangement
          </button>
        </div>
      </div>

      <!-- 4 Top Musician Stat Cards -->
      <div class="dash-stats-row">
        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-blue">📅</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Next Assigned Mass</span>
            <div class="stat-main-value">${nextMass ? (nextMass.displayDate || nextMass.date) : 'Sun, 25 May'}</div>
            <span class="stat-subtext">${nextMass ? nextMass.theme : 'Easter Sunday'}</span>
          </div>
        </div>

        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-green">🎵</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Arrangement Status</span>
            <div class="stat-main-value">${targetArr ? targetArr.status.toUpperCase() : 'APPROVED'}</div>
            <span class="stat-subtext">13 Parts Completed</span>
          </div>
        </div>

        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-orange">⏰</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Choir Rehearsal</span>
            <div class="stat-main-value">Thurs 4:30 PM</div>
            <span class="stat-subtext">School Chapel</span>
          </div>
        </div>

        <div class="stat-item-card">
          <div class="stat-icon-box stat-icon-purple">🎹</div>
          <div class="stat-content-meta">
            <span class="stat-label-badge">Voice Section</span>
            <div class="stat-main-value">${user.voicePart ? user.voicePart.split(' ')[0] : 'Soprano'}</div>
            <span class="stat-subtext">SATB Harmonization</span>
          </div>
        </div>
      </div>

      <!-- Centerpiece Widget: Interactive 13-Part Rehearsal Prep Card with Embedded Pitch Buttons -->
      <div class="dash-panel-card" style="margin-bottom: 1.5rem;">
        <div class="panel-header-row">
          <div>
            <h3 class="panel-header-title">🎵 13-Part Mass Rehearsal & Pitch Practice Card</h3>
            <span style="font-size: 0.78rem; color: var(--text-muted);">
              ${nextMass ? nextMass.theme : 'Easter Sunday'} &bull; Click any hymn's pitch badge to sound its key tone before singing.
            </span>
          </div>
          <button class="btn-primary" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="groupApp.openArrangementEditor()">
            Open 13-Part Editor &rarr;
          </button>
        </div>

        <!-- 13-Part Progress Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem;">
          <span>Mass Parts Preparation Progress</span>
          <span style="color: #10b981;">13 of 13 Parts Complete (100%)</span>
        </div>
        <div class="prep-progress-bar-wrap">
          <div class="prep-progress-bar-fill" style="width: 100%;"></div>
        </div>

        <!-- 13 Mass Parts List with Embedded Web Audio Pitch Triggers -->
        <div style="display: flex; flex-direction: column; gap: 0.45rem;">
          ${MASS_PARTS.map(part => {
            const s = songs[part.id] || { title: 'Assigned Hymn', key: 'G', tempo: 120 };
            return `
              <div class="prep-part-item">
                <div style="display: flex; align-items: center; gap: 0.65rem;">
                  <span style="font-size: 0.75rem; font-weight: 800; color: #2563eb; width: 22px;">${part.order}.</span>
                  <div>
                    <div style="font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${part.name}</div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">${s.title}</div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <button class="pitch-trigger-tag" onclick="audioSynth.playPitchTone('${s.key || 'G'}4')" title="Sound Key ${s.key || 'G'} pitch pipe tone">
                    🔊 Key ${s.key || 'G'}
                  </button>
                  <button class="btn-outline" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;" onclick="groupApp.openChordModal('${s.songId || 'song-easter-1'}', '${part.id}')" title="View transposable chords">
                    🎸 Chords
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 2 Panels Row: Next Mass Summary & Musician Audio Synthesizer -->
      <div class="dash-panels-row">
        <!-- Left: Next Mass Summary -->
        <div class="dash-panel-card">
          <div class="panel-header-row">
            <h3 class="panel-header-title">Next Celebration Overview</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Assigned to ${myGroup ? myGroup.name : 'School Choir'}</span>
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

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn-primary" onclick="groupApp.openArrangementEditor()">
              Open 13-Part Editor &rarr;
            </button>
            <button class="btn-outline" onclick="groupApp.copyWhatsAppSummary('${targetArr?.id || 'arr-2025-05-25'}')">
              📱 Copy WhatsApp Summary
            </button>
          </div>
        </div>

        <!-- Right: Choir Loft Pitch Synthesizer -->
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
            <button class="btn-primary" style="font-size: 0.75rem; width: 100%;" onclick="groupApp.openChordModal('song-easter-1')">
              Open Chord Viewer & Transposer
            </button>
          </div>
        </div>
      </div>
    `;
  }

  openArrangementEditor() {
    window.location.href = 'index.html#arrangement';
  }

  // --- Transposable Chord Modal ---
  openChordModal(songId, partId = null) {
    const songs = store.getSongs();
    const song = songs.find(s => s.id === songId) || songs[0];
    this.currentSongInModal = song;
    this.chordTransposeOffset = 0;

    const modal = document.getElementById('chord-viewer-modal');
    if (!modal) {
      alert(`Song: ${song.title} (Key ${song.key})\n\n${song.chords || song.lyrics}`);
      return;
    }

    this.renderChordModalContent();
    modal.classList.add('active');
  }

  closeChordModal() {
    const modal = document.getElementById('chord-viewer-modal');
    if (modal) modal.classList.remove('active');
  }

  renderChordModalContent() {
    const song = this.currentSongInModal;
    const content = document.getElementById('chord-modal-content');
    if (!content || !song) return;

    const scale = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    let idx = scale.indexOf(song.key);
    let transposedKey = song.key;
    if (idx !== -1) {
      let newIdx = (idx + this.chordTransposeOffset) % 12;
      if (newIdx < 0) newIdx += 12;
      transposedKey = scale[newIdx];
    }

    content.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">${song.title}</h3>
          <p style="font-size: 0.78rem; color: var(--text-muted);">Composer: ${song.composer} &bull; Key: <strong>${transposedKey}</strong> &bull; Tempo: ${song.tempo || '100'} BPM</p>
        </div>
      </div>

      <!-- Controls -->
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; align-items: center;">
        <button class="btn-outline" style="padding: 0.3rem 0.65rem; font-size: 0.8rem;" onclick="groupApp.shiftTranspose(-1)">♭ -1</button>
        <button class="btn-outline" style="padding: 0.3rem 0.65rem; font-size: 0.8rem;" onclick="groupApp.resetTranspose()">Reset Key</button>
        <button class="btn-outline" style="padding: 0.3rem 0.65rem; font-size: 0.8rem;" onclick="groupApp.shiftTranspose(1)">♯ +1</button>
        <button class="btn-primary" style="padding: 0.3rem 0.75rem; font-size: 0.8rem; margin-left: auto;" onclick="audioSynth.playPitchTone('${transposedKey}4')">
          🔊 Sound Pitch (${transposedKey})
        </button>
      </div>

      <div style="background: var(--bg-surface-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; font-family: var(--font-mono); font-size: 0.88rem; line-height: 1.7; white-space: pre-wrap; max-height: 320px; overflow-y: auto;">
${song.chords || song.lyrics}
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

let groupApp;
document.addEventListener('DOMContentLoaded', () => {
  groupApp = new GroupDashboardController();
});
