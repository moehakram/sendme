// API Service - Fungsi-fungsi untuk komunikasi dengan server
import type { FilesResponse, UploadResponse, DeleteResponse, FileData } from '../types';

export async function fetchFiles(path: string = ''): Promise<FileData> {
    const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
    const data: FilesResponse = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Failed to load files');
    }

    return data.data;
}

export async function uploadFile(file: File, path: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const response = await fetch(`/api/upload`, {
        method: 'POST',
        body: formData
    });

    const data : UploadResponse = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
    }

    return data;
}

export async function deleteItem(path: string): Promise<DeleteResponse> {
    const response = await fetch(`/api/delete`, {
        method: 'DELETE',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ path })
    });

    const data : DeleteResponse = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete');
    }

    return data;
}

export function getDownloadUrl(path: string): string {
    return `/api/download?path=${encodeURIComponent(path)}`;
}
