import * as THREE from 'three';
import { MaterialManager } from './MaterialManager.js';

let sharedManager = null;
export function getMaterialManager() {
  if (!sharedManager) {
    sharedManager = new MaterialManager();
  }
  return sharedManager;
}

export class AnimeMaterials {
  constructor() {
    const mgr = getMaterialManager();
    this.mgr = mgr;
    this.rampTexture = mgr.toonRamp;

    this.skin = mgr.skinMaterial;
    this.hairNormal = mgr.hairBlackMaterial;
    this.hairSSJ = mgr.hairSSJMaterial;
    this.giOrange = mgr.giOrangeMaterial;
    this.blueClothing = mgr.blueClothingMaterial;
    this.boots = mgr.bootsMaterial;
    this.bootTrim = mgr.bootTrimMaterial;
    this.eyeNormal = mgr.eyeNormalMaterial;
    this.eyeWhite = mgr.eyeWhiteMaterial;
    this.eyeSSJ = mgr.eyeSSJMaterial;
    this.kanjiEmblem = mgr.kanjiMaterial;
    this.kanjiText = mgr.eyeNormalMaterial;
    this.auraMaterial = mgr.auraMaterial;
  }

  update(time, dt) {
    if (this.mgr) {
      this.mgr.update(dt || 0.016, time || 0);
    }
  }
}
