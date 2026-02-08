import { ref, readonly } from '@vue/reactivity';
import type { ProgressView } from '../types';

export function useProgress() {
  const progress = ref<ProgressView | null>(null);

  const show = (data: ProgressView) => {
    progress.value = data;
  };

  const update = (percent: number | null) => {
    if (progress.value) {
      progress.value.percent = percent;
    }
  };

  const clear = () => {
    progress.value = null;
  };

  return {
    data: readonly(progress),
    show,
    update,
    clear,
    onAbort: () => progress.value?.abortHook?.(),
    get isActive() {
      return progress.value !== null;
    },
  };
}
