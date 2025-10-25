// UploadModal Component - Fungsi untuk handle upload modal

export function initUploadModal(elements, onFilesSelected) {
    const { uploadModal, uploadArea, fileInput } = elements;

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
        if (onFilesSelected) {
            onFilesSelected(e.dataTransfer.files);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (onFilesSelected) {
            onFilesSelected(e.target.files);
        }
    });
}

export function showUploadModal(modal) {
    modal.style.display = 'flex';
}

export function hideUploadModal(modal) {
    modal.style.display = 'none';
}

export function addUploadItem(uploadList, fileName) {
    const item = document.createElement('div');
    item.className = 'upload-item';
    item.innerHTML = `
        <span>${fileName}</span>
        <span class="upload-status">Uploading...</span>
    `;
    uploadList.appendChild(item);
    return item;
}

export function updateUploadStatus(item, success, message = '') {
    const status = item.querySelector('.upload-status');
    if (success) {
        status.textContent = '✓ Done';
        item.classList.add('success');
    } else {
        status.textContent = `✗ ${message}`;
        item.classList.add('error');
    }
}

export function clearUploadList(uploadList) {
    uploadList.innerHTML = '';
}
