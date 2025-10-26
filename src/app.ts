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
import type { AppState, Elements } from './types';

// State global (simple object)
let appState: AppState = {
    currentPath: '',
    files: [],
    breadcrumbs: []
};

// DOM elements
const elements: Partial<Elements> = {};

// Load files dari server
export async function loadFiles(path: string = ''): Promise<void> {
    appState.currentPath = path;
    showLoading(elements as Elements);

    try {
        const data = await fetchFiles(path);
        appState.files = data.items;
        appState.breadcrumbs = data.breadcrumbs;
        
        // Render breadcrumb
        renderBreadcrumb((elements as Elements).breadcrumb, data.breadcrumbs, loadFiles);
        
        // Render file list
        renderFileList((elements as Elements).fileList, data.items, {
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
        
        hideLoading(elements as Elements);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        showError(elements as Elements, errorMessage);
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
        loadFiles(appState.currentPath);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        showError(elements as Elements, errorMessage);
    }
}

// Handle upload files
async function handleUpload(files: FileList): Promise<void> {
    clearUploadList((elements as Elements).uploadList);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
            await uploadSingleFile(file);
        }
    }

    setTimeout(() => {
        hideUploadModal((elements as Elements).uploadModal);
        loadFiles(appState.currentPath);
    }, 1000);
}

// Upload single file
async function uploadSingleFile(file: File): Promise<void> {
    const item = addUploadItem((elements as Elements).uploadList, file.name);

    try {
        await uploadFile(file, appState.currentPath);
        updateUploadStatus(item, true);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        updateUploadStatus(item, false, errorMessage);
    }
}

// Initialize app
export function initApp(): void {
    // Ambil semua DOM elements
   Object.assign(elements, {
        fileList: document.getElementById('file-list')!,
        breadcrumb: document.getElementById('breadcrumb')!,
        loading: document.getElementById('loading')!,
        error: document.getElementById('error')!,
        uploadModal: document.getElementById('upload-modal')!,
        uploadList: document.getElementById('upload-list')!,
        uploadArea: document.getElementById('upload-area')!,
        fileInput: document.getElementById('file-input') as HTMLInputElement
    });

    // Setup upload button
    const uploadBtn = document.getElementById('upload-btn');
    uploadBtn?.addEventListener('click', () => {
        showUploadModal((elements as Elements).uploadModal);
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
    initUploadModal(elements as Elements, handleUpload);

    // Load initial data
    loadFiles();
}
