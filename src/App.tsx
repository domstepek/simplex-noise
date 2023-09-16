import Basic from './Basic';
import ShaderCanvas from './ShaderCanvas';

import FramerateCounter from './FramerateCounter';

import { withAppContext, useAppContext } from './App.context';

import './index.css';
import Controls from './Controls';

const App = () => {
  const { GPUEnabled } = useAppContext();

  return (
    <>
      {GPUEnabled ? <ShaderCanvas /> : <Basic />}
      <FramerateCounter />
      <Controls />
    </>
  );
};

const AppWithAppContext = withAppContext(App);

export default AppWithAppContext;
