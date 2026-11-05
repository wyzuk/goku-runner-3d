import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * ModelAssetLoader
 * Central asynchronous asset loader and instance cache for Goku Runner 3D.
 * Loads GLB models, caches parsed hierarchies, and provides fast cloning for chunks and obstacles.
 */
class ModelAssetLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.cache = new Map();
    this.loadingPromises = new Map();
    this.isReady = false;
    this.callbacks = [];

    // Manifest of models used for environment, scenery, and obstacles
    this.manifest = {
      // Mountains (Far Background)
      mtn_main: 'models/low_poly_mountain.glb',
      mtn_ridge: 'models/low_poly_mountain (1).glb',
      mtn_peak: 'models/low_poly_mountain (2).glb',
      mtn_crag: 'models/low_poly_mountain_free.glb',

      // Trees (Midground & Background Forest)
      tree_oak: 'models/oak_tree.glb',
      tree_pine: 'models/pine_tree (1).glb',
      tree_small: 'models/small_trees.glb',
      tree_dead: 'models/dead_trees.glb',

      // Rocks & Formations (Midground & Roadside)
      rock_large: 'models/large_stone.glb',
      rock_desert: 'models/desert_rocks.glb',
      rock_flat: 'models/flat_rocks.glb',
      rock_small: 'models/small_rocks.glb',
      rock_cluster: 'models/smallrocks1.glb',
      rock_tree_vignette: 'models/rocks_and_trees.glb',
      crystal_cluster: 'models/stalagmitecrystalore_cluster_-_meshy.glb',

      // Foliage & Undergrowth (Foreground & Roadside)
      bush_stylized: 'models/stylized_bush.glb',
      grass_tufts: 'models/grass_patches.glb',
      grass_patch: 'models/grass_patch.glb',
      grass_clump: 'models/grass.glb',
      fern: 'models/fern.glb',
      flower_plant: 'models/flowering_plant.glb',
      small_foliage: 'models/small_folliage_plant.glb',

      // Forest Floor & Obstacle Assets
      mossy_log: 'models/mossy_old_tree_log.glb',
      broken_branch: 'models/tree_broken_mossy_branch_pbr_photogrammetry_free.glb',
      wooden_bridge: 'models/wooden_bridge.glb',

      // Character Assets
      chibi_goku_ssj3: 'models/baby_goku_super_saiyan_iii.glb',
      gogeta: 'models/extracted_gogeta/source/a931b105-49c4-43f6-9362-51f3478d2624.glb'
    };
  }

  /**
   * Preload all critical models
   */
  async preloadAll(onProgress = null) {
    const keys = Object.keys(this.manifest);
    let loadedCount = 0;

    const promises = keys.map(async (key) => {
      try {
        const url = this.manifest[key];
        const gltf = await this.loadModel(url);
        this.cache.set(key, gltf.scene);
        loadedCount++;
        if (onProgress) {
          onProgress(loadedCount, keys.length, key);
        }
      } catch (err) {
        console.warn(`[ModelAssetLoader] Failed to load ${key}:`, err.message);
      }
    });

    await Promise.all(promises);
    this.isReady = true;
    this.callbacks.forEach(cb => cb());
    this.callbacks = [];
    console.log(`[ModelAssetLoader] Preloaded ${this.cache.size}/${keys.length} models successfully.`);
  }

  loadModel(url) {
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    const promise = new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          // Configure shadows & materials on cached template
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              // Only cast shadow on characters, obstacles, and trees
              const isNonShadow = url.includes('mountain') || url.includes('grass') || url.includes('fern') || url.includes('flower') || url.includes('folliage');
              child.castShadow = !isNonShadow;
              child.receiveShadow = true;
              if (child.material) {
                // Ensure proper depth testing and lighting
                child.material.depthWrite = true;
              }
            }
          });
          resolve(gltf);
        },
        undefined,
        (err) => reject(new Error(`Failed to load GLTF at ${url}: ${err.message || err}`))
      );
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  has(key) {
    return this.cache.has(key);
  }

  getRawScene(key) {
    return this.cache.get(key) || null;
  }

  /**
   * Get a clone of the cached template
   */
  createInstance(key) {
    const template = this.cache.get(key);
    if (!template) return null;
    return template.clone(true);
  }

  onReady(cb) {
    if (this.isReady) {
      cb();
    } else {
      this.callbacks.push(cb);
    }
  }
}

// Export singleton instance
export const modelLoader = new ModelAssetLoader();
