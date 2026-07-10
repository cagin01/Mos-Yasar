import { createExternalStore } from './createExternalStore';

interface UiState {
  isTopOverlayVisible: boolean;
}

const store = createExternalStore<UiState>({
  isTopOverlayVisible: false,
});

export const uiStore = {
  getState: store.getState,
  setTopOverlayVisible(isTopOverlayVisible: boolean) {
    if (store.getState().isTopOverlayVisible === isTopOverlayVisible) return;
    store.setState({ isTopOverlayVisible });
  },
};

export function useUiStore() {
  const state = store.useStore();
  return {
    ...state,
    setTopOverlayVisible: uiStore.setTopOverlayVisible,
  };
}
