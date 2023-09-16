import { Dispatch, useState } from 'react';

import { useDebounce } from 'react-use';

export const useDebouncedValue = <T>(
  initialValue: T,
  delay: number
): [T, Dispatch<T>] => {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useDebounce(() => setDebouncedValue(value), delay, [value]);

  return [debouncedValue, setValue];
};
