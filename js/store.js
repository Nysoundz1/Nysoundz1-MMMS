// SMMMS State Management Store with LocalStorage persistence

class MMMSStore {
  constructor() {
    this.storageKey = 'olag_smmms_state_v2';
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using default datasets', e);
    }
    return this.getInitialState();
  }

  getInitialState() {
    return {
      currentRole: 'group', // Faith Mensah default
      theme: 'light',
      seasons: DEFAULT_LITURGICAL_SEASONS,
      parts: MASS_PARTS,
      groups: DEFAULT_MUSIC_GROUPS,
      songs: DEFAULT_SONGS,
      masses: DEFAULT_MASSES,
      arrangements: DEFAULT_ARRANGEMENTS
    };
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
    this.notify();
  }

  resetToDefault() {
    this.state = this.getInitialState();
    this.saveState();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // --- Current Role & Theme ---
  setRole(roleId) {
    this.state.currentRole = roleId;
    this.saveState();
  }

  setTheme(theme) {
    this.state.theme = theme;
    this.saveState();
  }

  // --- Masses ---
  getMasses() {
    return [...this.state.masses].sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  getMassById(id) {
    return this.state.masses.find(m => m.id === id);
  }

  // Coordinator Creates Mass & Assigns Music Group
  createMassAndAssignGroup(massData) {
    const massId = massData.id || `mass-${massData.date}-${Date.now().toString().slice(-4)}`;
    const group = this.getGroupById(massData.assignedGroupId);

    const newMass = {
      id: massId,
      date: massData.date,
      displayDate: massData.displayDate || massData.date,
      time: massData.time || '7:00 AM',
      theme: massData.theme,
      season: massData.season || 'ordinary',
      occasion: massData.occasion || massData.theme,
      celebrant: massData.celebrant || 'Fr. Emmanuel K. Aidoo',
      venue: massData.venue || 'School Chapel',
      assignedGroupId: massData.assignedGroupId,
      status: 'draft',
      arrangementId: `arr-${massId}`,
      thumbnail: 'assets/chalice.jpg',
      readings: massData.readings || ''
    };

    // Initialize blank arrangement draft for the assigned group
    const initialArrangement = {
      id: `arr-${massId}`,
      massId: massId,
      massDate: massData.date,
      massDisplayDate: newMass.displayDate,
      massTitle: massData.theme,
      groupId: massData.assignedGroupId,
      groupName: group ? group.name : 'School Choir',
      status: 'draft',
      submittedAt: null,
      reviewedAt: null,
      approvedAt: null,
      reviewedBy: null,
      coordinatorNotes: '',
      songs: {}
    };

    this.state.masses.push(newMass);
    this.state.arrangements.push(initialArrangement);
    this.saveState();
    return newMass;
  }

  saveMass(massData) {
    const existingIndex = this.state.masses.findIndex(m => m.id === massData.id);
    if (existingIndex >= 0) {
      this.state.masses[existingIndex] = { ...this.state.masses[existingIndex], ...massData };
    } else {
      this.state.masses.push(massData);
    }
    this.saveState();
    return massData;
  }

  // --- Arrangements ---
  getArrangements() {
    return [...this.state.arrangements].sort((a, b) => new Date(b.massDate || '2000-01-01') - new Date(a.massDate || '2000-01-01'));
  }

  getArrangementById(id) {
    return this.state.arrangements.find(a => a.id === id);
  }

  getArrangementByMassId(massId) {
    return this.state.arrangements.find(a => a.massId === massId);
  }

  saveArrangement(arrangementData) {
    const existingIndex = this.state.arrangements.findIndex(a => a.id === arrangementData.id);
    if (existingIndex >= 0) {
      this.state.arrangements[existingIndex] = { ...this.state.arrangements[existingIndex], ...arrangementData };
    } else {
      this.state.arrangements.push(arrangementData);
    }

    if (arrangementData.massId) {
      const mass = this.getMassById(arrangementData.massId);
      if (mass) {
        mass.status = arrangementData.status;
        mass.arrangementId = arrangementData.id;
      }
    }

    this.saveState();
    return arrangementData;
  }

  // Workflow Step 3: Group Submits Arrangement
  submitArrangement(id) {
    const arr = this.getArrangementById(id);
    if (arr) {
      arr.status = 'submitted';
      arr.submittedAt = new Date().toISOString();
      const mass = this.getMassById(arr.massId);
      if (mass) mass.status = 'submitted';
      this.saveState();
    }
    return arr;
  }

  // Workflow Step 4: Coordinator Reviews & Can Make Corrections
  reviewArrangement(id, corrections = {}, reviewerName = 'Mr. Gabriel Mensah (Music Coordinator)') {
    const arr = this.getArrangementById(id);
    if (arr) {
      if (corrections.songs) {
        arr.songs = { ...arr.songs, ...corrections.songs };
      }
      if (corrections.notes) {
        arr.coordinatorNotes = corrections.notes;
      }
      arr.status = 'reviewed';
      arr.reviewedAt = new Date().toISOString();
      arr.reviewedBy = reviewerName;
      const mass = this.getMassById(arr.massId);
      if (mass) mass.status = 'reviewed';
      this.saveState();
    }
    return arr;
  }

  // Workflow Step 5: Coordinator Approves Arrangement
  approveArrangement(id, reviewerName = 'Mr. Gabriel Mensah (Music Coordinator)', notes = '') {
    const arr = this.getArrangementById(id);
    if (arr) {
      arr.status = 'approved';
      arr.approvedAt = new Date().toISOString();
      arr.reviewedBy = reviewerName;
      if (notes) arr.coordinatorNotes = notes;

      const mass = this.getMassById(arr.massId);
      if (mass) mass.status = 'approved';
      this.saveState();
    }
    return arr;
  }

  // Archive Feature: Reuse Previous Arrangement for an Upcoming Mass
  reuseArrangement(sourceArrangementId, targetMassId) {
    const source = this.getArrangementById(sourceArrangementId);
    const targetMass = this.getMassById(targetMassId);
    if (!source || !targetMass) return null;

    const targetGroup = this.getGroupById(targetMass.assignedGroupId);
    const clonedSongs = JSON.parse(JSON.stringify(source.songs || {}));

    let targetArr = this.getArrangementByMassId(targetMassId);
    if (targetArr) {
      targetArr.songs = clonedSongs;
      targetArr.status = 'draft';
      targetArr.submittedAt = null;
      targetArr.approvedAt = null;
    } else {
      targetArr = {
        id: `arr-${targetMassId}`,
        massId: targetMassId,
        massDate: targetMass.date,
        massDisplayDate: targetMass.displayDate || targetMass.date,
        massTitle: targetMass.theme,
        groupId: targetMass.assignedGroupId,
        groupName: targetGroup ? targetGroup.name : 'School Choir',
        status: 'draft',
        submittedAt: null,
        approvedAt: null,
        reviewedBy: null,
        songs: clonedSongs
      };
      this.state.arrangements.push(targetArr);
    }

    targetMass.arrangementId = targetArr.id;
    targetMass.status = 'draft';
    this.saveState();
    return targetArr;
  }

  // --- Song Library ---
  getSongs() {
    return [...this.state.songs].sort((a, b) => a.title.localeCompare(b.title));
  }

  getSongById(id) {
    return this.state.songs.find(s => s.id === id);
  }

  saveSong(songData) {
    const existingIndex = this.state.songs.findIndex(s => s.id === songData.id);
    if (existingIndex >= 0) {
      this.state.songs[existingIndex] = { ...this.state.songs[existingIndex], ...songData };
    } else {
      this.state.songs.push(songData);
    }
    this.saveState();
    return songData;
  }

  // --- Music Groups ---
  getGroups() {
    return this.state.groups;
  }

  getGroupById(id) {
    return this.state.groups.find(g => g.id === id);
  }

  addMemberToGroup(groupId, member) {
    const group = this.getGroupById(groupId);
    if (group) {
      if (!group.roster) group.roster = [];
      group.roster.push(member);
      group.membersCount = group.roster.length;
      this.saveState();
    }
  }
}

const store = new MMMSStore();
