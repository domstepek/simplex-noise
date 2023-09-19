export const TransformValues = {
  resolution: [0, 0],
  projection: {
    fov: 0,
    near: 0,
    far: 0,
  },
  model: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [0, 0, 0],
  },
  view: {
    eye: [0, 0, 0],
    center: [0, 0, 0],
    up: [0, 0, 0],
  },
};

export const NoiseValues = {
  freq: 0.45,
  amp: 0.14,
  hardness: 1.2,
  octaves: 2,
  lacunarity: 0.845,
};

// HEX values for primary and secondary colors
export const ColorValues = {
  // primaryColor: new THREE.Vector3(0, 110, 255),
  primaryColor: '#1a0084',
  // primaryColor: '#3253FF',
  // secondaryColor: new THREE.Vector3(26, 0, 132),
  secondaryColor: '#3253FF',
  // secondaryColor: '#1a0084',
};

/** Tuples of [display, min, max, step] for each noise property */
export const NoiseRangeOptions = {
  freq: ['Frequency, amount of noise', 0, 4, 0.05],
  amp: ['Amplitude, noise speed', 0, 1, 0.005],
  hardness: ['Hardness, noise contrast', 0, 5, 0.05],
  octaves: ['Octaves, noise detail', 0, 12, 1],
  lacunarity: ['Lacunarity, noise detail multiplier', 0, 2, 0.005],
} as const;

export const ColorOptions = {
  primaryColor: ['Primary Color'],
  secondaryColor: ['Secondary Color'],
} as const;
