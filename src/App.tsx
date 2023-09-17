import { Suspense, lazy } from 'react';

import FramerateCounter from './components/FramerateCounter';
import Controls from './components/Controls';

import { withAppContext, useAppContext } from './App.context';

import './index.css';

const Basic = lazy(() => import('./components/Basic'));
const WebGPU = lazy(() => import('./components/WebGPU'));
const WebGL = lazy(() => import('./components/WebGL'));

const App = () => {
  const { renderer } = useAppContext();

  const Renderer = {
    basic: Basic,
    webgpu: WebGPU,
    webgl: WebGL,
  }[renderer];

  return (
    <>
      <Suspense
        fallback={
          <div className="w-screen h-screen flex justify-center items-center">
            <p>Loading...</p>
          </div>
        }
      >
        <Renderer />
      </Suspense>
      <FramerateCounter />
      <Controls />
    </>
  );
};

const AppWithAppContext = withAppContext(App);

export default AppWithAppContext;
