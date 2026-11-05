import './ui/style.css';
import * as THREE from 'three';
import { Game } from './game/Game.js';
import { modelLoader } from './utils/ModelAssetLoader.js';

window.THREE = THREE;
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  window.gokuGame = game; // Expose for debugging if needed
  window.modelLoader = modelLoader;
});
