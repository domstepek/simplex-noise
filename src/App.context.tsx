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

type Setter<T> = Dispatch<SetStateAction<T>>;

const defaultState = {
  noise: NoiseValues,
  color: ColorValues,
  GPUEnabled: false,
  status: 'running',
  setNoise: (() => {}) as Setter<typeof NoiseValues>,
  setColor: (() => {}) as Setter<typeof ColorValues>,
  setGPUEnabled: (() => {}) as Setter<boolean>,
  setStatus: (() => {}) as Setter<Status>,
};

const AppContext = createContext(defaultState);

export const AppContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [noise, setNoise] = useState(NoiseValues);
  const [color, setColor] = useState(ColorValues);
  const [GPUEnabled, setGPUEnabled] = useState(false);
  const [status, setStatus] = useState<Status>('running');

  return (
    <AppContext.Provider
      value={{
        noise,
        color,
        GPUEnabled,
        status,
        setNoise,
        setColor,
        setGPUEnabled,
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
