import { ElementRef, useCallback, useEffect, useMemo, useRef } from 'react';

import { useWindowSize } from 'react-use';

import { simplex3_Fractal } from '../utils/simplex-noise-1';
import { hexToRgb } from '../utils/misc';
import { useAppContext } from '../App.context';

const CONFIG = {
  scale: 1,
};

const Basic = () => {
  const {
    noise: { freq, amp, hardness, octaves, lacunarity },
    color: { primaryColor, secondaryColor },
  } = useAppContext();

  const canvasRef = useRef<ElementRef<'canvas'>>(null);
  const imageData = useRef<ImageData | null>(null);

  const requestRef = useRef<number>(0);

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const canvasWidth = windowWidth * CONFIG.scale;
  const canvasHeight = windowHeight * CONFIG.scale;

  const gradient = useMemo(
    () => [
      { value: 0, color: hexToRgb(primaryColor) },
      { value: 1, color: hexToRgb(secondaryColor) },
    ],
    [primaryColor, secondaryColor]
  );

  // Create the image
  const createImage = useCallback(
    (offset: number) => {
      if (!imageData.current) return;

      // Loop over all of the pixels
      for (let x = 0; x < canvasWidth; x++) {
        for (let y = 0; y < canvasHeight; y++) {
          // PIXEL COLOR

          // const value = Math.floor(Math.random()*256);
          const lTime = Math.sin(offset / 5000) * 5 * amp;
          let value =
            simplex3_Fractal(
              (x * freq) / 1000,
              (y * freq) / 1000,
              lTime,
              octaves,
              lacunarity
            ) * hardness;
          value = (value + 1) / 2; // From  [-1, 1] to [0, 1]

          // Interpolate between the colors in the gradient
          const color = { r: 0, g: 0, b: 0 };
          for (let i = 0; i < gradient.length - 1; i++) {
            if (value >= gradient[i].value && value <= gradient[i + 1].value) {
              const t =
                (value - gradient[i].value) /
                (gradient[i + 1].value - gradient[i].value);
              color.r =
                gradient[i].color.r +
                (gradient[i + 1].color.r - gradient[i].color.r) * t;
              color.g =
                gradient[i].color.g +
                (gradient[i + 1].color.g - gradient[i].color.g) * t;
              color.b =
                gradient[i].color.b +
                (gradient[i + 1].color.b - gradient[i].color.b) * t;
              break;
            }
          }

          // SET PIXEL DATA
          // Get the pixel index
          const pixelindex = (y * canvasWidth + x) * 4;

          // Set the pixel data
          imageData.current.data[pixelindex] = color.r;
          imageData.current.data[pixelindex + 1] = color.g;
          imageData.current.data[pixelindex + 2] = color.b;
          imageData.current.data[pixelindex + 3] = 255;
        }
      }
    },
    [
      canvasWidth,
      canvasHeight,
      freq,
      amp,
      hardness,
      octaves,
      lacunarity,
      gradient,
    ]
  );

  const animate = useCallback(
    (time: number) => {
      // Put the image data onto the canvas
      const ctx = canvasRef.current?.getContext('2d');

      if (ctx && imageData.current) {
        // Create the image
        createImage(time);
        ctx.putImageData(imageData.current, 0, 0);
      }

      requestRef.current = requestAnimationFrame(animate);
    },
    [createImage]
  );

  useEffect(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);

    imageData.current = new ImageData(
      windowWidth * CONFIG.scale,
      windowHeight * CONFIG.scale
    );

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [windowWidth, windowHeight, animate]);

  return (
    <div
      style={{
        width: canvasWidth,
        height: canvasHeight,
        position: 'absolute',
        top: '50%',
        left: '50%',
        translate: '-50% -50%',
      }}
    >
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
    </div>
  );
};

export default Basic;
