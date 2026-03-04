// ═══════════════════════════════════════════════════
// Data Dash — Level Registry
// ═══════════════════════════════════════════════════

import type { LevelConfig, LevelNumber } from '../constants';
import { getLevel1Config } from './level1-twitter';
import { getLevel2Config } from './level2-linkedin';
import { getLevel3Config } from './level3-bluesky';
import { getLevel4Config } from './level4-arxiv';
import { getLevel5Config } from './level5-philpapers';
import { getLevel6Config } from './level6-ssrn';

const levelFactories: Record<LevelNumber, () => LevelConfig> = {
  1: getLevel1Config,
  2: getLevel2Config,
  3: getLevel3Config,
  4: getLevel4Config,
  5: getLevel5Config,
  6: getLevel6Config,
};

export function getLevelConfig(level: LevelNumber): LevelConfig {
  const factory = levelFactories[level];
  if (!factory) throw new Error(`No config for level ${level}`);
  return factory();
}

export function getTotalLevels(): number {
  return 6;
}
