import { CHUNK_LENGTH, ACTIVE_CHUNKS, BIOMES, BIOME_DISTANCES, BIOME_SEQUENCE } from '../utils/Constants.js';
import { TerrainChunk } from './TerrainChunk.js';

export class ChunkManager {
  constructor(scene, envAssets) {
    this.scene = scene;
    this.envAssets = envAssets;
    this.chunks = [];
    this.chunkPool = [];
    this.nextChunkIndex = 0;
    this.currentBiome = BIOMES.EARTH_VALLEY;

    // Spawning callbacks
    this.onChunkGenerated = null;
  }

  getBiomeForDistance(distance) {
    for (let i = BIOME_SEQUENCE.length - 1; i >= 0; i--) {
      const biome = BIOME_SEQUENCE[i];
      if (distance >= BIOME_DISTANCES[biome]) {
        return biome;
      }
    }
    return BIOMES.EARTH_VALLEY;
  }

  init(initialZ = -20) {
    this.clear();
    let currentZ = initialZ;
    for (let i = 0; i < ACTIVE_CHUNKS; i++) {
      this.spawnChunk(currentZ);
      currentZ += CHUNK_LENGTH;
    }
  }

  spawnChunk(startZ) {
    let chunk;
    if (this.chunkPool.length > 0) {
      chunk = this.chunkPool.pop();
    } else {
      chunk = new TerrainChunk(this.envAssets);
      this.scene.add(chunk.group);
    }

    const biome = this.getBiomeForDistance(startZ);
    this.currentBiome = biome;
    chunk.setup(this.nextChunkIndex, startZ, biome);
    this.chunks.push(chunk);

    if (this.onChunkGenerated) {
      this.onChunkGenerated(chunk, startZ, startZ + CHUNK_LENGTH, biome);
    }

    this.nextChunkIndex++;
  }

  update(playerZ) {
    // If the oldest chunk is far behind player, recycle it to the front
    while (this.chunks.length > 0) {
      const oldestChunk = this.chunks[0];
      const chunkEndZ = oldestChunk.group.position.z + CHUNK_LENGTH / 2;

      if (chunkEndZ < playerZ - 35) {
        this.chunks.shift();
        this.chunkPool.push(oldestChunk);

        // Spawn new chunk at the front
        const newestChunk = this.chunks[this.chunks.length - 1];
        const newStartZ = newestChunk.group.position.z + CHUNK_LENGTH / 2;
        this.spawnChunk(newStartZ);
      } else {
        break;
      }
    }
  }

  clear() {
    for (const chunk of this.chunks) {
      this.scene.remove(chunk.group);
    }
    for (const chunk of this.chunkPool) {
      this.scene.remove(chunk.group);
    }
    this.chunks = [];
    this.chunkPool = [];
    this.nextChunkIndex = 0;
  }
}
