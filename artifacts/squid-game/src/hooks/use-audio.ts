import { useRef, useCallback, useEffect, useMemo, useState } from 'react';

export function useAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const lfoOscRef = useRef<OscillatorNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const getMaster = useCallback(() => {
    if (!audioCtxRef.current) return null;
    if (!masterGainRef.current) {
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    return masterGainRef.current;
  }, []);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    getMaster();
  }, [getMaster]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (masterGainRef.current) {
        masterGainRef.current.gain.value = next ? 0 : 1;
      }
      return next;
    });
  }, []);

  const dest = useCallback(() => getMaster() ?? audioCtxRef.current?.destination ?? null, [getMaster]);

  const playDrone = useCallback((isRedLight: boolean) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;

    if (!droneOscRef.current) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(isRedLight ? 65 : 55, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(d);
      osc.start();
      droneOscRef.current = osc;
      droneGainRef.current = gain;
    } else {
      droneOscRef.current.frequency.linearRampToValueAtTime(isRedLight ? 65 : 55, ctx.currentTime + 0.2);
    }
  }, [dest]);

  const stopDrone = useCallback(() => {
    if (droneOscRef.current && droneGainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      droneGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => {
        droneOscRef.current?.stop();
        droneOscRef.current?.disconnect();
        droneOscRef.current = null;
        droneGainRef.current = null;
        if (lfoOscRef.current) {
          lfoOscRef.current.stop();
          lfoOscRef.current.disconnect();
          lfoOscRef.current = null;
        }
      }, 500);
    }
  }, []);

  const playShot = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(d);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }, [dest]);

  const playDollTurn = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(800, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1200, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(d);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.5);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.5);
  }, [dest]);

  const playWin = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    const frequencies = [440, 554.37, 659.25, 880];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + (i * 0.15);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + 1.5);
      osc.connect(gain);
      gain.connect(d);
      osc.start(startTime);
      osc.stop(startTime + 1.5);
    });
  }, [dest]);

  const playCrack = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(d);
    source.start();
  }, [dest]);

  const playTugPull = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(d);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }, [dest]);

  const playCrowdCheer = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const envelope = Math.sin(t * Math.PI / 1.5);
      data[i] = (Math.random() * 2 - 1) * 0.3 * envelope;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.5;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(d);
    source.start();
  }, [dest]);

  const playMarbleClink = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(d);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }, [dest]);

  const playGlassShatter = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 6) *
        (1 + 0.5 * Math.sin(t * 8000) + 0.3 * Math.sin(t * 12000));
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    source.connect(gain);
    gain.connect(d);
    source.start();
  }, [dest]);

  const playGlassStep = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(d);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }, [dest]);

  const playTensionDrone = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    if (droneOscRef.current) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 2;
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    lfoOscRef.current = lfo;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 1);
    osc.connect(gain);
    gain.connect(d);
    osc.start();
    droneOscRef.current = osc;
    droneGainRef.current = gain;
  }, [dest]);

  const playClash = useCallback(() => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const d = dest();
    if (!d) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(300, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(500, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(d);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.2);
  }, [dest]);

  useEffect(() => {
    return () => {
      stopDrone();
      if (audioCtxRef.current?.state !== 'closed') {
        audioCtxRef.current?.close();
      }
    };
  }, [stopDrone]);

  return useMemo(() => ({
    initAudio, playDrone, stopDrone, playShot, playDollTurn, playWin,
    playCrack, playTugPull, playCrowdCheer, playMarbleClink,
    playGlassShatter, playGlassStep, playTensionDrone, playClash,
    toggleMute, isMuted,
  }), [
    initAudio, playDrone, stopDrone, playShot, playDollTurn, playWin,
    playCrack, playTugPull, playCrowdCheer, playMarbleClink,
    playGlassShatter, playGlassStep, playTensionDrone, playClash,
    toggleMute, isMuted,
  ]);
}
