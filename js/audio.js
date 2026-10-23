// Web Audio API Pitch Pipe & Choral Key Strummer for Cantors & Musicians

class LiturgicalAudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.activeOscillators = [];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Convert note name (e.g. "D4", "F#4", "Bb3") to frequency
  noteToFreq(noteStr) {
    if (!noteStr) return 440;
    const noteMap = {
      'C': 0, 'C#': 1, 'DB': 1,
      'D': 2, 'D#': 3, 'EB': 3,
      'E': 4,
      'F': 5, 'F#': 6, 'GB': 6,
      'G': 7, 'G#': 8, 'AB': 8,
      'A': 9, 'A#': 10, 'BB': 10,
      'B': 11
    };

    const match = noteStr.trim().toUpperCase().match(/^([A-G][#B]?)([0-8])?$/);
    if (!match) return 440;

    const note = match[1];
    const octave = match[2] !== undefined ? parseInt(match[2], 10) : 4;
    const semitonesFromC0 = (octave * 12) + noteMap[note];
    // A4 is semitone 57 (440 Hz)
    const semitonesFromA4 = semitonesFromC0 - 57;
    return 440 * Math.pow(2, semitonesFromA4 / 12);
  }

  // Stop any currently playing sound
  stop() {
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscillators = [];
    this.isPlaying = false;
  }

  // Play a clear pitch pipe tone (organ flute timbre)
  playPitchPipe(note = 'D4', duration = 3.0) {
    this.init();
    if (!this.ctx) return;
    this.stop();

    const freq = typeof note === 'number' ? note : this.noteToFreq(note);
    const now = this.ctx.currentTime;

    // Create dual oscillator for organ pipe warmth
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Subtle 2nd harmonic for resonance
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    // Envelope
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.08); // attack
    gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.3); // sustain
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration); // decay

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);

    this.activeOscillators.push(osc1, osc2);
    this.isPlaying = true;

    setTimeout(() => {
      if (this.activeOscillators.includes(osc1)) {
        this.isPlaying = false;
      }
    }, duration * 1000);
  }

  // Play key chord arpeggio / choral tuning triad (e.g. "D" -> D4, F#4, A4)
  playKeyTriad(rootKey = 'D', duration = 3.5) {
    this.init();
    if (!this.ctx) return;
    this.stop();

    const cleanKey = rootKey.replace('m', '').replace('M', '').trim();
    const isMinor = rootKey.toLowerCase().includes('m') && !rootKey.toLowerCase().includes('maj');

    const baseFreq = this.noteToFreq(cleanKey + '4');
    // Root, 3rd, 5th
    const thirdInterval = isMinor ? 3 : 4;
    const fifthInterval = 7;

    const root = baseFreq;
    const third = baseFreq * Math.pow(2, thirdInterval / 12);
    const fifth = baseFreq * Math.pow(2, fifthInterval / 12);

    const notes = [root, third, fifth];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const noteStart = now + (idx * 0.18); // arpeggio roll
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.2, noteStart + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteStart);
      osc.stop(now + duration);
      this.activeOscillators.push(osc);
    });

    this.isPlaying = true;
    setTimeout(() => {
      this.isPlaying = false;
    }, duration * 1000);
  }

  // Aliases for pitch pipe and key triad
  playPitchTone(note = 'D4', duration = 3.0) {
    return this.playPitchPipe(note, duration);
  }

  playTriad(rootKey = 'D', duration = 3.5) {
    return this.playKeyTriad(rootKey, duration);
  }
}

const audioSynth = new LiturgicalAudioSynthesizer();
