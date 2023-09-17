import React, { FC, Suspense, useRef } from 'react';

import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { NoiseShaderMaterial } from '../shader/material';
import { hexToThreeVector } from '../utils/misc';

import { useAppContext } from '../App.context';

extend({ NoiseShaderMaterial });

const Noise: FC = () => {
  const {
    noise: { freq, amp, hardness, octaves, lacunarity },
    color: { primaryColor, secondaryColor },
    clamp,
    status,
  } = useAppContext();

  const ref = useRef({
    uTime: 0,
  });

  const { viewport } = useThree();

  useFrame(({ clock }) => {
    if (status === 'paused') return;
    ref.current.uTime = clock.getElapsedTime();
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <noiseShaderMaterial
        ref={ref}
        {...{
          uFreq: freq,
          uAmp: amp,
          uHardness: hardness,
          uOctaves: octaves,
          uLacunarity: lacunarity,
          uPrimaryColor: hexToThreeVector(primaryColor),
          uSecondaryColor: hexToThreeVector(secondaryColor),
          uClamp: clamp,
        }}
      />
    </mesh>
  );
};

const WebGL = () => {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <Noise />
      </Suspense>
    </Canvas>
  );
};

export default WebGL;
