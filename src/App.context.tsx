import {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';
import { NoiseValues, ColorValues, TransformValues } from './App.constants';

type Status = 'running' | 'paused';
type Renderer = 'basic' | 'webgl' | 'webgpu';
type Setter<T> = Dispatch<SetStateAction<T>>;

const defaultState = {
  transform: TransformValues,
  noise: NoiseValues,
  color: ColorValues,
  clamp: true,
  renderer: 'webgpu' as Renderer,
  status: 'running' as Status,
  setTransform: (() => { }) as Setter<typeof TransformValues>,
  setNoise: (() => { }) as Setter<typeof NoiseValues>,
  setColor: (() => { }) as Setter<typeof ColorValues>,
  setClamp: (() => { }) as Setter<boolean>,
  setRenderer: (() => { }) as Setter<Renderer>,
  setStatus: (() => { }) as Setter<Status>,
};

const AppContext = createContext(defaultState);

export const AppContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [transform, setTransform] = useState(defaultState.transform);
  const [noise, setNoise] = useState(defaultState.noise);
  const [color, setColor] = useState(defaultState.color);
  const [clamp, setClamp] = useState(defaultState.clamp);

  const [renderer, setRenderer] = useState<Renderer>(defaultState.renderer);
  const [status, setStatus] = useState<Status>(defaultState.status);

  return (
    <AppContext.Provider
      value={{
        transform,
        noise,
        color,
        clamp,
        renderer,
        status,
        setTransform,
        setNoise,
        setColor,
        setClamp,
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
