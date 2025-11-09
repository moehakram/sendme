// Main App - Functional approach untuk file server

import { fetchFiles, uploadFile, deleteItem, getDownloadUrl } from './services/api';
import { renderFileList } from './components/fileList';
import { renderBreadcrumb } from './components/breadcrumb';
import { 
    initUploadModal, 
    showUploadModal, 
    hideUploadModal, 
    addUploadItem, 
    updateUploadStatus,
    clearUploadList 
} from './components/uploadModal';
import { showLoading, hideLoading, showError, showSuccess } from './utils/ui';
import type { Elements } from './types';


let currentPath: string = '';

// DOM elements
let elements = {} as Elements;

// Load files dari server
export async function loadFiles(path: string = ''): Promise<void> {
    currentPath = path;
    showLoading(elements);
    
    try {
        const data = await fetchFiles(path);
        
        // Render breadcrumb
        renderBreadcrumb((elements).breadcrumb, data.breadcrumbs, loadFiles);
        
        // Render file list
        renderFileList((elements).fileList, data.entries, {
            onItemClick: (path: string, isDir: boolean) => {
                if (isDir) {
                    loadFiles(path);
                } else {
                    downloadFile(path);
                }
            },
            onDownload: downloadFile,
            onDelete: handleDelete
        });
        
        hideLoading(elements);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        showError(elements, errorMessage);
    }
}

// Download file
function downloadFile(path: string): void {
    window.location.href = getDownloadUrl(path);
}

// Delete item (file atau folder)
async function handleDelete(path: string, name: string): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    try {
        const data = await deleteItem(path);
        showSuccess(data.message || 'Item deleted successfully');
        loadFiles(currentPath);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        showError(elements, errorMessage);
    }
}

// Handle upload files
async function handleUpload(files: FileList): Promise<void> {
    clearUploadList((elements).uploadList);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
            await uploadSingleFile(file);
        }
    }

    setTimeout(() => {
        hideUploadModal((elements).uploadModal);
        loadFiles(currentPath);
    }, 1000);
}

// Upload single file
async function uploadSingleFile(file: File): Promise<void> {
    const item = addUploadItem((elements).uploadList, file.name);

    try {
        await uploadFile(file, currentPath);
        updateUploadStatus(item, true);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        updateUploadStatus(item, false, errorMessage);
    }
}

// Initialize app
export function initApp(initialElements : Elements): void {
    // Ambil semua DOM elements
   elements = initialElements;

    // Setup upload button
    const uploadBtn = document.getElementById('upload-btn');
    uploadBtn?.addEventListener('click', () => {
        showUploadModal(elements.uploadModal);
    });

    // Setup modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const modal = target.closest('.modal') as HTMLElement;
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Initialize upload modal
    initUploadModal(elements, handleUpload);

    // Load initial data
    loadFiles();
}
