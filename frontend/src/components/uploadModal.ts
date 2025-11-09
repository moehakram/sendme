// UploadModal Component - Fungsi untuk handle upload modal
import type { Elements, FilesSelectedHandler } from '../types';

export function initUploadModal(elements: Elements, onFilesSelected: FilesSelectedHandler): void {
    const { uploadArea, fileInput } = elements;

    // Upload area click
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer?.files && onFilesSelected) {
            onFilesSelected(e.dataTransfer.files);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && onFilesSelected) {
            onFilesSelected(target.files);
        }
    });
}

export function showUploadModal(modal: HTMLElement): void {
    modal.style.display = 'flex';
}

export function hideUploadModal(modal: HTMLElement): void {
    modal.style.display = 'none';
}

export function addUploadItem(uploadList: HTMLElement, fileName: string): HTMLElement {
    const item = document.createElement('div');
    item.className = 'upload-item';
    item.innerHTML = `
        <span>${fileName}</span>
        <span class="upload-status">Uploading...</span>
    `;
    uploadList.appendChild(item);
    return item;
}

export function updateUploadStatus(item: HTMLElement, success: boolean, message: string = ''): void {
    const status = item.querySelector('.upload-status');
    if (status) {
        if (success) {
            status.textContent = '✓ Done';
            item.classList.add('success');
        } else {
            status.textContent = `✗ ${message}`;
            item.classList.add('error');
        }
    }
}

export function clearUploadList(uploadList: HTMLElement): void {
    uploadList.innerHTML = '';
}
