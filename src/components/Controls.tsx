import { useState } from 'react';

import { useAppContext } from '../App.context';

import { ColorValues, ColorOptions, NoiseRangeOptions } from '../App.constants';

export const Controls = () => {
  const {
    status,
    setStatus,
    noise,
    setNoise,
    color,
    setColor,
    GPUEnabled,
    setGPUEnabled,
  } = useAppContext();

  const [visible, setVisible] = useState(false);

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

  const toggleControlsVisible = () => {
    if ('startViewTransition' in document) {
      document.startViewTransition!(() => {
        setVisible((prev) => !prev);
      });
    } else {
      setVisible((prev) => !prev);
    }
  };

  return (
    <div className="absolute flex flex-col gap-4 bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white text-xs shadow-lg">
      <div className="flex items-center gap-4 justify-between">
        <label htmlFor="GPUEnabled" className="flex items-center gap-4">
          GPU Optimized
          <input
            id="GPUEnabled"
            type="checkbox"
            checked={GPUEnabled}
            onChange={(e) => setGPUEnabled(e.target.checked)}
          />
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              setStatus((prev) => (prev === 'running' ? 'paused' : 'running'))
            }
            className="self-start px-4 py-2 rounded-md shadow-md bg-stone-400"
          >
            {status === 'running' ? 'Pause' : 'Resume'}
          </button>

          <button
            onClick={toggleControlsVisible}
            className="self-start px-4 py-2 rounded-md shadow-md bg-stone-400"
          >
            {visible ? 'Hide' : 'Show'} Controls
          </button>
        </div>
      </div>
      <div
        className={`flex-col gap-4 ${visible ? 'flex' : 'hidden'}`}
        id="control-box"
      >
        {Object.entries(color).map(([key, value]) => {
          const keyName = key as keyof typeof ColorValues;

          const [display] = ColorOptions[keyName];

          return (
            <label
              key={keyName}
              htmlFor={keyName}
              className="flex items-center gap-4"
            >
              <input
                id={keyName}
                type="color"
                value={value}
                onChange={updateColor(keyName)}
              />
              {display} ({value})
            </label>
          );
        })}
        {Object.entries(noise).map(([key, value]) => {
          const keyName = key as keyof typeof NoiseRangeOptions;
          const [display, min, max, step] = NoiseRangeOptions[keyName];

          return (
            <label
              key={keyName}
              htmlFor={keyName}
              className="flex items-center gap-4 w-[600px] justify-between whitespace-nowrap"
            >
              <input
                id={keyName}
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={updateNoise(keyName)}
                className="w-[325px]"
              />
              {display} ({value})
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default Controls;