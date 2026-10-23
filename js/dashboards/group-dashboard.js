// Dedicated Dashboard Controller for Music Group Member / Chorister
// File: js/dashboards/group-dashboard.js
// Persona: Emmanuel Mensah (St. Cecilia Choir - Bass)
// Aesthetic: Clean, Simple, Focused Rehearsal Desk with Progressive Disclosure

class GroupDashboardController {
  constructor() {
    this.audioCtx = null;
    this.practicedMap = {};
    this.activeTab = 'sheet';
    this.init();
  }

  setTab(tab) {
    this.activeTab = tab;
    this.render();
  }

  init() {
    // Access Guard: Enforce individual Admin approval & group role (or admin)
    if (typeof auth !== 'undefined') {
      const allowed = auth.requireAuth(['group', 'student']);
      if (!allowed) return;
    }

    // Load saved practiced checklist
    try {
      this.practicedMap = JSON.parse(localStorage.getItem('olag_chorister_prep') || '{}');
    } catch (e) {
      this.practicedMap = {};
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
    const upcoming = masses.find(m => m.date >= '2025-05-25') || masses[0];
    const targetArr = store.getArrangementById(upcoming.arrangementId) || arrangements[0];
    const songs = targetArr?.songs || {};

    // Calculate practiced readiness
    const totalParts = 13;
    const practicedCount = Object.values(this.practicedMap).filter(Boolean).length;
    const percent = Math.min(100, Math.round((practicedCount / totalParts) * 100));

    container.innerHTML = `
      <!-- 1. Sleek Compact Action Header -->
      <div class="compact-action-header" style="border-left: 4px solid #ea580c;">
        <div class="compact-header-left">
          <div class="compact-header-icon" style="background: rgba(234, 88, 12, 0.1); color: #ea580c;">
            🎵
          </div>
          <div>
            <h1 class="compact-header-title">${user?.groupName || 'St. Cecilia Choir'} &bull; ${user?.voicePart || 'Bass'}</h1>
            <div class="compact-header-subtitle">
              <span>Next Mass: <strong>${upcoming.theme}</strong> (${upcoming.displayDate})</span>
              <span>•</span>
              <span class="badge-pill ${percent >= 80 ? 'badge-green' : 'badge-orange'}" style="font-size: 0.7rem;">
                ${percent}% Readiness (${practicedCount}/${totalParts} Parts Practiced)
              </span>
            </div>
          </div>
        </div>

        <div class="compact-header-actions">
          <button class="btn btn-sm btn-outline" onclick="groupApp.copyWhatsAppProgramme()" style="padding: 0.45rem 0.85rem;">
            📱 Copy WhatsApp
          </button>
          <button class="btn btn-sm btn-outline" onclick="window.print()" style="padding: 0.45rem 0.85rem;">
            🖨️ Print Sheet
          </button>
        </div>
      </div>

      <!-- 2. Clean Segmented Focus Tabs -->
      <div class="clean-segmented-tabs">
        <button class="clean-tab-pill ${this.activeTab === 'sheet' ? 'active' : ''}" onclick="groupApp.setTab('sheet')">
          🎼 13-Part Music Checklist (${practicedCount}/${totalParts})
        </button>
        <button class="clean-tab-pill ${this.activeTab === 'audio' ? 'active' : ''}" onclick="groupApp.setTab('audio')">
          🔔 Concert Pitch Pipe & Tuning
        </button>
        <button class="clean-tab-pill ${this.activeTab === 'whatsapp' ? 'active' : ''}" onclick="groupApp.setTab('whatsapp')">
          📱 WhatsApp Notice
        </button>
      </div>

      <!-- 3. Focused Tab Content -->
      ${this.activeTab === 'sheet' ? this.renderPhasesRehearsalGrid(songs) : ''}
      ${this.activeTab === 'audio' ? this.renderAudioTuningTab() : ''}
      ${this.activeTab === 'whatsapp' ? this.renderWhatsAppTab(upcoming, songs) : ''}
    `;
  }

  renderAudioTuningTab() {
    return `
      <div class="card" style="padding: 1.5rem; text-align: center;">
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔔</div>
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem;">Concert Pitch Pipe & Choir Loft Audio Reference</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); max-width: 520px; margin: 0 auto 1.5rem;">
          Pure acoustic sine-tone reference frequencies (A4 = 440 Hz) for a cappella intonation, section key sounding, and part singing rehearsals.
        </p>

        <div style="display: flex; justify-content: center; gap: 0.65rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
          <button class="btn btn-outline" onclick="groupApp.playPitch(261.63, 'C')" style="padding: 0.65rem 1.15rem; font-weight: 800; font-size: 1rem;">
            C <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">261.6 Hz</span>
          </button>
          <button class="btn btn-outline" onclick="groupApp.playPitch(293.66, 'D')" style="padding: 0.65rem 1.15rem; font-weight: 800; font-size: 1rem;">
            D <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">293.7 Hz</span>
          </button>
          <button class="btn btn-outline" onclick="groupApp.playPitch(329.63, 'E')" style="padding: 0.65rem 1.15rem; font-weight: 800; font-size: 1rem;">
            E <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">329.6 Hz</span>
          </button>
          <button class="btn btn-outline" onclick="groupApp.playPitch(349.23, 'F')" style="padding: 0.65rem 1.15rem; font-weight: 800; font-size: 1rem;">
            F <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">349.2 Hz</span>
          </button>
          <button class="btn btn-outline" onclick="groupApp.playPitch(392.00, 'G')" style="padding: 0.65rem 1.15rem; font-weight: 800; font-size: 1rem;">
            G <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">392.0 Hz</span>
          </button>
          <button class="btn btn-outline" onclick="groupApp.playPitch(440.00, 'A')" style="padding: 0.65rem 1.15rem; font-weight: 800; font-size: 1rem; border-color: #ea580c; color: #ea580c;">
            A <span style="font-size: 0.7rem; color: #ea580c; display: block;">440.0 Hz</span>
          </button>
          <button class="btn btn-outline" onclick="groupApp.playPitch(466.16, 'Bb')" style="padding: 0.65rem 1.15rem; font-weight: 800; font-size: 1rem;">
            B♭ <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">466.2 Hz</span>
          </button>
        </div>

        <div style="font-size: 0.78rem; color: var(--text-muted); background: var(--bg-surface-subtle); padding: 0.65rem 1rem; border-radius: var(--radius-sm); max-width: 480px; margin: 0 auto;">
          💡 <em>Tip: Tap a tone to sound the pitch for your voice section during choir warm-up.</em>
        </div>
      </div>
    `;
  }

  renderWhatsAppTab(upcoming, songs) {
    const list = [
      `1. Entrance: ${songs.entrance?.title || 'Holy, Holy, Holy'} (${songs.entrance?.key || 'Key D'})`,
      `2. Kyrie: ${songs.kyrie?.title || 'Kyrie Eleison'}`,
      `3. Gloria: ${songs.gloria?.title || 'Glory to God'}`,
      `4. Psalm: ${songs.psalm?.title || 'Psalm 8'} (${songs.psalm?.key || 'Key F'})`,
      `5. Alleluia: ${songs.alleluia?.title || 'Celtic Alleluia'}`,
      `6. Offertory: ${songs.offertory?.title || 'Take and Sanctify'} (${songs.offertory?.key || 'Key G'})`,
      `7. Sanctus: ${songs.sanctus?.title || 'Holy, Holy'}`,
      `8. Mystery: ${songs.mystery?.title || 'Memorial Acclamation'}`,
      `9. Amen: ${songs.amen?.title || 'Great Amen'}`,
      `10. Agnus Dei: ${songs.agnus?.title || 'Lamb of God'}`,
      `11. Communion: ${songs.communion?.title || 'Panis Angelicus'} (${songs.communion?.key || 'Key F'})`,
      `12. Thanksgiving: ${songs.thanksgiving?.title || 'Sing of the Lord\'s Goodness'} (${songs.thanksgiving?.key || 'Key G'})`,
      `13. Recessional: ${songs.recessional?.title || 'Holy God We Praise Thy Name'} (${songs.recessional?.key || 'Key F'})`
    ].join('\n');

    return `
      <div class="card" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.05rem; font-weight: 700; margin: 0;">📱 WhatsApp Rehearsal Notice</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Formatted text ready to paste directly into your choir WhatsApp group</span>
          </div>
          <button class="btn btn-sm btn-primary" onclick="groupApp.copyWhatsAppProgramme()">
            📋 Copy to Clipboard
          </button>
        </div>

        <pre style="background: var(--bg-surface-subtle); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.15rem; font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.6; color: var(--text-main); white-space: pre-wrap; margin: 0;">
⛪ *OUR LADY OF GRACE SENIOR HIGH SCHOOL*
🎶 *MASS MUSIC PROGRAMME*
📅 *Mass:* ${upcoming.theme} (${upcoming.displayDate})
👥 *Assigned Choir:* ${upcoming.assignedGroupName || 'Marian Voices'}

══════════════════════════
${list}
══════════════════════════
_Please come along with your hymnal and be in the choir loft 30 minutes before Mass._</pre>
      </div>
    `;
  }

  renderPhasesRehearsalGrid(songs) {
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
              ${p.parts.map(item => {
                const isPracticed = !!this.practicedMap[item.key];
                return `
                  <div class="phase-song-row" style="${isPracticed ? 'background: rgba(16, 185, 129, 0.04);' : ''}">
                    <div class="phase-song-meta">
                      <input type="checkbox" 
                        id="chk-${item.key}"
                        ${isPracticed ? 'checked' : ''} 
                        onchange="groupApp.togglePracticed('${item.key}')" 
                        style="cursor: pointer; width: 16px; height: 16px; accent-color: #10b981;"
                        title="Mark as practiced"
                      />
                      <span class="phase-song-num">${item.num}</span>
                      <div style="min-width: 0;">
                        <div class="phase-song-title" style="${isPracticed ? 'text-decoration: line-through; opacity: 0.75;' : ''}">
                          ${item.song?.title || 'Selection Pending'}
                        </div>
                        <div class="phase-song-part-label">${item.label}</div>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                      <span class="badge-pill" style="font-size: 0.68rem; padding: 2px 6px;">
                        ${item.song?.key || 'Key C'}
                      </span>
                      <button class="btn btn-sm btn-outline" onclick="groupApp.previewChords('${item.song?.title || item.label}', '${item.song?.key || 'C'}')" style="font-size: 0.72rem; padding: 0.2rem 0.45rem;" title="View chords and lyrics">
                        👁️ Chords
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  togglePracticed(key) {
    this.practicedMap[key] = !this.practicedMap[key];
    try {
      localStorage.setItem('olag_chorister_prep', JSON.stringify(this.practicedMap));
    } catch (e) {}
    this.render();
  }

  playPitch(freq, noteName) {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 1.5);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  previewChords(title, key) {
    alert(`🎵 Hymn: "${title}"\nKey: ${key} • Tempo: 84 BPM\n\n[Intro]: ${key} - G - Am - F\nVerse 1: Praise to the Lord, the Almighty, the King of Creation...\nChorus: Praise Him, praise Him in the choir loft!`);
  }

  copyWhatsAppProgramme() {
    const text = `OLAG SHS Rehearsal Desk\nSolemnity of the Most Holy Trinity\nChorister Readiness Update:\n• 1. Entrance: Holy, Holy, Holy (Key D)\n• 4. Psalm: Psalm 8 (Key F)\n• 6. Offertory: Take and Sanctify (Key G)\n• 11. Communion: Panis Angelicus (Key F)\n• 13. Recessional: Holy God We Praise Thy Name (Key F)`;
    navigator.clipboard?.writeText(text);
    alert('WhatsApp summary copied to clipboard!');
  }
}

// Global instance
const groupApp = new GroupDashboardController();
