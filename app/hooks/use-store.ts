import { useState, useEffect } from 'react';
import { store } from '../data/store';

/**
 * Hook that subscribes to store updates and returns store access functions.
 * Triggers re-render whenever store data changes.
 */
export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setTick((t) => t + 1));
    return () => { unsubscribe(); };
  }, []);

  return store;
}
