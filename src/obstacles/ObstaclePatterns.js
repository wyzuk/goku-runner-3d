import { LANES, OBSTACLE_TYPES } from '../utils/Constants.js';

export const PATTERNS = [
  // 1. Single Rock Left
  [
    { lane: 0, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 }
  ],
  // 2. Single Rock Center
  [
    { lane: 1, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 }
  ],
  // 3. Single Rock Right
  [
    { lane: 2, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 }
  ],
  // 4. Low Barrier Center (Jumpable or dodge)
  [
    { lane: 1, type: OBSTACLE_TYPES.LOW_BARRIER, offsetZ: 0 }
  ],
  // 5. Overhead Arch Center (Slidable or dodge)
  [
    { lane: 1, type: OBSTACLE_TYPES.OVERHEAD_ARCH, offsetZ: 0 }
  ],
  // 6. Left & Right Blocked (Must run center)
  [
    { lane: 0, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 },
    { lane: 2, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 }
  ],
  // 7. Center & Left Blocked (Must run right)
  [
    { lane: 0, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 },
    { lane: 1, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 }
  ],
  // 8. Center & Right Blocked (Must run left)
  [
    { lane: 1, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 },
    { lane: 2, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 }
  ],
  // 9. Low Barrier Left + Low Barrier Right (Center open or jump)
  [
    { lane: 0, type: OBSTACLE_TYPES.LOW_BARRIER, offsetZ: 0 },
    { lane: 2, type: OBSTACLE_TYPES.LOW_BARRIER, offsetZ: 0 }
  ],
  // 10. Overhead Arch across Left + Rock Center (Right lane open)
  [
    { lane: 0, type: OBSTACLE_TYPES.OVERHEAD_ARCH, offsetZ: 0 },
    { lane: 1, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 }
  ],
  // 11. Staggered Left then Right
  [
    { lane: 0, type: OBSTACLE_TYPES.STATIC_ROCK, offsetZ: 0 },
    { lane: 2, type: OBSTACLE_TYPES.LOW_BARRIER, offsetZ: 14 }
  ],
  // 12. Rolling Boulder in Center Lane
  [
    { lane: 1, type: OBSTACLE_TYPES.ROLLING_BOULDER, offsetZ: 0 }
  ]
];

export function getRandomPattern(difficultyStage = 1) {
  // At beginner stage (1), use simpler single obstacle patterns
  let maxIdx = Math.min(PATTERNS.length, 5 + difficultyStage * 2);
  const idx = Math.floor(Math.random() * maxIdx);
  return PATTERNS[idx];
}
