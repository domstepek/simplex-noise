import { useAppContext } from './App.context';

import { ColorValues, NoiseRangeOptions } from './App.constants';

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
      <label
        htmlFor="GPUEnabled"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        GPU Optimized
        <input
          id="GPUEnabled"
          type="checkbox"
          checked={GPUEnabled}
          onChange={(e) => setGPUEnabled(e.target.checked)}
        />
      </label>
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
          <label
            key={keyName}
            htmlFor={keyName}
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
            {keyName} ({value})
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
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '600px',
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
                width: '325px',
              }}
            />
            {display} ({value})
          </label>
        );
      })}
    </div>
  );
};

export default Controls;
