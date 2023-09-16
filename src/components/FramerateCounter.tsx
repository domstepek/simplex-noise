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
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        fontSize: '1.5rem',
        color: 'white',
        backgroundColor: 'black',
      }}
    >
      {fps} FPS
    </div>
  );
};

export default FramerateCounter;
