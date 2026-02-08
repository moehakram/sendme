import type {
  SetupOptions,
  FileItem,
  ProgressView,
  GlobalElements,
  TableElements,
} from '../types';
import { switchView } from '../utils/dom.util';
import { fileRowFactory } from './file-row';

export const handleTableClick = (
  event: MouseEvent,
  act: {
    onDownload: (f: { href: string; name: string }) => void;
    onDelete: (f: { href: string; name: string }) => void;
    onNavigate: (f: { href: string; path: string }) => void;
    onPreview: (f: { href: string; name: string }) => void;
  },
): void => {
  const target = event.target as HTMLElement;

  const row = target.closest('tr');
  if (!row) return;

  const {
    path = '',
    name = '',
    hrefPreview = '',
    hrefNavigate = '',
  } = row.dataset;
  const uiElement = target.closest<HTMLElement>('[data-ui]');

  if (uiElement) {
    const uiRole = uiElement.dataset.ui;
    event.stopPropagation();
    if (uiRole === 'btnDownload') {
      event.preventDefault();
      const anchor = uiElement as HTMLAnchorElement;
      return act.onDownload({ href: anchor.href, name });
    }

    if (uiRole === 'btnDelete') {
      const href = uiElement.dataset.href;
      return act.onDelete({ href: href!, name });
    }
  }

  if (hrefPreview) {
    act.onPreview({ href: hrefPreview, name });
  } else if (hrefNavigate) {
    act.onNavigate({ href: hrefNavigate, path });
  }
};
export const setupAllListeners = (options: SetupOptions) => {
  const { elements, onUpload, onCancel, onReset } = options;

  // --- Modal Handlers ---
  const hideModal = () => elements.uploadModal.classList.add('hidden');
  const showModal = () => elements.uploadModal.classList.remove('hidden');

  elements.uploadBtn.onclick = showModal;

  // Cegah klik di dalam konten modal agar tidak menutup modal
  const modalContent = elements.uploadModal.querySelector(
    '.bg-white',
  ) as HTMLElement;
  if (modalContent) {
    modalContent.onclick = e => e.stopPropagation();
  }

  // Klik di overlay untuk menutup
  elements.uploadModal.onclick = e => {
    if (
      e.target === elements.uploadModal ||
      (e.target as HTMLElement).classList.contains('modal-overlay')
    ) {
      hideModal();
    }
  };

  // Keyboard Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideModal();
  });

  // Tombol close manual
  document.querySelectorAll('.close-modal').forEach(button => {
    (button as HTMLElement).onclick = e => {
      e.stopPropagation();
      hideModal();
    };
  });

  // --- 3. Upload & Drag-Drop ---
  const handleFileUpload = (files: FileList) => {
    if (files.length) {
      onUpload(files);
      hideModal();
      elements.fileInput.value = ''; // PENTING: Reset agar bisa upload file yang sama
    }
  };

  elements.uploadArea.onclick = () => elements.fileInput.click();
  elements.fileInput.onchange = () => {
    if (elements.fileInput.files) handleFileUpload(elements.fileInput.files);
  };

  // Drag & Drop visual feedback
  ['dragenter', 'dragover'].forEach(name => {
    elements.uploadArea.addEventListener(name, e => {
      e.preventDefault();
      elements.uploadArea.classList.add('border-blue-500', 'bg-blue-50');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    elements.uploadArea.addEventListener(name, e => {
      e.preventDefault();
      elements.uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
    });
  });

  elements.uploadArea.addEventListener('drop', e => {
    if (e.dataTransfer?.files) handleFileUpload(e.dataTransfer.files);
  });

  // --- 4. Global Buttons ---
  elements.cancelProgress.onclick = onCancel;

  const logo = document.getElementById('logo');
  if (logo) logo.onclick = onReset;
};

/* --- Render Tabel --- */
export const renderTable = (
  { mainViewport, tplFileRow, tplTable, tplEmpty }: GlobalElements,
  items: FileItem[],
) => {
  // 1. Switch view dan dapatkan referensi container tabel
  const { bodyTable } = switchView<TableElements>(mainViewport, tplTable, [
    'bodyTable',
  ]);

  // 2. Handle Empty State
  if (items.length === 0) {
    const emptyRow = tplEmpty.content.cloneNode(true);
    bodyTable.replaceChildren(emptyRow);
    return;
  }

  // 3. Ambil base elemen untuk factory
  const rowBase = tplFileRow.content.firstElementChild as HTMLTableRowElement;

  // Pastikan template row tidak kosong
  if (!rowBase) {
    console.error('Critical: tplFileRow has no child element.');
    return;
  }

  // 4. Transformasi data menggunakan Factory
  const createRow = fileRowFactory(rowBase);
  const rows = items.map(createRow);

  // 5. Update DOM secara massal
  bodyTable.replaceChildren(...rows);
};

/* --- Render Breadcrumb --- */
export const renderBreadcrumb = (
  elements: GlobalElements,
  parts: string[],
  onNavigate: (index: number) => void,
  onRoot: () => void,
) => {
  const nav = elements.breadcrumb;
  const btnHome = nav.firstElementChild as HTMLButtonElement;
  if (!btnHome) return;

  // 1. Update Tombol Home
  const isAtRoot = parts.length === 0;
  btnHome.className = 'p-1 transition-colors flex items-center ';

  if (isAtRoot) {
    btnHome.className += 'text-gray-900 cursor-default';
    btnHome.onclick = null;
  } else {
    btnHome.className +=
      'text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded';
    btnHome.onclick = onRoot;
  }

  // 2. Membersihkan part folder lama tanpa menghapus Home
  while (nav.children.length > 1) {
    nav.lastElementChild?.remove();
  }

  // 3. Render Bagian Dinamis langsung ke <nav>
  parts.forEach((part, index) => {
    const clone = elements.tplBreadcrumbItem.content.cloneNode(
      true,
    ) as DocumentFragment;
    const btn = clone.querySelector('button');
    if (!btn) return;

    btn.textContent = part;
    const isLast = index === parts.length - 1;

    btn.className = isLast
      ? 'font-semibold text-gray-900 cursor-default'
      : 'text-blue-600 hover:text-blue-800 hover:underline transition-colors';

    if (!isLast) {
      btn.onclick = () => onNavigate(index);
    }

    nav.appendChild(clone);
  });
};
/* --- Render Progress --- */
export const renderProgress = (
  elements: GlobalElements,
  data: ProgressView | null,
) => {
  const isVisible = data !== null;
  elements.progressContainer.classList.toggle('-translate-y-full', !isVisible);

  if (data) {
    elements.progressBar.style.width = `${data.percent}%`;
    elements.progressText.textContent = `${data.percent}%`;
    elements.progressLabel.textContent = data.label;
  }
};
