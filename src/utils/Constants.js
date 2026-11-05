// Global Constants and Configurations for Goku Runner 3D

// Three-Lane World & Coordinate Mapping
// Camera is positioned at Z < player.z and looks down +Z.
// In Three.js right-handed coordinate system looking down +Z:
// - Screen LEFT corresponds to world +X
// - Screen CENTER corresponds to world 0
// - Screen RIGHT corresponds to world -X
export const LANE_WIDTH = 3.6;
export const LANE_INDEX_LEFT = -1;
export const LANE_INDEX_CENTER = 0;
export const LANE_INDEX_RIGHT = 1;

export const getLaneX = (laneIndex) => -laneIndex * LANE_WIDTH;

// Array indexing: 0 = LEFT (+3.6), 1 = CENTER (0), 2 = RIGHT (-3.6)
export const LANES = [getLaneX(-1), getLaneX(0), getLaneX(1)];
export const LANE_NAMES = ['LEFT', 'CENTER', 'RIGHT'];
export const LANE_LEFT = 0;
export const LANE_CENTER = 1;
export const LANE_RIGHT = 2;

export const INITIAL_SPEED = 14;
export const MAX_SPEED = 32;
export const SSJ_SPEED_BOOST = 8;

export const CHUNK_LENGTH = 45;
export const ACTIVE_CHUNKS = 7;
export const ROAD_TOTAL_WIDTH = 12.0;

export const BIOMES = {
  EARTH_VALLEY: 'EARTH_VALLEY',
  ROCKY_MOUNTAINS: 'ROCKY_MOUNTAINS',
  FOREST: 'FOREST',
  DESERT: 'DESERT',
  SKY_ISLANDS: 'SKY_ISLANDS',
  KAMIS_REALM: 'KAMIS_REALM'
};

export const BIOME_SEQUENCE = [
  BIOMES.EARTH_VALLEY,
  BIOMES.ROCKY_MOUNTAINS,
  BIOMES.FOREST,
  BIOMES.DESERT,
  BIOMES.SKY_ISLANDS,
  BIOMES.KAMIS_REALM
];

export const BIOME_DISTANCES = {
  [BIOMES.EARTH_VALLEY]: 0,
  [BIOMES.ROCKY_MOUNTAINS]: 1200,
  [BIOMES.FOREST]: 2800,
  [BIOMES.DESERT]: 4800,
  [BIOMES.SKY_ISLANDS]: 7200,
  [BIOMES.KAMIS_REALM]: 10000
};

export const TIMES_OF_DAY = {
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  SUNSET: 'SUNSET',
  EVENING: 'EVENING',
  NIGHT: 'NIGHT',
  SUNRISE: 'SUNRISE'
};

export const WEATHERS = {
  CLEAR: 'CLEAR',
  CLOUDY: 'CLOUDY',
  RAIN: 'RAIN',
  THUNDERSTORM: 'THUNDERSTORM',
  FOG: 'FOG',
  SANDSTORM: 'SANDSTORM'
};

export const POWER_UPS = {
  NIMBUS: 'NIMBUS',
  SENZU_BEAN: 'SENZU_BEAN',
  KI_BOOST: 'KI_BOOST',
  MAGNETIC_AURA: 'MAGNETIC_AURA',
  ZENKAI_BOOST: 'ZENKAI_BOOST'
};

export const POWER_UP_CONFIG = {
  [POWER_UPS.NIMBUS]: {
    name: 'Flying Nimbus',
    duration: 10,
    color: '#ffdd33',
    description: 'Auto-flying shield & invulnerability'
  },
  [POWER_UPS.SENZU_BEAN]: {
    name: 'Senzu Bean',
    duration: 15,
    color: '#70d44b',
    description: 'Protective recovery shield'
  },
  [POWER_UPS.KI_BOOST]: {
    name: 'Ki Surge',
    duration: 0,
    color: '#00d2ff',
    description: 'Instant +50% Ki energy'
  },
  [POWER_UPS.MAGNETIC_AURA]: {
    name: 'Magnetic Aura',
    duration: 12,
    color: '#bb44ff',
    description: 'Draws all nearby collectibles'
  },
  [POWER_UPS.ZENKAI_BOOST]: {
    name: 'Zenkai Boost',
    duration: 8,
    color: '#ff2255',
    description: 'Fierce speed boost & double points'
  }
};

export const OBSTACLE_TYPES = {
  STATIC_ROCK: 'STATIC_ROCK',
  FALLEN_LOG: 'FALLEN_LOG',
  LOW_BARRIER: 'LOW_BARRIER',
  OVERHEAD_ARCH: 'OVERHEAD_ARCH',
  OVERHEAD_BEAM: 'OVERHEAD_BEAM',
  ROLLING_BOULDER: 'ROLLING_BOULDER',
  ENERGY_BARRIER: 'ENERGY_BARRIER',
  PILLAR: 'PILLAR'
};

export const COLLECTIBLE_TYPES = {
  DRAGON_BALL: 'DRAGON_BALL',
  KI_ORB: 'KI_ORB',
  POWER_UP: 'POWER_UP'
};

export const MILESTONES = [
  { distance: 500, title: 'First Journey', rewardXp: 200 },
  { distance: 1000, title: 'Rising Saiyan', rewardXp: 400 },
  { distance: 2500, title: 'Skilled Warrior', rewardXp: 800 },
  { distance: 5000, title: 'Super Warrior', rewardXp: 1500 },
  { distance: 10000, title: 'Elite Saiyan', rewardXp: 3000 },
  { distance: 25000, title: 'Legendary Warrior', rewardXp: 6000 },
  { distance: 50000, title: 'Limit Breaker', rewardXp: 12000 },
  { distance: 100000, title: 'Universe Legend', rewardXp: 25000 }
];

export const DIFFICULTY_STAGES = [
  { name: 'Beginner', minDistance: 0, speed: 14, obstacleFreq: 0.35, safeGap: 30 },
  { name: 'Easy', minDistance: 500, speed: 16, obstacleFreq: 0.45, safeGap: 26 },
  { name: 'Normal', minDistance: 1500, speed: 18.5, obstacleFreq: 0.55, safeGap: 22 },
  { name: 'Hard', minDistance: 3000, speed: 21, obstacleFreq: 0.65, safeGap: 19 },
  { name: 'Expert', minDistance: 5000, speed: 24, obstacleFreq: 0.75, safeGap: 16 },
  { name: 'Insane', minDistance: 10000, speed: 27, obstacleFreq: 0.85, safeGap: 14 },
  { name: 'Legendary', minDistance: 20000, speed: 30, obstacleFreq: 0.95, safeGap: 12 }
];
