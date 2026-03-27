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
import { getLevel7Config } from './level7-youtube';
import { getLevel8Config } from './level8-neurips';
import { getLevel9Config } from './level9-san-francisco';
import { getLevel10Config } from './level10-datacenter';
import {
  getLevel11Config,
  getLevel12Config,
  getLevel13Config,
  getLevel14Config,
  getLevel15Config,
  getLevel16Config,
  getLevel17Config,
  getLevel18Config,
  getLevel19Config,
  getLevel20Config,
  getLevel21Config,
} from './lateCampaign';

const levelFactories: Record<LevelNumber, () => LevelConfig> = {
  1: getLevel1Config,
  2: getLevel2Config,
  3: getLevel3Config,
  4: getLevel4Config,
  5: getLevel5Config,
  6: getLevel6Config,
  7: getLevel7Config,
  8: getLevel8Config,
  9: getLevel9Config,
 10: getLevel10Config,
  11: getLevel11Config,
  12: getLevel12Config,
  13: getLevel13Config,
  14: getLevel14Config,
  15: getLevel15Config,
  16: getLevel16Config,
  17: getLevel17Config,
  18: getLevel18Config,
  19: getLevel19Config,
  20: getLevel20Config,
  21: getLevel21Config,
};

export function getLevelConfig(level: LevelNumber): LevelConfig {
  const factory = levelFactories[level];
  if (!factory) throw new Error(`No config for level ${level}`);
  return factory();
}

export function getTotalLevels(): number {
  return 21;
}
