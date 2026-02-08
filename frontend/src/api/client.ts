import { ApiException } from './exception';

export const API_PREFIX = '/sendme';

async function apiRequest<T>(
  url: string,
  method: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(url, {
    method: method,
    signal,
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (response.status === 204) return {} as T;

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiException(
      errorData.message || 'Request error',
      response.status,
    );
  }

  return response.json();
}

function apiUpload<T>(
  url: string,
  files: FileList | File[],
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // 1. Validasi awal: Jika signal sudah dibatalkan sebelum mulai
    if (signal?.aborted) {
      return reject(new DOMException('Upload aborted', 'AbortError'));
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // Konversi FileList ke Array untuk iterasi yang aman
    Array.from(files).forEach(file => formData.append('files', file));

    // 2. Logic Pembatalan Fisik
    const abortHandler = () => {
      xhr.abort();
      reject(new DOMException('Upload aborted by user', 'AbortError'));
    };

    signal?.addEventListener('abort', abortHandler);
    // 3. Event Listeners
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      // Bersihkan listener untuk mencegah memory leak
      signal?.removeEventListener('abort', abortHandler);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = xhr.response;
          resolve(response);
        } catch (err) {
          reject(new Error('Error interpreting server response'));
        }
      } else {
        reject(
          new ApiException(
            xhr.responseType === 'json'
              ? xhr.response?.message || 'Error upload file'
              : xhr.responseText,
            xhr.status,
          ),
        );
      }
    });

    xhr.addEventListener('error', () => {
      signal?.removeEventListener('abort', abortHandler);
      reject(new ApiException('Server error during file upload', xhr.status));
    });
    // 4. Eksekusi
    xhr.open('POST', url);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}

export const client = {
  get: apiRequest,
  upload: apiUpload,
};
