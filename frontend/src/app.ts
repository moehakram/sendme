import { computed, effect, reactive } from '@vue/reactivity';
import type { Elements, FileItem } from './types';
import { createFileService, UnauthorizedException } from './api';
import { handleTableClick } from './ui/handleTableClick';
import { authState, clearAuth, setToken } from './services/useAuth';
import { useNotify } from './services/useNotify';
import { useProgress } from './services/useProgress';
import { setupAllListeners } from './ui/setup-listeners';
import {
  renderBreadcrumb,
  renderProgress,
  renderStatus,
  renderTable,
} from './ui/renderers';

const filesState = reactive<{
  path: string;
  items: FileItem[];
}>({
  path: '',
  items: [],
});

const { notify, uiState } = useNotify();
const { progress, clearProgress, setProgress, updatePercent, _patchProgress } =
  useProgress(notify);

const fileService = createFileService();

// 1. Cek apakah ada file di folder saat ini
const hasFiles = computed(() => filesState.items.length > 0);

// 2. Cek apakah harus menampilkan tabel
const shouldShowTable = computed(() => !uiState.loading && hasFiles.value);

// 3. Cek apakah folder benar-benar kosong (bukan loading, bukan error, dan tidak ada file)
const shouldShowEmpty = computed(
  () => !uiState.loading && !hasFiles.value && !uiState.error,
);

// 4. Proses path menjadi bagian-bagian breadcrumb
const breadcrumbParts = computed(() =>
  filesState.path.split('/').filter(Boolean),
);

const handleAuthError = (e: any) => {
  if (e instanceof UnauthorizedException) {
    clearAuth();
  } else {
    notify(e.message || 'Ada error!');
  }
};

const fetchFiles = async (path = '') => {
  if (uiState.loading) return;
  uiState.loading = true;
  try {
    const data = await fileService.load(path);
    filesState.items = data.items;
    filesState.path = data.path;
    authState.needsAuth = false;
  } catch (e) {
    handleAuthError(e);
  } finally {
    uiState.loading = false;
  }
};

const handlePreview = async (path: string) => {
  uiState.loading = true;
  try {
    const previewUrl = await fileService.preview(path);
    window.open(previewUrl, '_blank');
  } catch (e) {
    handleAuthError(e);
  } finally {
    uiState.loading = false;
  }
};

const handleDownload = async (file: FileItem) => {
  const isOk = setProgress({
    percent: 0,
    label: `Menyiapkan unduhan: ${file.name}`,
    cancelAction: () => {},
  });

  if (!isOk) return;

  try {
    const { promise, abort } = fileService.download(file, updatePercent);

    _patchProgress({
      cancelAction: () => abort(new Error('Unduhan dibatalkan')),
    });

    await promise;
  } catch (e: any) {
    handleAuthError(e);
  } finally {
    clearProgress();
  }
};

const handleUpload = async (files: FileList) => {
  if (!files.length) return;
  const isOk = setProgress({
    percent: 0,
    label: 'Mengunggah berkas...',
    cancelAction: () => {},
  });

  if (!isOk) return; // Berhenti jika masih sibuk

  try {
    const { promise, abort } = fileService.upload(
      files,
      filesState.path,
      updatePercent,
    );

    _patchProgress({ cancelAction: abort });

    await promise;
    await fetchFiles(filesState.path);
  } catch (e) {
    handleAuthError(e);
  } finally {
    clearProgress();
  }
};

const handleDelete = async (path: string, name: string) => {
  if (!confirm(`Hapus "${name}"?`)) return;

  uiState.loading = true;
  try {
    const success = await fileService.delete(path);
    if (success) await fetchFiles(filesState.path);
  } catch (e) {
    handleAuthError(e);
  } finally {
    uiState.loading = false;
  }
};

export const initApp = (elements: Elements): void => {
  // --- 1. EFFECTS: Injeksi State ke Renderer ---

  // Tabel File (Hanya injeksi items)
  effect(() => renderTable(elements.fileList, filesState.items));

  // Breadcrumb (Hanya injeksi path)
  effect(() =>
    renderBreadcrumb(elements.breadcrumb, breadcrumbParts.value, fetchFiles),
  );

  // Progress (Injeksi objek data mentah/null)
  effect(() => renderProgress(elements, progress.value));

  // Status (Injeksi nilai primitif spesifik)
  effect(() =>
    renderStatus(
      elements,
      uiState.loading,
      uiState.error,
      shouldShowTable.value,
      shouldShowEmpty.value,
    ),
  );

  // Auth Overlay
  effect(() => {
    elements.authOverlay.classList.toggle('hidden', !authState.needsAuth);
  });

  // Modal Auto-Close (Side Effect)
  effect(() => {
    if (progress.value !== null) elements.uploadModal.classList.add('hidden');
  });

  // --- 2. LISTENERS ---
  setupAllListeners({
    elements,
    onAuth: token => {
      setToken(token);
      fetchFiles(filesState.path);
    },
    onUpload: handleUpload,
    onCancel: () => progress.value?.cancelAction(),
    onReset: () => fetchFiles(''),
  });

  elements.fileList.onclick = e =>
    handleTableClick(e, {
      downloadFn: handleDownload,
      deleteFn: file => handleDelete(file.path, file.name),
      openFn: file =>
        file.is_dir ? fetchFiles(file.path) : handlePreview(file.path),
    });

  // --- 3. START ---
  fetchFiles();
};
