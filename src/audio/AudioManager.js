import { SoundSynth } from './SoundSynth.js';

export class AudioManager {
  constructor() {
    this.synth = new SoundSynth();
    this.hasUnlocked = false;

    // Listen for first user interaction to unlock Web Audio API cleanly
    this.unlockAudio = this.unlockAudio.bind(this);
    window.addEventListener('click', this.unlockAudio, { once: true });
    window.addEventListener('keydown', this.unlockAudio, { once: true });
    window.addEventListener('touchstart', this.unlockAudio, { once: true });
  }

  unlockAudio() {
    if (!this.hasUnlocked) {
      this.hasUnlocked = true;
      this.synth.initContext();
    }
  }

  setMusicVolume(vol) {
    this.synth.musicVolume = Math.max(0, Math.min(1, vol));
  }

  setSfxVolume(vol) {
    this.synth.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  setMuted(muted) {
    this.synth.isMuted = muted;
  }

  playFootstep() {
    this.synth.playFootstep();
  }

  playJump() {
    this.synth.playJump();
  }

  playLand() {
    this.synth.playLand();
  }

  playSlide() {
    this.synth.playSlide();
  }

  playDragonBall() {
    this.synth.playDragonBall();
  }

  playKi() {
    this.synth.playKi();
  }

  playPowerUp() {
    this.synth.playPowerUp();
  }

  playTransform() {
    this.synth.playTransform();
  }

  playCrash() {
    this.synth.playCrash();
  }

  playMilestone() {
    this.synth.playMilestone();
  }

  startMusic(isSSJ = false) {
    this.synth.startBGM(isSSJ);
  }

  setSuperSaiyanMusic(isSSJ) {
    this.synth.setSuperSaiyanBGM(isSSJ);
  }

  stopMusic() {
    this.synth.stopBGM();
  }
}
