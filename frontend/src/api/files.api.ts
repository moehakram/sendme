import { client, API_PREFIX, buildUrl } from './client';

export const createFileService = () => {
  return {
    load(path: string) {
      return client.get<any>(`${API_PREFIX}/files`, {
        params: { path },
      });
    },

    delete(path: string) {
      return client.get(`${API_PREFIX}/files`, {
        method: 'DELETE',
        params: { path },
      });
    },

    upload(
      files: FileList,
      paramPath: string,
      onProgress: (p: number) => void,
    ) {
      return client.upload(
        buildUrl(`${API_PREFIX}/files`, { path: paramPath }),
        files,
        onProgress,
      );
    },

    download(
      file: { path: string; name: string },
      onProgress: (p: number) => void,
    ) {
      const { promise, abort } = client.download(
        buildUrl(`${API_PREFIX}/file`, { path: file.path }),
        onProgress,
      );

      const wrappedPromise = (async () => {
        const blob = await promise;

        // Proses download di browser
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        a.remove();
      })();

      return {
        promise: wrappedPromise,
        abort,
      };
    },

    async preview(path: string): Promise<string> {
      // const token = getAuthToken().token;
      return buildUrl(`${API_PREFIX}/file`, {
        path,
        preview: 'true',
        // ...(token ? { token } : {}),
      });
    },
  };
};
