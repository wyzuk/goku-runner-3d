export class TutorialModal {
  constructor(container, progressionManager, onComplete) {
    this.container = container;
    this.progression = progressionManager;
    this.onComplete = onComplete;
    this.currentStep = 1;
    this.totalSteps = 7;

    this.element = document.createElement('div');
    this.element.className = 'modal-backdrop hidden';
    this.container.appendChild(this.element);

    this.render();
    this.attachKeyListeners();
  }

  attachKeyListeners() {
    window.addEventListener('keydown', (e) => {
      if (this.element.classList.contains('hidden')) return;

      const code = e.code;
      // Step 1: Move left or right
      if (this.currentStep === 1 && (code === 'KeyA' || code === 'KeyD' || code === 'ArrowLeft' || code === 'ArrowRight')) {
        this.highlightActionSuccess();
      }
      // Step 2: Jump
      else if (this.currentStep === 2 && (code === 'KeyW' || code === 'ArrowUp' || code === 'Space')) {
        this.highlightActionSuccess();
      }
      // Step 3: Slide
      else if (this.currentStep === 3 && (code === 'KeyS' || code === 'ArrowDown')) {
        this.highlightActionSuccess();
      }
      // Step 5: Super Saiyan
      else if (this.currentStep === 5 && (code === 'KeyE' || code === 'ShiftLeft' || code === 'ShiftRight')) {
        this.highlightActionSuccess();
      }
    });
  }

  highlightActionSuccess() {
    const box = this.element.querySelector('.key-instruction-box');
    if (box) {
      box.classList.add('key-success-pulse');
      setTimeout(() => {
        if (box) box.classList.remove('key-success-pulse');
      }, 400);
    }
  }

  render() {
    this.element.innerHTML = `
      <div class="modal-card anime-card tutorial-card">
        <div class="modal-header">
          <div class="tutorial-badge">SAIYAN COMBAT TRAINING</div>
          <div class="tutorial-progress-text">Step ${this.currentStep} / ${this.totalSteps}</div>
        </div>

        <div class="tutorial-progress-bar">
          <div class="tutorial-progress-fill" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
        </div>

        <div class="tutorial-content" id="tutorial-step-container">
          ${this.getStepHtml(this.currentStep)}
        </div>

        <div class="tutorial-nav-buttons">
          <button class="anime-btn secondary-btn" id="tut-skip-btn">Skip Tutorial</button>
          <div class="tut-step-btns">
            ${this.currentStep > 1 ? '<button class="anime-btn secondary-btn" id="tut-back-btn">Back</button>' : ''}
            ${this.currentStep < this.totalSteps ? '<button class="anime-btn primary-btn" id="tut-next-btn">Next Step &rarr;</button>' : '<button class="anime-btn gold-btn" id="tut-finish-btn">Complete Training ⚡</button>'}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  getStepHtml(step) {
    switch (step) {
      case 1:
        return `
          <div class="step-card">
            <div class="step-icon">↔️</div>
            <h2 class="step-title">MOVE LEFT & RIGHT</h2>
            <p class="step-desc">Switch smoothly between the three running lanes to navigate clear paths and dodge oncoming obstacles.</p>
            <div class="key-instruction-box">
              <div class="key-row"><span class="key-pill">A</span> or <span class="key-pill">&larr; Left Arrow</span>: Move Left</div>
              <div class="key-row"><span class="key-pill">D</span> or <span class="key-pill">&rarr; Right Arrow</span>: Move Right</div>
              <div class="touch-hint">Mobile: Swipe Left or Right across the screen</div>
            </div>
          </div>
        `;
      case 2:
        return `
          <div class="step-card">
            <div class="step-icon">⬆️</div>
            <h2 class="step-title">JUMP OVER OBSTACLES</h2>
            <p class="step-desc">Leap over low barriers, fallen logs, and ground debris with a powerful Saiyan vertical jump.</p>
            <div class="key-instruction-box">
              <div class="key-row"><span class="key-pill">W</span> or <span class="key-pill">&uarr; Up Arrow</span> or <span class="key-pill">Spacebar</span></div>
              <div class="touch-hint">Mobile: Swipe Upwards</div>
            </div>
          </div>
        `;
      case 3:
        return `
          <div class="step-card">
            <div class="step-icon">⬇️</div>
            <h2 class="step-title">SLIDE UNDER OBSTACLES</h2>
            <p class="step-desc">Lower your stance and slide underneath overhead stone arches and suspended hazard beams.</p>
            <div class="key-instruction-box">
              <div class="key-row"><span class="key-pill">S</span> or <span class="key-pill">&darr; Down Arrow</span></div>
              <div class="touch-hint">Mobile: Swipe Downwards</div>
            </div>
          </div>
        `;
      case 4:
        return `
          <div class="step-card">
            <div class="step-icon">🔮</div>
            <h2 class="step-title">COLLECT DRAGON BALLS & KI</h2>
            <p class="step-desc">
              <strong>Dragon Balls (Orange)</strong>: Collect all 7 stars to boost your score and unlock legendary achievements!<br/>
              <strong>Ki Energy Orbs (Cyan)</strong>: Charge your Ki meter at the bottom left to prepare for transformation.
            </p>
            <div class="items-preview-row">
              <div class="preview-item"><span>🔮</span> +150 Points</div>
              <div class="preview-item"><span>⚡</span> +10% Ki Charge</div>
            </div>
          </div>
        `;
      case 5:
        return `
          <div class="step-card">
            <div class="step-icon">🔥</div>
            <h2 class="step-title">SUPER SAIYAN TRANSFORMATION</h2>
            <p class="step-desc">
              When your Ki meter reaches 100%, trigger your Super Saiyan awakening!
              Gain golden aura, high running speed, magnetic item attraction, and invulnerability!
            </p>
            <div class="key-instruction-box ssj-box">
              <div class="key-row"><span class="key-pill gold-pill">E</span> or <span class="key-pill gold-pill">Shift</span></div>
              <div class="touch-hint">Mobile: Tap the glowing Golden Aura button</div>
            </div>
          </div>
        `;
      case 6:
        return `
          <div class="step-card">
            <div class="step-icon">📈</div>
            <h2 class="step-title">SCORING & PROGRESSION</h2>
            <p class="step-desc">
              Maintain your dodge and collection streaks to build combos up to <strong>3.0x multiplier</strong>!<br/>
              Earn persistent XP for distance, milestones, and challenges to level up your Saiyan Rank.
            </p>
          </div>
        `;
      case 7:
        return `
          <div class="step-card">
            <div class="step-icon">⏸️</div>
            <h2 class="step-title">PAUSE & CONTROLS</h2>
            <p class="step-desc">Need a breather? Pause the game anytime to adjust volume, view controls, or adjust graphics quality.</p>
            <div class="key-instruction-box">
              <div class="key-row"><span class="key-pill">Escape</span> or <span class="key-pill">P</span>: Pause / Resume</div>
            </div>
          </div>
        `;
      default:
        return '';
    }
  }

  bindEvents() {
    const skipBtn = this.element.querySelector('#tut-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.hide();
        if (this.onComplete) this.onComplete(false);
      });
    }

    const backBtn = this.element.querySelector('#tut-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.render();
        }
      });
    }

    const nextBtn = this.element.querySelector('#tut-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          this.render();
        }
      });
    }

    const finishBtn = this.element.querySelector('#tut-finish-btn');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.showCompletionScreen();
      });
    }
  }

  showCompletionScreen() {
    const rewarded = this.progression.completeTutorialReward();
    this.element.innerHTML = `
      <div class="modal-card anime-card tutorial-card completion-card">
        <div class="completion-header">
          <div class="completion-crown">👑</div>
          <h2 class="completion-title">&lt; WARRIOR TRAINING COMPLETE &gt;</h2>
          <p class="completion-subtitle">You are now ready to begin your Saiyan adventure!</p>
        </div>

        ${rewarded ? '<div class="reward-pill">+500 XP Training Bonus Claimed!</div>' : ''}

        <div class="summary-box">
          <div class="summary-item"><strong>Lanes:</strong> A / D or &larr; / &rarr;</div>
          <div class="summary-item"><strong>Jump:</strong> W or &uarr; or Space</div>
          <div class="summary-item"><strong>Slide:</strong> S or &darr;</div>
          <div class="summary-item"><strong>Super Saiyan:</strong> E or Shift (at 100% Ki)</div>
          <div class="summary-item"><strong>Pause:</strong> Escape or P</div>
        </div>

        <button class="anime-btn gold-btn large-btn" id="tut-start-play-btn">START RUNNING NOW ⚡</button>
      </div>
    `;

    this.element.querySelector('#tut-start-play-btn').addEventListener('click', () => {
      this.hide();
      if (this.onComplete) this.onComplete(true);
    });
  }

  show(forceFirstStep = true) {
    if (forceFirstStep) this.currentStep = 1;
    this.render();
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }
}
