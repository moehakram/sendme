// FileList Component - Fungsi untuk render daftar file dan folder

export function renderFileList(container, items, handlers) {
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 No files or folders</div>';
        return;
    }

    let html = '<table class="file-table"><thead><tr><th>Name</th><th>Size</th><th>Modified</th><th>Actions</th></tr></thead><tbody>';

    items.forEach(item => {
        const icon = item.is_directory ? '📁' : '📄';
        const sizeDisplay = item.is_directory ? '-' : item.size_formatted;
        
        html += `
            <tr class="file-row ${item.is_directory ? 'directory' : 'file'}">
                <td>
                    <a href="#" class="file-link" data-path="${item.path}" data-is-dir="${item.is_directory}">
                        ${icon} ${item.name}
                    </a>
                </td>
                <td>${sizeDisplay}</td>
                <td>${item.modified_formatted}</td>
                <td>
                    ${!item.is_directory ? `<button class="btn btn-sm download-btn" data-path="${item.path}">⬇️</button>` : ''}
                    <button class="btn btn-sm btn-danger delete-btn" data-path="${item.path}" data-name="${item.name}">🗑️</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    // Attach event listeners
    container.querySelectorAll('.file-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = e.target.closest('.file-link').dataset.path;
            const isDir = e.target.closest('.file-link').dataset.isDir === 'true';
            handlers.onItemClick(path, isDir);
        });
    });

    container.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => handlers.onDownload(btn.dataset.path));
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => handlers.onDelete(btn.dataset.path, btn.dataset.name));
    });
}
