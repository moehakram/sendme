import './style.css'
import { initApp } from './app'
import type { Elements } from './types';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div>
        <!-- Header -->
        <header class="site-header">
            <div class="header">
                <h1>📁 sendme</h1>
                <div class="header-actions">
                    <button id="upload-btn" class="btn btn-primary">⬆️ Upload</button>
                </div>
            </div>
            <!-- Breadcrumb -->
            <nav id="breadcrumb" class="breadcrumb"></nav>
        </header>

        <!-- Main Content -->
        <main class="container">
            <!-- Loading -->
            <div id="loading" class="loading" style="display: none;">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>

            <!-- Error Message -->
            <div id="error" class="error" style="display: none;"></div>

            <!-- File List -->
            <div id="file-list" class="file-list"></div>
        </main>

        <!-- Upload Modal -->
        <div id="upload-modal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Upload Files</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="upload-area" id="upload-area">
                        <input type="file" id="file-input" multiple hidden>
                        <p>📤 Drag & drop files here or click to browse</p>
                    </div>
                    <div id="upload-list" class="upload-list"></div>
                </div>
            </div>
        </div>
    </div>
`;

const elements : Elements = {
        fileList: document.getElementById('file-list')!,
        breadcrumb: document.getElementById('breadcrumb')!,
        loading: document.getElementById('loading')!,
        error: document.getElementById('error')!,
        uploadModal: document.getElementById('upload-modal')!,
        uploadList: document.getElementById('upload-list')!,
        uploadArea: document.getElementById('upload-area')!,
        fileInput: document.getElementById('file-input') as HTMLInputElement
    };

initApp(elements);