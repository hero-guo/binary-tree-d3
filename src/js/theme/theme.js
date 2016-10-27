// All paths except vizuly/core get their own namespace as denoted by the _path.js file
import weightedTree from './weightedtree';

const theme = {
  weightedTree,
};
const config = {
  WEIGHTED_TREE_AXIIS: 'Axiis',
  COLUMNBAR_AXIIS: 'Axiis',
  COLUMNBAR_NEON: 'Neon',
  COLUMNBAR_MATERIALBLUE: 'MaterialBlue',
  COLUMNBAR_MATERIALPINK: 'MaterialPink',
  LINEAREA_AXIIS: 'Axiis',
  LINEAREA_NEON: 'Neon',
  LINEAREA_FIRE: 'Fire',
  LINEAREA_OCEAN: 'Ocean',
  LINEAREA_SUNSET: 'Sunset',
  LINEAREA_BUSINESS: 'Business',
  HALO_FIRE: 'Fire',
  HALO_SUNSET: 'Sunset',
  HALO_NEON: 'Neon',
  HALO_OCEAN: 'Ocean',
  SCATTER_NEON: 'Neon',
  SCATTER_FIRE: 'Fire',
  SCATTER_OCEAN: 'Ocean',
  SCATTER_SUNSET: 'Sunset',
  SCATTER_BUSINESS: 'Business',
  RADIAL_PROGRESS_FIRE: 'Fire',
  RADIAL_PROGRESS_MATERIAL: 'Material',
  RADIAL_PROGRESS_NEON: 'Neon',
  RADIAL_PROGRESS_OCEAN: 'Ocean',
  RADIAL_PROGRESS_ALERT: 'Alert',
  RADIAL_PROGRESS_BUSINESS: 'Business',
};

export {theme, config};
