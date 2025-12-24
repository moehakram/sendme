import { getAuthToken } from '../services/useAuth';
import { ApiException, UnauthorizedException } from './exception';

export const API_PREFIX = '/sendme';
export const TOKEN_HEADER_KEY = 'x-token';

export const buildUrl = (
  endpoint: string,
  params?: Record<string, string> | null,
): string => {
  const url = new URL(endpoint, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  return url.toString();
};
/* =====================
   API Infrastructure
   ===================== */
async function apiRequest<T>(endpoint: string, options: any = {}): Promise<T> {
  const url = buildUrl(endpoint, options.params);
  const headers = new Headers(options.headers);
  const token = getAuthToken().token;
  if (token) headers.set(TOKEN_HEADER_KEY, token);

  const response = await fetch(url.toString(), { ...options, headers });

  if (response.status === 401) throw new UnauthorizedException();
  if (!response.ok)
    throw new ApiException('Gagal memproses permintaan', response.status);

  const contentType = response.headers.get('content-type');
  return contentType?.includes('application/json')
    ? response.json()
    : (response as any);
}

// Wrapper XHR untuk Upload dengan Promise
function apiUpload(
  url: string,
  files: FileList,
  onProgress: (n: number) => void,
) {
  const xhr = new XMLHttpRequest();
  const promise = new Promise<void>((resolve, reject) => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));

    xhr.upload.addEventListener(
      'progress',
      e =>
        e.lengthComputable &&
        onProgress(Math.round((e.loaded / e.total) * 100)),
    );

    xhr.addEventListener('load', () => {
      if (xhr.status === 401) reject(new UnauthorizedException());
      else if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new ApiException('Upload gagal', xhr.status));
    });

    xhr.addEventListener('error', () =>
      reject(new ApiException('Upload gagal')),
    );
    xhr.addEventListener('abort', () =>
      reject(new ApiException('Unggahan dibatalkan')),
    );

    xhr.open('POST', url);

    const token = getAuthToken().token;
    if (token) xhr.setRequestHeader(TOKEN_HEADER_KEY, token);
    xhr.send(formData);
  });

  return { promise, abort: () => xhr.abort() };
}

/*  API Download Core */
function apiDownload(url: string, onProgress: (p: number) => void) {
  const controller = new AbortController();

  const promise = (async () => {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: getAuthToken().headers,
    });

    if (response.status === 401) throw new UnauthorizedException();
    if (!response.ok) throw new ApiException('Download gagal', response.status);

    const contentLength = Number(response.headers.get('Content-Length'));
    const reader = response.body?.getReader();
    if (!reader) throw new Error('ReadableStream not available');

    let receivedLength = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      if (contentLength)
        onProgress(Math.round((receivedLength / contentLength) * 100));
    }

    return new Blob(chunks);
  })();

  return {
    promise,
    abort: (msg: Error) => controller.abort(msg),
  };
}

export const client = {
  get: apiRequest,
  upload: apiUpload,
  download: apiDownload,
};
