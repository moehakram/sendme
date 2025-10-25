// API Service - Fungsi-fungsi untuk komunikasi dengan server
export const API_BASE_URL = '';
// export const API_BASE_URL = 'http://127.0.0.1:8000';

export async function fetchFiles(path = '') {
    const response = await fetch(`${API_BASE_URL}/api/files?path=${encodeURIComponent(path)}`);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Failed to load files');
    }
    
    return data;
}

export async function uploadFile(file, path) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
    }

    return data;
}

export async function deleteItem(path) {
    const response = await fetch(`${API_BASE_URL}/api/delete`, {
        method: 'DELETE',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ path })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete');
    }

    return data;
}

export function getDownloadUrl(path) {
    return `${API_BASE_URL}/api/download?path=${encodeURIComponent(path)}`;
}
