import React, { FC, useState } from 'react';

import { useAppContext } from '../App.context';

import { ColorValues, ColorOptions, NoiseRangeOptions } from '../App.constants';

interface RangeSliderProps {
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: React.InputHTMLAttributes<HTMLInputElement>['onChange'];
}

const RangeSlider: FC<RangeSliderProps> = ({
  display,
  min,
  max,
  step,
  value,
  onChange,
}) => {
  return (
    <label className="flex items-center gap-4 w-[600px] justify-between whitespace-nowrap">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-[325px]"
      />
      {display} ({value})
    </label>
  );
};

export const Controls = () => {
  const {
    status,
    setStatus,
    transform,
    setTransform,
    noise,
    setNoise,
    color,
    setColor,
    clamp,
    setClamp,
    renderer,
    setRenderer,
  } = useAppContext();

  type TransformTypes = keyof typeof transform;

  const [visible, setVisible] = useState(false);

  const updateTransform =
    <
      TProp extends TransformTypes,
      TSubProp extends keyof (typeof transform)[TProp]
    >(
      property: TProp,
      value: TSubProp,
      index: typeof property extends 'resolution'
        ? undefined
        : typeof property extends 'projection'
        ? undefined
        : number
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTransform((prev) => {
        if (
          !['resolution', 'projection'].includes(property) &&
          index !== undefined
        ) {
          const oldArr = prev[property][value] as number[];
          const newArr = [
            ...oldArr.slice(0, index),
            Number(e.target.value),
            ...oldArr.slice(index + 1),
          ];

          return {
            ...prev,
            [property]: {
              ...prev[property],
              [value]: newArr,
            },
          };
        }

        return {
          ...prev,
          [property]: {
            ...prev[property],
            [value]: Number(e.target.value),
          },
        };
      });
    };

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
    setColor((prev) => ({
      primaryColor: prev.secondaryColor,
      secondaryColor: prev.primaryColor,
    }));
  };

  return (
    <div className="absolute flex flex-col gap-4 bottom-0 left-0 p-4 bg-black bg-opacity-50 text-white text-xs shadow-lg">
      <div className="flex items-center gap-4 justify-between">
        {/* Create a radio button group for renderer */}
        <div className="flex items-center gap-4">
          <label
            onClick={() => setRenderer('basic')}
            className="flex items-center gap-1 cursor-pointer"
          >
            Pure JS
            <input
              readOnly
              type="radio"
              name="renderer"
              value="basic"
              checked={renderer === 'basic'}
            />
          </label>
          <label
            onClick={() => setRenderer('webgl')}
            className="flex items-center gap-1 cursor-pointer"
          >
            WebGL
            <input
              readOnly
              type="radio"
              name="renderer"
              value="webgl"
              checked={renderer === 'webgl'}
            />
          </label>
          <label
            onClick={() => setRenderer('webgpu')}
            className="flex items-center gap-1 cursor-pointer"
          >
            WebGPU
            <input
              readOnly
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
        <label className="flex items-center gap-1 cursor-pointer">
          <input
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
              <label className="flex items-center gap-4" key={key}>
                <input
                  type="color"
                  value={value}
                  onChange={updateColor(keyName)}
                />
                {display} ({value})
              </label>
            );
          })}
          <button
            className="absolute left-[150px] top-1/2 text-lg -translate-y-1/2"
            onClick={swapColors}
          >
            {'\u21F3'}
          </button>
        </div>
        {['X', 'Y', 'Z'].map((axis, index) => (
          <RangeSlider
            key={axis}
            display={`Position ${axis}`}
            min={
              {
                X: -window.innerWidth / 2,
                Y: -window.innerHeight / 2,
                Z: -10,
              }[axis]!
            }
            max={
              {
                X: window.innerWidth / 2,
                Y: window.innerHeight / 2,
                Z: 10,
              }[axis]!
            }
            step={0.01}
            onChange={updateTransform('model', 'position', index)}
            value={transform.model.position[index]}
          />
        ))}
        {['X', 'Y', 'Z'].map((axis, index) => (
          <RangeSlider
            key={axis}
            display={`Rotation ${axis}`}
            min={-180}
            max={180}
            step={0.01}
            onChange={updateTransform('model', 'rotation', index)}
            value={transform.model.rotation[index]}
          />
        ))}
        {['X', 'Y', 'Z'].map((axis, index) => (
          <RangeSlider
            key={`Eye ${axis}`}
            display={`Eye ${axis}`}
            min={-10}
            max={10}
            step={0.01}
            onChange={updateTransform('view', 'eye', index)}
            value={transform.view.eye[index]}
          />
        ))}

        {Object.entries(noise).map(([key, value]) => {
          const keyName = key as keyof typeof NoiseRangeOptions;
          const [display, min, max, step] = NoiseRangeOptions[keyName];

          return (
            <RangeSlider
              key={key}
              {...{
                display,
                min,
                max,
                step,
                value,
                onChange: updateNoise(keyName),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Controls;
