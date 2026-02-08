// utils/dom.ts
export function mapElements<T>(
  container: HTMLElement,
  requiredKeys: (keyof T)[] = [],
): T {
  const elements = {} as any;
  const nodes = container.querySelectorAll('[data-ui]');

  nodes.forEach(node => {
    const key = (node as HTMLElement).dataset.ui;
    if (key) {
      elements[key] = node as HTMLElement;
    }
  });

  for (const key of requiredKeys) {
    if (!elements[key as string]) {
      throw new Error(
        `[DOM Mapping Error]: Elemen wajib dengan data-ui="${String(key)}" tidak ditemukan di dalam kontainer.`,
      );
    }
  }

  return elements as T;
}

export function switchView<T>(
  viewport: HTMLElement,
  template: HTMLTemplateElement,
  requiredKeys: (keyof T)[] = [],
): T {
  // 1. Validasi awal - Gagal cepat (Fail-fast) jika template rusak
  if (!template.content.firstElementChild) {
    throw new Error(`switchView: Template ${template.id} is empty or invalid.`);
  }

  // 2. Clone dan Inject
  const clone = template.content.cloneNode(true);
  viewport.replaceChildren(clone);

  // 3. Mapping
  // Gunakan type assertion yang tegas jika mapElements mengembalikan T
  const elements = mapElements<T>(viewport, requiredKeys);

  // 4. Tambahkan hook untuk scroll reset
  viewport.scrollTop = 0;

  return elements;
}

type NotifyType = 'success' | 'error' | 'info';

// UI State global untuk komponen yang mungkin butuh status loading/error statis

/**
 * Memunculkan notifikasi Toast yang melayang (non-blocking)
 */
export const notify = (
  message: string,
  type: NotifyType = 'info',
  duration = 3000,
) => {
  const area = document.querySelector('[data-ui="notificationArea"]');
  const template = document.getElementById('tpl-toast') as HTMLTemplateElement;

  if (!area || !template) {
    console.warn('Notification area atau template tidak ditemukan di DOM');
    return;
  }

  // 1. Clone template toast
  const clone = template.content.cloneNode(true) as DocumentFragment;
  const toast = clone.firstElementChild as HTMLElement;

  // 2. Petakan elemen internal toast
  const msgEl = toast.querySelector('[data-ui="toastMessage"]');
  const iconEl = toast.querySelector('[data-ui="toastIcon"]');

  // 3. Konfigurasi Tema (Tailwind Classes)
  const themes = {
    success: { bg: 'bg-green-600', border: 'border-green-500', icon: '✅' },
    error: { bg: 'bg-red-600', border: 'border-red-500', icon: '⚠️' },
    info: { bg: 'bg-gray-900', border: 'border-gray-700', icon: 'ℹ️' },
  };

  const theme = themes[type];

  // Terapkan gaya dan konten
  toast.classList.add(theme.bg, theme.border);
  if (msgEl) msgEl.textContent = message;
  if (iconEl) iconEl.textContent = theme.icon;

  // 4. Masukkan ke dalam area notifikasi
  area.appendChild(toast);

  // 5. Fungsi untuk menghapus toast dengan animasi
  const removeToast = () => {
    toast.classList.add('animate-fade-out');
    // Tunggu animasi selesai baru hapus dari DOM
    toast.addEventListener(
      'animationend',
      () => {
        toast.remove();
      },
      { once: true },
    );
  };

  // Jalankan timer auto-remove
  setTimeout(removeToast, duration);
};

export function triggerFileDownload(url: string, fileName: string) {
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
}
