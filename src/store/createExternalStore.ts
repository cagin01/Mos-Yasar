import { useSyncExternalStore } from 'react';

type Listener = () => void;

export function createExternalStore<State>(initialState: State) {
  const listeners = new Set<Listener>();
  let state = initialState;

  function emitChange() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getState() {
    return state;
  }

  function setState(nextState: State | ((currentState: State) => State)) {
    state = typeof nextState === 'function'
      ? (nextState as (currentState: State) => State)(state)
      : nextState;
    emitChange();
  }

  function useStore() {
    return useSyncExternalStore(subscribe, getState, getState);
  }

  return {
    getState,
    setState,
    subscribe,
    useStore,
  };
}
