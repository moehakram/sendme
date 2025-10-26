// Type definitions untuk sendme app

export interface FileItem {
  name: string;
  path: string;
  is_directory: boolean;
  size: number;
  size_formatted: string;
  modified: string;
  modified_formatted: string;
}

export interface Breadcrumb {
  name: string;
  path: string;
}

export interface FilesResponse {
  items: FileItem[];
  breadcrumbs: Breadcrumb[];
}

export interface ApiResponse {
  message?: string;
  error?: string;
}

export interface UploadResponse extends ApiResponse {
  path?: string;
}

export interface DeleteResponse extends ApiResponse {}

export interface AppState {
  currentPath: string;
  files: FileItem[];
  breadcrumbs: Breadcrumb[];
}

export interface Elements {
  fileList: HTMLElement;
  breadcrumb: HTMLElement;
  loading: HTMLElement;
  error: HTMLElement;
  uploadModal: HTMLElement;
  uploadList: HTMLElement;
  uploadArea: HTMLElement;
  fileInput: HTMLInputElement;
}

export interface FileListHandlers {
  onItemClick: (path: string, isDir: boolean) => void;
  onDownload: (path: string) => void;
  onDelete: (path: string, name: string) => void;
}

export type NavigateHandler = (path: string) => void;
export type FilesSelectedHandler = (files: FileList) => void;
