export const NoiseValues = {
  freq: 0.75,
  amp: 0.25,
  hardness: 1.25,
  octaves: 8,
  lacunarity: 1,
};

// HEX values for primary and secondary colors
export const ColorValues = {
  // primaryColor: new THREE.Vector3(0, 110, 255),
  primaryColor: '#006eff',
  // secondaryColor: new THREE.Vector3(26, 0, 132),
  secondaryColor: '#1a0084',
};

/** Tuples of [display, min, max, step] for each noise property */
export const NoiseRangeOptions = {
  freq: ['Frequency, amount of noise', 0, 4, 0.05],
  amp: ['Amplitude, noise speed', 0, 1, 0.005],
  hardness: ['Hardness, noise contrast', 0, 5, 0.05],
  octaves: ['Octaves, noise detail', 0, 12, 0.5],
  lacunarity: ['Lacunarity, noise detail multiplier', 0, 2, 0.005],
} as const;
