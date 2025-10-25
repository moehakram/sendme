// Main App - Functional approach untuk file server

import { fetchFiles, uploadFile, deleteItem, getDownloadUrl } from './services/api.js';
import { renderFileList } from './components/fileList.js';
import { renderBreadcrumb } from './components/breadcrumb.js';
import { 
    initUploadModal, 
    showUploadModal, 
    hideUploadModal, 
    addUploadItem, 
    updateUploadStatus,
    clearUploadList 
} from './components/uploadModal.js';
import { showLoading, hideLoading, showError, showSuccess } from './utils/ui.js';

// State global (simple object)
let appState = {
    currentPath: '',
    files: [],
    breadcrumbs: []
};

// DOM elements
let elements = {};

// Load files dari server
export async function loadFiles(path = '') {
    appState.currentPath = path;
    showLoading(elements);

    try {
        const data = await fetchFiles(path);
        appState.files = data.items;
        appState.breadcrumbs = data.breadcrumbs;
        
        // Render breadcrumb
        renderBreadcrumb(elements.breadcrumb, data.breadcrumbs, loadFiles);
        
        // Render file list
        renderFileList(elements.fileList, data.items, {
            onItemClick: (path, isDir) => {
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
        showError(elements, error.message);
    }
}

// Download file
function downloadFile(path) {
    window.location.href = getDownloadUrl(path);
}

// Delete item (file atau folder)
async function handleDelete(path, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    try {
        const data = await deleteItem(path);
        showSuccess(data.message);
        loadFiles(appState.currentPath);
    } catch (error) {
        showError(elements, error.message);
    }
}

// Handle upload files
async function handleUpload(files) {
    clearUploadList(elements.uploadList);

    for (let file of files) {
        await uploadSingleFile(file);
    }

    setTimeout(() => {
        hideUploadModal(elements.uploadModal);
        loadFiles(appState.currentPath);
    }, 1000);
}

// Upload single file
async function uploadSingleFile(file) {
    const item = addUploadItem(elements.uploadList, file.name);

    try {
        await uploadFile(file, appState.currentPath);
        updateUploadStatus(item, true);
    } catch (error) {
        updateUploadStatus(item, false, error.message);
    }
}

// Initialize app
export function initApp() {
    // Ambil semua DOM elements
    elements = {
        fileList: document.getElementById('file-list'),
        breadcrumb: document.getElementById('breadcrumb'),
        loading: document.getElementById('loading'),
        error: document.getElementById('error'),
        uploadModal: document.getElementById('upload-modal'),
        uploadList: document.getElementById('upload-list'),
        uploadArea: document.getElementById('upload-area'),
        fileInput: document.getElementById('file-input')
    };

    // Setup upload button
    document.getElementById('upload-btn').addEventListener('click', () => {
        showUploadModal(elements.uploadModal);
    });

    // Setup modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // Initialize upload modal
    initUploadModal(elements, handleUpload);

    // Load initial data
    loadFiles();
}
