'use client'

// A simple Web Audio API utility for synthesized UI sounds
// This avoids needing external mp3 files and provides instant feedback.

let audioContext: AudioContext | null = null

const initAudio = () => {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioContext = new AudioContextClass()
    }
  }
  return audioContext
}

const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
  const ctx = initAudio()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime)

  gain.gain.setValueAtTime(vol, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export const playClickSound = () => {
  playTone(600, 'sine', 0.1, 0.05)
}

export const playCorrectSound = () => {
  const ctx = initAudio()
  if (!ctx) return
  // play a nice ascending major third
  playTone(523.25, 'sine', 0.2, 0.1) // C5
  setTimeout(() => playTone(659.25, 'sine', 0.4, 0.1), 100) // E5
}

export const playWrongSound = () => {
  const ctx = initAudio()
  if (!ctx) return
  // play a descending minor third or dissonant sound
  playTone(300, 'sawtooth', 0.3, 0.1)
  setTimeout(() => playTone(250, 'sawtooth', 0.4, 0.1), 150)
}

export const playStartSound = () => {
  const ctx = initAudio()
  if (!ctx) return
  playTone(440, 'square', 0.1, 0.05)
  setTimeout(() => playTone(554.37, 'square', 0.1, 0.05), 100)
  setTimeout(() => playTone(659.25, 'square', 0.3, 0.05), 200)
}
