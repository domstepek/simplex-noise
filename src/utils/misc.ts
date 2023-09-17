import * as THREE from 'three';

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  // Remove the "#" character if present
  hex = hex.replace('#', '');

  // Parse the red, green, and blue components
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return the RGB color value as an object
  return { r, g, b };
};

export const hexToThreeVector = (hex: string): THREE.Vector3 => {
  const { r, g, b } = hexToRgb(hex);

  return new THREE.Vector3(r, g, b);
};

export const hexToVectorArray = (hex: string): number[] => {
  const { r, g, b } = hexToRgb(hex);

  return [r, g, b];
};
