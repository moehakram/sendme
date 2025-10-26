import './style.css'
import { initApp } from './app'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
      <!-- Header -->
      <header class="header">
          <h1>📁 sendme</h1>
          <div class="header-actions">
              <button id="upload-btn" class="btn btn-primary">⬆️ Upload</button>
          </div>
      </header>

      <!-- Breadcrumb -->
      <nav id="breadcrumb" class="breadcrumb"></nav>

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

initApp();