import { ref, readonly } from '@vue/reactivity';
import type { ProgressData } from '../types';

export function useProgress(notify: (msg: string) => void) {
  const _progress = ref<ProgressData | null>(null);

  // Fungsi internal untuk mengupdate data tanpa memicu busy check
  const _patchProgress = (data: Partial<ProgressData>) => {
    if (_progress.value) {
      _progress.value = { ..._progress.value, ...data };
    }
  };

  const setProgress = (data: ProgressData): boolean => {
    // Jika masih ada proses, tampilkan notifikasi dan tolak (return false)
    if (_progress.value !== null) {
      notify(`Mohon tunggu, proses "${_progress.value.label}" belum selesai.`);
      return false;
    }
    _progress.value = data;
    return true;
  };

  const updatePercent = (percent: number) => {
    if (_progress.value) _progress.value.percent = percent;
  };

  const clearProgress = () => {
    _progress.value = null;
  };

  return {
    progress: readonly(_progress),
    setProgress,
    updatePercent,
    clearProgress,
    _patchProgress, // Digunakan untuk update internal seperti memasang 'abort'
  };
}
