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
    clamp,
    setClamp,
    renderer,
    setRenderer,
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

  const swapColors = () => {
    setColor(prev => ({
      primaryColor: prev.secondaryColor,
      secondaryColor: prev.primaryColor
    }));
  }

  return (
    <div className="absolute flex flex-col gap-4 bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white text-xs shadow-lg">
      <div className="flex items-center gap-4 justify-between">
        {/* Create a radio button group for renderer */}
        <div className="flex items-center gap-4">
          <label
            htmlFor="basic"
            onClick={() => setRenderer('basic')}
            className="flex items-center gap-1 cursor-pointer"
          >
            Pure JS
            <input
              readOnly
              id="basic"
              type="radio"
              name="renderer"
              value="basic"
              checked={renderer === 'basic'}
            />
          </label>
          <label
            htmlFor="webgl"
            onClick={() => setRenderer('webgl')}
            className="flex items-center gap-1 cursor-pointer"
          >
            WebGL
            <input
              readOnly
              id="webgl"
              type="radio"
              name="renderer"
              value="webgl"
              checked={renderer === 'webgl'}
            />
          </label>
          <label
            htmlFor="webgpu"
            onClick={() => setRenderer('webgpu')}
            className="flex items-center gap-1 cursor-pointer"
          >
            WebGPU
            <input
              readOnly
              id="webgpu"
              type="radio"
              name="renderer"
              value="webgpu"
              checked={renderer === 'webgpu'}
            />
          </label>
        </div>

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
        <label
          htmlFor="clamp"
          className="flex items-center gap-1 cursor-pointer"
        >
          <input
            id="clamp"
            type="checkbox"
            checked={clamp}
            onChange={() => setClamp((prev) => !prev)}
          />
          Clamp Colors (Prevents hardness from allowing colors to go out of
          range)
        </label>
        <div className="relative flex flex-col gap-4 justify-start">
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
          <button className="absolute left-[150px] top-1/2 text-lg -translate-y-1/2" onClick={swapColors}>
            {"\u21F3"}
          </button>
        </div>
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
