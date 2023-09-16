/// <reference types="vite/client" />

import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      noiseShaderMaterial: ThreeElements.ShaderMaterial;
    }
  }
}
