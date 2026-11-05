export class SettingsModal {
  constructor(container, audioManager, onSettingChange) {
    this.container = container;
    this.audio = audioManager;
    this.onSettingChange = onSettingChange;

    this.settings = this.loadSettings();

    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop hidden';
    this.container.appendChild(this.element);

    this.render();
  }

  loadSettings() {
    const defaults = {
      musicVolume: 60,
      sfxVolume: 80,
      graphicsQuality: 'HIGH',
      cameraShake: true,
      touchControls: true,
      touchOpacity: 80,
      characterSkin: 'GOGETA'
    };
    try {
      const data = localStorage.getItem('goku_runner_settings_v1');
      if (data) return { ...defaults, ...JSON.parse(data) };
    } catch (e) {
      console.warn(e);
    }
    return defaults;
  }

  saveSettings() {
    try {
      localStorage.setItem('goku_runner_settings_v1', JSON.stringify(this.settings));
    } catch (e) {
      console.warn(e);
    }
    if (this.onSettingChange) {
      this.onSettingChange(this.settings);
    }
  }

  render() {
    this.element.innerHTML = `
      <div class="modal-card anime-card settings-card">
        <div class="modal-header">
          <div class="logo-badge">⚙️ GAME SETTINGS</div>
          <button class="close-btn" id="settings-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="settings-group">
            <h3>Audio</h3>
            <div class="setting-row">
              <label>Music Volume (<span id="music-val">${this.settings.musicVolume}%</span>)</label>
              <input type="range" id="music-slider" min="0" max="100" value="${this.settings.musicVolume}">
            </div>
            <div class="setting-row">
              <label>SFX Volume (<span id="sfx-val">${this.settings.sfxVolume}%</span>)</label>
              <input type="range" id="sfx-slider" min="0" max="100" value="${this.settings.sfxVolume}">
            </div>
          </div>

          <div class="settings-group">
            <h3>Character & Visuals</h3>
            <div class="setting-row">
              <label>Character Model / Form</label>
              <select id="character-skin-select" class="anime-select">
                <option value="DEFAULT" ${this.settings.characterSkin === 'DEFAULT' ? 'selected' : ''}>Goku (Base Form - Black Hair)</option>
                <option value="CHIBI_SSJ3" ${this.settings.characterSkin === 'CHIBI_SSJ3' ? 'selected' : ''}>Goku (Super Saiyan 3 - Golden Hair)</option>
                <option value="GOGETA" ${this.settings.characterSkin === 'GOGETA' ? 'selected' : ''}>Gogeta (Adult Super Saiyan Warrior)</option>
              </select>
            </div>
            <div class="setting-row">
              <label>Graphics Quality</label>
              <select id="graphics-select" class="anime-select">
                <option value="LOW" ${this.settings.graphicsQuality === 'LOW' ? 'selected' : ''}>Low (Performance / Fast)</option>
                <option value="MEDIUM" ${this.settings.graphicsQuality === 'MEDIUM' ? 'selected' : ''}>Medium (Balanced)</option>
                <option value="HIGH" ${this.settings.graphicsQuality === 'HIGH' ? 'selected' : ''}>High (Full Vegetation & Soft Shadows)</option>
                <option value="ULTRA" ${this.settings.graphicsQuality === 'ULTRA' ? 'selected' : ''}>Ultra (Maximum AAA Visuals)</option>
              </select>
            </div>
            <div class="setting-row checkbox-row">
              <label for="camera-shake-check">Enable Camera Shake & Impacts</label>
              <input type="checkbox" id="camera-shake-check" ${this.settings.cameraShake ? 'checked' : ''}>
            </div>
          </div>

          <div class="settings-group">
            <h3>Touch & Mobile Controls</h3>
            <div class="setting-row checkbox-row">
              <label for="touch-check">Show On-Screen Touch Buttons</label>
              <input type="checkbox" id="touch-check" ${this.settings.touchControls ? 'checked' : ''}>
            </div>
            <div class="setting-row">
              <label>Touch Buttons Opacity (<span id="touch-op-val">${this.settings.touchOpacity}%</span>)</label>
              <input type="range" id="touch-op-slider" min="20" max="100" value="${this.settings.touchOpacity}">
            </div>
          </div>

          <div class="settings-group controls-summary-box">
            <h3>Controls Reference</h3>
            <div class="controls-list">
              <div><strong>Move Left / Right:</strong> A / D or &larr; / &rarr;</div>
              <div><strong>Jump:</strong> W or &uarr; or Spacebar</div>
              <div><strong>Slide:</strong> S or &darr;</div>
              <div><strong>Super Saiyan / Power-Up:</strong> E or Shift</div>
              <div><strong>Pause:</strong> Escape or P</div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.element.querySelector('#settings-close-btn').addEventListener('click', () => this.hide());

    const musicSlider = this.element.querySelector('#music-slider');
    const musicVal = this.element.querySelector('#music-val');
    musicSlider.addEventListener('input', (e) => {
      this.settings.musicVolume = parseInt(e.target.value, 10);
      musicVal.textContent = `${this.settings.musicVolume}%`;
      this.audio.setMusicVolume(this.settings.musicVolume / 100);
      this.saveSettings();
    });

    const sfxSlider = this.element.querySelector('#sfx-slider');
    const sfxVal = this.element.querySelector('#sfx-val');
    sfxSlider.addEventListener('input', (e) => {
      this.settings.sfxVolume = parseInt(e.target.value, 10);
      sfxVal.textContent = `${this.settings.sfxVolume}%`;
      this.audio.setSfxVolume(this.settings.sfxVolume / 100);
      this.saveSettings();
    });

    const skinSelect = this.element.querySelector('#character-skin-select');
    if (skinSelect) {
      skinSelect.addEventListener('change', (e) => {
        this.settings.characterSkin = e.target.value;
        this.saveSettings();
      });
    }

    const gfxSelect = this.element.querySelector('#graphics-select');
    gfxSelect.addEventListener('change', (e) => {
      this.settings.graphicsQuality = e.target.value;
      this.saveSettings();
    });

    const shakeCheck = this.element.querySelector('#camera-shake-check');
    shakeCheck.addEventListener('change', (e) => {
      this.settings.cameraShake = e.target.checked;
      this.saveSettings();
    });

    const touchCheck = this.element.querySelector('#touch-check');
    touchCheck.addEventListener('change', (e) => {
      this.settings.touchControls = e.target.checked;
      this.saveSettings();
    });

    const touchOpSlider = this.element.querySelector('#touch-op-slider');
    const touchOpVal = this.element.querySelector('#touch-op-val');
    touchOpSlider.addEventListener('input', (e) => {
      this.settings.touchOpacity = parseInt(e.target.value, 10);
      touchOpVal.textContent = `${this.settings.touchOpacity}%`;
      this.saveSettings();
    });
  }

  show() {
    this.render();
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }
}
