import { useEffect, useRef } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const FramerateCounter = () => {
  const [fps, setFPS] = useDebouncedValue(0, 40);

  const animationFrame = useRef<number>(0);
  const lastTime = useRef<number>(performance.now());

  useEffect(() => {
    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTime.current;

      setFPS(Math.round(1000 / delta));

      lastTime.current = now;
      animationFrame.current = requestAnimationFrame(measureFPS);
    };

    animationFrame.current = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(animationFrame.current);
  }, [setFPS]);

  return (
    <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 p-2 text-sm">
      {fps} FPS
    </div>
  );
};

export default FramerateCounter;
