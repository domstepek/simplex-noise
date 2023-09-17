import { useEffect, useState, ElementRef } from 'react';

import {
  WebGPUInitError,
  getContext,
  getWebGPUDevice,
  renderImage,
} from './utils';
import { WebGPUErrorType } from './types';
import { WebGPUErrors } from './constants';
import { useWindowSize } from 'react-use';

const WebGPU = () => {
  const [gpuSupport, setGPUSupport] = useState<{
    supported: boolean;
    error: WebGPUErrorType | null;
  }>({
    supported: false,
    error: null,
  });

  const [canvasRef, setCanvasRef] = useState<ElementRef<'canvas'> | null>(null);

  const windowSize = useWindowSize();

  useEffect(() => {
    let device: GPUDevice;

    const initializeWebGPU = async () => {
      try {
        device = await getWebGPUDevice();

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

      if (!canvasRef || !device) return;

      let context: GPUCanvasContext;

      try {
        context = getContext(canvasRef, device);
      } catch (error) {
        if (error instanceof WebGPUInitError) {
          setGPUSupport({
            supported: false,
            error: error.type,
          });
        }

        return;
      }

      renderImage(context, device);
    };

    initializeWebGPU();

    return () => {
      if (device) device.destroy();
    };
  }, [canvasRef]);

  if (!gpuSupport.supported) {
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
