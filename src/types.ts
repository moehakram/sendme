// Type definitions untuk sendme app

export interface FileItem {
  name: string;
  path: string;
  is_directory: boolean;
  size: string;
  modified_at: string;
}

export interface Breadcrumb {
  name: string;
  path: string;
}

interface ApiResponse {
  message: string;
}

export interface FilesResponse extends ApiResponse {
  data : {
    entries: FileItem[];
    breadcrumbs: Breadcrumb[];
  }
}

export interface UploadResponse extends ApiResponse {}

export interface DeleteResponse extends ApiResponse {}

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
