export const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

export class GameState {
  constructor() {
    this.current = GAME_STATES.MENU;
    this.previous = null;
  }

  set(state) {
    if (this.current === state) return;
    this.previous = this.current;
    this.current = state;
  }

  is(state) {
    return this.current === state;
  }
}
