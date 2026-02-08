import { reactive } from '@vue/reactivity';
import type { FileItemsResponse } from '../types';
import { apiFiles, API_PREFIX } from '../api';

export const useFileStore = () => {
  const filesState = reactive<FileItemsResponse>({
    items: null,
    _links: {
      upload: { href: '', method: 'POST' },
    },
  });

  const actions = {
    async load(path: string, signal?: AbortSignal) {
      const data = await apiFiles.get(`${API_PREFIX}/tree/${path}`, signal);
      Object.assign(filesState, data);
    },

    delete(href: string) {
      return apiFiles.remove(href);
    },

    upload(
      files: FileList,
      onProgress: (persent: number) => void,
      signal?: AbortSignal,
    ) {
      const url = filesState._links.upload.href;
      return apiFiles.upload(url, files, onProgress, signal);
    },

    download(file: { href: string; name: string }) {
      return apiFiles.download(file.href, file.name);
    },
  };
  return { filesState, actions };
};
