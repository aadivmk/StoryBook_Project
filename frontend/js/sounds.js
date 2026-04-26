// Sound Engine using Web Audio API — no external files needed!
const SoundEngine = (() => {
  let ctx = null;
  let enabled = true;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playTone(freq, type, duration, volume = 0.3, delay = 0) {
    if (!enabled) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + delay);
      gain.gain.setValueAtTime(0, c.currentTime + delay);
      gain.gain.linearRampToValueAtTime(volume, c.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
      osc.start(c.currentTime + delay);
      osc.stop(c.currentTime + delay + duration);
    } catch(e) {}
  }

  function playNoise(duration, volume = 0.1) {
    if (!enabled) return;
    try {
      const c = getCtx();
      const bufSize = c.sampleRate * duration;
      const buf = c.createBuffer(1, bufSize, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
      const src = c.createBufferSource();
      const gain = c.createGain();
      const filter = c.createBiquadFilter();
      src.buffer = buf;
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);
      gain.gain.setValueAtTime(volume, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      src.start();
    } catch(e) {}
  }

  const sounds = {
    // Magical page turn
    pageTurn: () => {
      playTone(600, 'sine', 0.08, 0.15);
      playTone(900, 'sine', 0.08, 0.1, 0.05);
      playTone(1200, 'sine', 0.1, 0.08, 0.1);
      playNoise(0.06, 0.06);
    },

    // Happy chime on story open
    storyOpen: () => {
      const melody = [523, 659, 784, 1047];
      melody.forEach((f, i) => playTone(f, 'sine', 0.3, 0.2, i * 0.1));
    },

    // Sparkly success sound
    success: () => {
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((f, i) => {
        playTone(f, 'sine', 0.3, 0.25, i * 0.08);
        playTone(f * 2, 'sine', 0.15, 0.1, i * 0.08 + 0.02);
      });
    },

    // Completion fanfare
    completion: () => {
      const fanfare = [
        [523, 0], [523, 0.1], [523, 0.2], [659, 0.35],
        [523, 0.5], [659, 0.65], [784, 0.8]
      ];
      fanfare.forEach(([f, d]) => playTone(f, 'square', 0.3, 0.15, d));
      setTimeout(() => sounds.magic(), 900);
    },

    // Magic twinkle
    magic: () => {
      for (let i = 0; i < 6; i++) {
        const f = 800 + Math.random() * 1200;
        playTone(f, 'sine', 0.2, 0.12, i * 0.07);
      }
    },

    // Button click
    click: () => {
      playTone(440, 'sine', 0.05, 0.15);
      playTone(660, 'sine', 0.04, 0.1, 0.03);
    },

    // Error sound
    error: () => {
      playTone(220, 'sawtooth', 0.15, 0.2);
      playTone(180, 'sawtooth', 0.15, 0.2, 0.15);
    },

    // Like/heart sound
    like: () => {
      playTone(880, 'sine', 0.1, 0.2);
      playTone(1100, 'sine', 0.1, 0.15, 0.08);
      playTone(1320, 'sine', 0.12, 0.18, 0.15);
    },

    // Hover chime
    hover: () => {
      playTone(660, 'sine', 0.08, 0.08);
    },

    // Star sound
    star: () => {
      [1046, 1319, 1568].forEach((f, i) => playTone(f, 'sine', 0.2, 0.15, i * 0.1));
    },

    // Welcome/login
    welcome: () => {
      [392, 494, 587, 740].forEach((f, i) => playTone(f, 'sine', 0.35, 0.18, i * 0.12));
    }
  };

  return {
    play: (name) => { if (sounds[name]) sounds[name](); },
    toggle: () => { enabled = !enabled; return enabled; },
    isEnabled: () => enabled,
    setEnabled: (v) => { enabled = v; }
  };
})();

// Background ambient music using Web Audio API
const AmbientMusic = (() => {
  let ctx = null, playing = false, nodes = [];

  function start() {
    if (playing) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      playing = true;
      playAmbient();
    } catch(e) {}
  }

  function playAmbient() {
    if (!playing || !ctx) return;
    // Soft background pad
    const freq = [261, 329, 392, 523][Math.floor(Math.random() * 4)];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 5);
    osc.start();
    osc.stop(ctx.currentTime + 5.5);
    nodes.push(osc);
    setTimeout(playAmbient, 4000 + Math.random() * 2000);
  }

  function stop() {
    playing = false;
    nodes.forEach(n => { try { n.stop(); } catch(e) {} });
    nodes = [];
  }

  return { start, stop, isPlaying: () => playing };
})();
