import { reactive } from '@vue/reactivity';

export function useNotify(displayDuration = 4000) {
  const uiState = reactive<{ loading: boolean; error: string }>({
    loading: false,
    error: '',
  });

  let errorTimer: number | undefined;

  const notify = (message: string): void => {
    uiState.error = message;
    if (errorTimer) clearTimeout(errorTimer);
    errorTimer = window.setTimeout(() => {
      uiState.error = '';
    }, displayDuration);
  };

  return { uiState, notify };
}
