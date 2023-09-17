import {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';
import { NoiseValues, ColorValues } from './App.constants';

type Status = 'running' | 'paused';

type Renderer = 'basic' | 'webgl' | 'webgpu';

type Setter<T> = Dispatch<SetStateAction<T>>;

const defaultState = {
  noise: NoiseValues,
  color: ColorValues,
  renderer: 'basic' as Renderer,
  status: 'running' as Status,
  setNoise: (() => {}) as Setter<typeof NoiseValues>,
  setColor: (() => {}) as Setter<typeof ColorValues>,
  setRenderer: (() => {}) as Setter<Renderer>,
  setStatus: (() => {}) as Setter<Status>,
};

const AppContext = createContext(defaultState);

export const AppContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [noise, setNoise] = useState(NoiseValues);
  const [color, setColor] = useState(ColorValues);
  const [renderer, setRenderer] = useState<Renderer>('basic');
  const [status, setStatus] = useState<Status>('running');

  return (
    <AppContext.Provider
      value={{
        noise,
        color,
        renderer,
        status,
        setNoise,
        setColor,
        setRenderer,
        setStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): typeof defaultState => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }

  return context;
};

export const withAppContext =
  <P extends object>(Component: FC<P>): FC<P> =>
  (props) => {
    return (
      <AppContextProvider>
        <Component {...props} />
      </AppContextProvider>
    );
  };
