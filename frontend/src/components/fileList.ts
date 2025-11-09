// FileList Component - Fungsi untuk render daftar file dan folder
import type { FileItem, FileListHandlers } from '../types';
import { timeAgo } from '../utils/time-ago';

export function renderFileList(
    container: HTMLElement, 
    items: FileItem[], 
    handlers: FileListHandlers
): void {
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 No files or folders</div>';
        return;
    }

    let html = `
    <div class="table-wrapper">
    <table class="file-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Size</th>
                <th>Modified</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>`;

    items.forEach(item => {
        const icon = item.is_directory ? '📁' : '📄';
        const sizeDisplay = item.is_directory ? '-' : item.size;
        
        html += `
            <tr class="file-row ${item.is_directory ? 'directory' : 'file'}">
                <td>
                    <a href="#" class="file-link" data-path="${item.path}" data-is-dir="${item.is_directory}">
                        ${icon} ${item.name}
                    </a>
                </td>
                <td>${sizeDisplay}</td>
                <td>${timeAgo(item.modified_at)}</td>
                <td>
                    ${!item.is_directory ? `<button class="btn btn-sm download-btn" data-path="${item.path}">⬇️</button>` : ''}
                    <button class="btn btn-sm btn-danger delete-btn" data-path="${item.path}" data-name="${item.name}">🗑️</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Attach event listeners
    container.querySelectorAll('.file-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = (e.target as HTMLElement).closest('.file-link') as HTMLElement;
            const path = target.dataset.path;
            const isDir = target.dataset.isDir === 'true';
            if (path !== undefined) {
                handlers.onItemClick(path, isDir);
            }
        });
    });

    container.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const element = btn as HTMLElement;
            const path = element.dataset.path;
            if (path !== undefined) {
                handlers.onDownload(path);
            }
        });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const element = btn as HTMLElement;
            const path = element.dataset.path;
            const name = element.dataset.name;
            if (path !== undefined && name !== undefined) {
                handlers.onDelete(path, name);
            }
        });
    });
}
