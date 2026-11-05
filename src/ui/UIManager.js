import { MainMenu } from './MainMenu.js';
import { HUD } from './HUD.js';
import { PauseMenu } from './PauseMenu.js';
import { GameOverModal } from './GameOverModal.js';
import { SettingsModal } from './SettingsModal.js';
import { AboutModal } from './AboutModal.js';
import { TutorialModal } from './TutorialModal.js';
import { ProfileModal } from './ProfileModal.js';
import { TouchControls } from './TouchControls.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.container = document.getElementById('ui-root');

    // Sub-screens
    this.mainMenu = new MainMenu(this.container, {
      onPlay: () => this.game.startRun(),
      onTutorial: () => this.tutorialModal.show(true),
      onProfile: () => this.profileModal.show(),
      onSettings: () => this.settingsModal.show(),
      onAbout: () => this.aboutModal.show()
    });

    this.hud = new HUD(this.container, () => this.game.togglePause());

    this.pauseMenu = new PauseMenu(this.container, {
      onResume: () => this.game.resumeRun(),
      onRestart: () => this.game.restartRun(),
      onSettings: () => this.settingsModal.show(),
      onMainMenu: () => this.game.returnToMenu()
    });

    this.gameOverModal = new GameOverModal(this.container, {
      onRetry: () => this.game.restartRun(),
      onMainMenu: () => this.game.returnToMenu()
    });

    this.aboutModal = new AboutModal(this.container);

    this.tutorialModal = new TutorialModal(this.container, this.game.progression, (completed) => {
      if (completed) {
        this.game.startRun();
      }
    });

    this.profileModal = new ProfileModal(this.container, this.game.progression, this.game.challenges);

    this.settingsModal = new SettingsModal(this.container, this.game.audio, (settings) => {
      this.applySettings(settings);
    });

    this.touchControls = new TouchControls(this.container, (action) => {
      this.game.input.dispatch(action);
    });

    // Apply initial settings
    this.applySettings(this.settingsModal.settings);
  }

  applySettings(settings) {
    if (this.touchControls) {
      if (settings.touchControls) {
        this.touchControls.setOpacity(settings.touchOpacity);
      } else {
        this.touchControls.hide();
      }
    }
  }

  showMenu(profile) {
    this.hud.hide();
    this.pauseMenu.hide();
    this.gameOverModal.hide();
    this.touchControls.hide();
    this.mainMenu.show(profile);
  }

  showGameplay() {
    this.mainMenu.hide();
    this.pauseMenu.hide();
    this.gameOverModal.hide();
    this.hud.show();
    if (this.settingsModal.settings.touchControls) {
      this.touchControls.show();
    }
  }

  showPause() {
    this.pauseMenu.show();
  }

  hidePause() {
    this.pauseMenu.hide();
  }

  showGameOver(results) {
    this.hud.hide();
    this.touchControls.hide();
    this.gameOverModal.show(results);
  }
}
