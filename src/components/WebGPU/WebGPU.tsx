import { useEffect, useState, ElementRef, useRef } from 'react';

// Packages
import { useWindowSize } from 'react-use';

// Utils
import { useAppContext } from '../../App.context';
import Renderer from './renderer';
import { WebGPUInitError } from './utils';
import { hexToVectorArray } from '../../utils/misc';

// Types
import { WebGPUErrorType } from './types';

// Constants
import { WebGPUErrors } from './constants';

const WebGPU = () => {
  const {
    transform: {
      projection: {
        fov,
        far,
        near,
      }
    },
    noise: { freq, amp, hardness, octaves, lacunarity },
    color: { primaryColor, secondaryColor },
    clamp,
  } = useAppContext();

  const [gpuSupport, setGPUSupport] = useState<{
    supported: boolean;
    error: WebGPUErrorType | null;
  }>({
    supported: false,
    error: null,
  });

  const [canvasRef, setCanvasRef] = useState<ElementRef<'canvas'> | null>(null);

  const renderer = useRef<Renderer | null>(null);

  const windowSize = useWindowSize();

  useEffect(() => {
    const initializeWebGPU = async () => {
      if (!canvasRef) return;

      const _renderer = new Renderer(canvasRef);

      try {
        await _renderer.init();

        setGPUSupport({
          supported: true,
          error: null,
        });
      } catch (error) {
        if (error instanceof WebGPUInitError) {
          setGPUSupport({
            supported: false,
            error: error.type,
          });
        }

        return;
      }

      _renderer.render();

      renderer.current = _renderer;
    };

    initializeWebGPU();

    return () => {
      if (renderer.current?.device) {
        renderer.current.device.destroy();
      }
    };
  }, [canvasRef]);

  useEffect(() => {
    if (!renderer.current) return;

    renderer.current.transform.projection = {
      fov, far, near
    };

    renderer.current.updateModelViewProjectionSettings();
  }, [fov, far, near]);

  useEffect(() => {
    if (!renderer.current) return;

    renderer.current.noiseSettings = {
      freq,
      amp,
      hardness,
      octaves,
      lacunarity,
    };

    renderer.current.updateNoiseSettings();
  }, [freq, amp, hardness, octaves, lacunarity]);

  useEffect(() => {
    if (!renderer.current) return;

    renderer.current.colorSettings = {
      primaryColor: hexToVectorArray(primaryColor),
      secondaryColor: hexToVectorArray(secondaryColor),
    };

    renderer.current.updateColorSettings();
  }, [primaryColor, secondaryColor]);

  useEffect(() => {
    if (!renderer.current) return;

    renderer.current.clampSettings = clamp;

    renderer.current.updateClampSettings();
  }, [clamp]);

  if (!gpuSupport.supported && gpuSupport.error) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <p>{WebGPUErrors[gpuSupport.error!]}</p>
      </div>
    );
  }

  return (
    <canvas
      ref={setCanvasRef}
      className="w-screen h-screen"
      width={windowSize.width}
      height={windowSize.height}
    />
  );
};

export default WebGPU;
