import { computed, effect, reactive, ref, watch } from '@vue/reactivity';
import type { GlobalElements } from './types';
import { useProgress } from './composables/use-progress';
import {
  setupAllListeners,
  renderBreadcrumb,
  renderProgress,
  renderTable,
  handleTableClick,
} from './components/file-manager';
import { notify } from './utils/dom.util';
import { getPathFromURL } from './utils/format.util';
import { useFileStore } from './composables/use-files';
import { render404, renderLocked } from './components/error';

export function initApp(elements: GlobalElements): void {
  // --- 1. SETUP SERVICES & STORE ---
  const { filesState, actions } = useFileStore();
  const progress = useProgress();
  const uiState = reactive({
    error: 0,
    loading: false,
  });
  const currentPath = ref(getPathFromURL());
  const refreshTicket = ref(0);
  const triggerRefresh = () => refreshTicket.value++;
  // --- 2. COMPUTED STATE ---
  const breadcrumbParts = computed(() =>
    currentPath.value === ''
      ? []
      : currentPath.value.split('/').filter(Boolean),
  );

  // Menentukan template mana yang harus aktif berdasarkan state
  // --- 3. NAVIGATION ---
  const navigateTo = (newPath: string) => {
    const cleanPath = newPath.replace(/(^\/+|\/+$)/g, '');
    const encoded = cleanPath
      .split('/')
      .filter(Boolean)
      .map(encodeURIComponent)
      .join('/');
    const targetUrl = `/tree/${encoded}`;

    if (window.location.pathname !== targetUrl) {
      window.history.pushState(null, '', targetUrl);
      currentPath.value = getPathFromURL();
    }
  };

  window.onpopstate = () => {
    currentPath.value = getPathFromURL();
    filesState.items = null; // Memicu loading/empty state saat navigasi browser
  };

  // --- 4. ACTION HANDLERS ---
  const handleUpload = async (files: FileList) => {
    if (uiState.error === 401) return triggerRefresh();
    if (!files.length || progress.isActive) {
      return notify(
        `Proses "${progress.data.value?.label}" sedang berjalan`,
        'info',
      );
    }
    const controller = new AbortController();
    progress.show({
      percent: 0,
      label: 'Mengunggah file...',
      abortHook: () => controller.abort(new Error('Upload dibatalkan')),
    });
    try {
      const res = await actions.upload(
        files,
        progress.update,
        controller.signal,
      );

      notify(res.message, 'success');
      triggerRefresh();
    } catch (e: any) {
      uiState.error = e.status;
      notify(e.message || 'Upload gagal', 'error');
    } finally {
      progress.clear();
    }
  };

  const handleDelete = async (file: { href: string; name: string }) => {
    if (!confirm(`Hapus ${file.name}?`)) return;
    try {
      await actions.delete(file.href);
      notify(`File ${file.name} deleted successfully.`, 'success');
      triggerRefresh();
    } catch (e: any) {
      uiState.error = e.status;
      notify(e.message || 'Gagal menghapus', 'error');
    }
  };

  const handleDownload = async (file: { href: string; name: string }) => {
    try {
      await actions.download(file);
    } catch (e: any) {
      uiState.error = e.status;
      notify(e.message || 'Error Unduhan', 'error');
    } finally {
      progress.clear();
    }
  };

  // --- 5. EFFECTS (The Engine) ---
  // Simpan ini sebagai referensi request terbaru
  let activeController: AbortController | null = null;

  watch(
    [currentPath, refreshTicket],
    async ([newPath], _, onCleanup) => {
      const controller = new AbortController();
      activeController = controller; // Tandai ini sebagai request "paling baru"

      onCleanup(() => {
        controller.abort();
      });

      uiState.loading = true;

      try {
        await actions.load(newPath as string, controller.signal);

        // Guard: Jangan update error jika sudah ada request baru yang menimpa
        if (controller === activeController) {
          uiState.error = 0;
        }
      } catch (e: any) {
        if (e.name === 'AbortError') return;

        // Guard: Jangan tampilkan notifikasi error dari request yang sudah usang
        if (controller === activeController) {
          uiState.error = e.status;
          notify(e.message || 'Gagal!', 'error');
        }
      } finally {
        // Jangan matikan loading jika request terbaru masih berjalan.
        if (controller === activeController) {
          uiState.loading = false;
        }
      }
    },
    { immediate: true },
  );
  // B. Control Overlays (Loading & Error)
  effect(() => {
    elements.loading.classList.toggle('hidden', !uiState.loading);
  });

  watch(
    () => uiState.error,
    error => {
      if (error === 401) {
        renderLocked(elements);
      } else if (error === 404) {
        render404(elements, () => navigateTo(''));
      }
    },
  );

  effect(() => {
    const file = filesState.items;
    if (file) {
      renderTable(elements, file);
    }
  });

  // E. Breadcrumb & Progress
  watch(
    breadcrumbParts,
    parts => {
      renderBreadcrumb(
        elements,
        parts,
        idx => navigateTo(parts.slice(0, idx + 1).join('/')),
        () => navigateTo(''),
      );
    },
    { immediate: true },
  );

  effect(() => renderProgress(elements, progress.data.value));

  setupAllListeners({
    elements,
    onUpload: handleUpload,
    onCancel: progress.onAbort,
    onReset: triggerRefresh,
  });

  // Event Delegation pada Viewport
  elements.mainViewport.onclick = e => {
    handleTableClick(e, {
      onDownload: handleDownload,
      onDelete: handleDelete,
      onNavigate: f => navigateTo(f.path),
      onPreview: f => window.open(f.href, '_blank'),
    });
  };
}
