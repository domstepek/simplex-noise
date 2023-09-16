import React, { FC, Suspense, useRef, useState } from 'react';

import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { NoiseShaderMaterial } from './shader/material';
import { hexToThreeVector } from './utils/misc';

extend({ NoiseShaderMaterial });

const NoiseValues = {
  freq: 0.75,
  amp: 0.25,
  hardness: 1.25,
  octaves: 8,
  lacunarity: 1,
};

// HEX values for primary and secondary colors
const ColorValues = {
  // primaryColor: new THREE.Vector3(0, 110, 255),
  primaryColor: '#006eff',
  // secondaryColor: new THREE.Vector3(26, 0, 132),
  secondaryColor: '#1a0084',
};

/** Tuples of [display, min, max, step] for each noise property */
const NoiseRangeOptions = {
  freq: ['Frequency, amount of noise', 0, 2, 0.05],
  amp: ['Amplitude, noise speed', 0, 1, 0.005],
  hardness: ['Hardness, noise contrast', 0, 5, 0.05],
  octaves: ['Octaves, noise detail', 0, 12, 0.5],
  lacunarity: ['Lacunarity, noise detail multiplier', 0, 2, 0.005],
} as const;

const Noise: FC<
  typeof NoiseValues &
    typeof ColorValues & {
      status: 'running' | 'paused';
    }
> = ({
  freq,
  amp,
  hardness,
  octaves,
  lacunarity,
  primaryColor,
  secondaryColor,
  status,
}) => {
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
        }}
      />
    </mesh>
  );
};

const ShaderCanvas = () => {
  const [status, setStatus] = useState<'running' | 'paused'>('running');
  const [noise, setNoise] = useState(NoiseValues);
  const [color, setColor] = useState(ColorValues);

  const updateNoise =
    (property: keyof typeof noise) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNoise((prev) => ({
        ...prev,
        [property]: Number(e.target.value),
      }));
    };

  const updateColor =
    (property: keyof typeof color) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setColor((prev) => ({
        ...prev,
        [property]: e.target.value,
      }));
    };

  return (
    <>
      <Canvas>
        <Suspense fallback={null}>
          <Noise
            {...{
              status,
              ...noise,
              ...color,
            }}
          />
        </Suspense>
      </Canvas>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          bottom: 0,
          left: 0,
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
        }}
      >
        <button
          onClick={() =>
            setStatus((prev) => (prev === 'running' ? 'paused' : 'running'))
          }
          style={{
            alignSelf: 'flex-start',
          }}
        >
          {status === 'running' ? 'Pause' : 'Resume'}
        </button>
        {Object.entries(color).map(([key, value]) => {
          const keyName = key as keyof typeof ColorValues;

          return (
            <div
              key={keyName}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <input
                id={keyName}
                type="color"
                value={value}
                onChange={updateColor(keyName)}
              />
              <label htmlFor={keyName}>
                {keyName} ({value})
              </label>
            </div>
          );
        })}

        {Object.entries(noise).map(([key, value]) => {
          const keyName = key as keyof typeof NoiseRangeOptions;

          const [display, min, max, step] = NoiseRangeOptions[keyName];

          return (
            <div
              key={keyName}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '500px',
                gap: '1rem',
                justifyContent: 'space-between',
              }}
            >
              <input
                id={keyName}
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={updateNoise(keyName)}
                style={{
                  width: '100%',
                }}
              />
              <label
                htmlFor={keyName}
                style={{
                  minWidth: '280px',
                  flexShrink: 0,
                  textAlign: 'left',
                }}
              >
                {display} ({value})
              </label>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ShaderCanvas;
