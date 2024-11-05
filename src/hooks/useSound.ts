import { useCallback } from 'react';

export const useSound = (isMuted: boolean) => {
  const createOscillator = useCallback((
    audioContext: AudioContext,
    type: OscillatorType,
    frequency: number,
    startTime: number,
    duration: number,
    gainValue: number = 0.1,
    fadeOut: boolean = true
  ) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(gainValue, startTime);
    if (fadeOut) {
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return { oscillator, gainNode };
  }, []);

  const playInvaderStep = useCallback((isFirstSound: boolean) => {
    if (isMuted) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const startTime = audioContext.currentTime;
    const duration = 0.15;

    const { oscillator: osc1 } = createOscillator(
      audioContext,
      'triangle',
      isFirstSound ? 180 : 150,
      startTime,
      duration,
      0.3
    );

    const { oscillator: osc2 } = createOscillator(
      audioContext,
      'square',
      isFirstSound ? 160 : 140,
      startTime,
      duration,
      0.2
    );

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }, [isMuted, createOscillator]);

  const playPlayerShoot = useCallback(() => {
    if (isMuted) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const startTime = audioContext.currentTime;
    const duration = 0.2;

    const { oscillator, gainNode } = createOscillator(
      audioContext,
      'sine',
      1200,
      startTime,
      duration,
      0.15,
      false
    );

    oscillator.frequency.exponentialRampToValueAtTime(400, startTime + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }, [isMuted, createOscillator]);

  const playInvaderShoot = useCallback(() => {
    if (isMuted) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const startTime = audioContext.currentTime;
    const duration = 0.15;

    const { oscillator: osc1 } = createOscillator(
      audioContext,
      'sawtooth',
      220,
      startTime,
      duration,
      0.15
    );

    const { oscillator: osc2 } = createOscillator(
      audioContext,
      'square',
      180,
      startTime,
      duration,
      0.1
    );

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }, [isMuted, createOscillator]);

  const playExplosion = useCallback(() => {
    if (isMuted) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const startTime = audioContext.currentTime;
    const duration = 0.3;

    const { oscillator: osc1 } = createOscillator(
      audioContext,
      'square',
      100,
      startTime,
      duration,
      0.3
    );

    const { oscillator: osc2 } = createOscillator(
      audioContext,
      'sawtooth',
      80,
      startTime,
      duration,
      0.2
    );

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }, [isMuted, createOscillator]);

  const playLevelUp = useCallback(() => {
    if (isMuted) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const startTime = audioContext.currentTime;
    const duration = 0.8;

    const { oscillator: osc1 } = createOscillator(
      audioContext,
      'sine',
      440,
      startTime,
      duration,
      0.2
    );

    const { oscillator: osc2 } = createOscillator(
      audioContext,
      'square',
      880,
      startTime + 0.1,
      duration - 0.1,
      0.15
    );

    osc1.frequency.exponentialRampToValueAtTime(880, startTime + duration / 2);
    osc2.frequency.exponentialRampToValueAtTime(1760, startTime + duration / 2);

    osc1.start(startTime);
    osc2.start(startTime + 0.1);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }, [isMuted, createOscillator]);

  const playGameOver = useCallback(() => {
    if (isMuted) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const startTime = audioContext.currentTime;
    const duration = 1.0;

    const { oscillator: osc1 } = createOscillator(
      audioContext,
      'sawtooth',
      200,
      startTime,
      duration,
      0.3
    );

    const { oscillator: osc2 } = createOscillator(
      audioContext,
      'square',
      180,
      startTime,
      duration,
      0.2
    );

    const { oscillator: osc3 } = createOscillator(
      audioContext,
      'triangle',
      100,
      startTime,
      duration,
      0.2
    );

    osc1.frequency.exponentialRampToValueAtTime(50, startTime + duration);
    osc2.frequency.exponentialRampToValueAtTime(40, startTime + duration);
    osc3.frequency.exponentialRampToValueAtTime(30, startTime + duration);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
    osc3.stop(startTime + duration);
  }, [isMuted, createOscillator]);

  return {
    playShoot: playPlayerShoot,
    playExplosion,
    playInvaderMove: playInvaderStep,
    playInvaderShoot,
    playGameStart: playLevelUp,
    playGameOver,
    playLevelUp
  };
}