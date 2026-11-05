import './ui/style.css';
import { Game } from './game/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  window.gokuGame = game; // Expose for debugging if needed
});
