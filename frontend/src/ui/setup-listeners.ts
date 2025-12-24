import type { SetupOptions } from '../types';

export const setupAllListeners = (options: SetupOptions) => {
  const { elements, onAuth, onUpload, onCancel, onReset } = options;

  // --- 1. Auth Handlers ---
  const handleTokenSubmit = () => {
    const token = elements.tokenInput.value.trim();
    if (token) onAuth(token);
    elements.tokenInput.value = '';
  };

  elements.tokenSubmit.onclick = handleTokenSubmit;
  elements.tokenInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleTokenSubmit();
  });

  // --- 2. Modal Handlers ---
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
  elements.cancelBtn.onclick = onCancel;

  const logo = document.getElementById('logo');
  if (logo) logo.onclick = onReset;
};
