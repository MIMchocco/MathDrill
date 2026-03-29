import { useRef } from 'react';

export function useSound() {
  const ctxRef = useRef(null);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  function playTone(ctx, freq, type, startTime, duration, gainPeak = 0.4) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  function playCorrect() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // C5 → E5 → G5 ascending chime
      playTone(ctx, 523, 'sine', now,        0.15, 0.3);
      playTone(ctx, 659, 'sine', now + 0.13, 0.15, 0.3);
      playTone(ctx, 784, 'sine', now + 0.26, 0.22, 0.3);
    } catch {
      // AudioContext not available (e.g., test environment)
    }
  }

  function playWrong() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.3);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.start(now);
      osc.stop(now + 0.3);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      // AudioContext not available
    }
  }

  return { playCorrect, playWrong };
}
