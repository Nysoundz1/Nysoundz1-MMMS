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

    // Role switcher dropdown
    const roleSelect = document.getElementById('user-role-select');
    const userDisplayName = document.getElementById('user-display-name');
    if (roleSelect) {
      roleSelect.value = store.state.currentRole;
      roleSelect.addEventListener('change', (e) => {
        const roleId = e.target.value;
        store.setRole(roleId);
        const roleObj = USER_ROLES.find(r => r.id === roleId) || USER_ROLES[0];
        if (userDisplayName) {
          userDisplayName.textContent = roleObj.title;
        }
        this.showToast(`Switched view to ${roleObj.title} (${roleObj.subtitle})`, 'success');
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
        settings: 'Settings'
      };
      titleEl.textContent = titleMap[view] || 'Dashboard';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render() {
    this.renderDashboard();
    this.renderSchedule();
    this.renderArrangement();
    this.renderSongsTable();
    this.renderGroups();
    this.renderApprovals();
    this.renderArchive();
    this.renderPhoneMockupContent();
  }

  // ==========================================
  // MODULE 1: DASHBOARD
  // ==========================================
  renderDashboard() {
    const masses = store.getMasses();
    const arrangements = store.getArrangements();
    const songs = store.getSongs();

    const upcomingMass = masses.find(m => m.date >= '2025-05-25') || masses[0];
    const targetArr = upcomingMass ? store.getArrangementById(upcomingMass.arrangementId) : arrangements[0];
    const pendingCount = arrangements.filter(a => a.status === 'submitted').length;

    // Badge count in sidebar
    const navBadge = document.getElementById('nav-approvals-badge');
    if (navBadge) {
      navBadge.textContent = pendingCount;
      navBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    const pendingEl = document.getElementById('dash-pending-count');
    if (pendingEl) pendingEl.textContent = pendingCount;

    const songsCountEl = document.getElementById('dash-songs-count');
    if (songsCountEl) songsCountEl.textContent = songs.length;

    // Today's Arrangement 5-Part Preview
    const previewContainer = document.getElementById('dash-preview-parts-list');
    if (previewContainer && targetArr && targetArr.songs) {
      const previewKeys = ['entrance', 'kyrie', 'gloria', 'psalm', 'gospel_acclamation'];
      previewContainer.innerHTML = previewKeys.map(k => {
        const partMeta = MASS_PARTS.find(p => p.id === k);
        const songData = targetArr.songs[k] || { title: 'Not assigned', performer: 'Choir' };
        return `
          <div class="preview-part-row">
            <span class="part-name-label">${partMeta ? partMeta.order + '. ' + partMeta.name : k}</span>
            <span class="part-song-label">${songData.title}</span>
            <span class="part-performer-label">${songData.performer || 'Choir'}</span>
          </div>
        `;
      }).join('');
    }
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
