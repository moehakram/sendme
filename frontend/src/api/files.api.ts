import type { FileItemsResponse } from '../types';
import { triggerFileDownload } from '../utils/dom.util';
import { client } from './client';
import { ApiException } from './exception';

function get(url: string, signal?: AbortSignal) {
  return client.get<FileItemsResponse>(url, 'GET', signal);
}

function remove(url: string) {
  return client.get(url, 'DELETE');
}

function upload(
  url: string,
  files: FileList,
  onProgress: (persent: number) => void,
  signal?: AbortSignal,
) {
  return client.upload<{ message: string }>(url, files, onProgress, signal);
}

async function download(url: string, fileName: string) {
  // Pre-flight check
  const check = await fetch(url, {
    method: 'HEAD',
    credentials: 'include',
  });

  if (!check.ok) {
    // Jika HEAD gagal, baru lakukan GET untuk ambil pesan error JSON
    const errorRes = await fetch(fileName, { credentials: 'include' });
    const errorData = await errorRes.json();
    throw new ApiException(
      errorData.message || 'Failed to download file',
      errorRes.status,
    );
  }
  // Eksekusi Download Native
  triggerFileDownload(url, fileName);
}

export const apiFiles = { get, download, upload, remove };
