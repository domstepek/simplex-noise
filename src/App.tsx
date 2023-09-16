import { Suspense, lazy } from 'react';

import FramerateCounter from './components/FramerateCounter';
import Controls from './components/Controls';

import { withAppContext, useAppContext } from './App.context';

import './index.css';

const Basic = lazy(() => import('./components/Basic'));
const ShaderCanvas = lazy(() => import('./components/ShaderCanvas'));

const App = () => {
  const { GPUEnabled } = useAppContext();

  return (
    <>
      <Suspense
        fallback={
          <div className="w-screen h-screen flex justify-center items-center">
            <p>Loading...</p>
          </div>
        }
      >
        {GPUEnabled ? <ShaderCanvas /> : <Basic />}
      </Suspense>
      <FramerateCounter />
      <Controls />
    </>
  );
};

const AppWithAppContext = withAppContext(App);

export default AppWithAppContext;
