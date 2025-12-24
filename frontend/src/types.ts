export interface Elements {
  fileList: HTMLTableSectionElement;
  breadcrumb: HTMLElement;
  loading: HTMLElement;
  error: HTMLElement;
  uploadModal: HTMLElement;
  uploadBtn: HTMLElement;
  fileInput: HTMLInputElement;
  uploadArea: HTMLElement;
  emptyState: HTMLElement;
  table: HTMLTableElement;
  progContainer: HTMLElement;
  progBar: HTMLElement;
  progLabel: HTMLElement;
  progText: HTMLElement;
  cancelBtn: HTMLElement;
  authOverlay: HTMLElement;
  tokenInput: HTMLInputElement;
  tokenSubmit: HTMLElement;
}

export interface FileItem {
  name: string;
  path: string;
  is_dir: boolean;
  size_byte: number | null;
  modified_at: number;
  mime_type: string | null;
}

export interface ProgressData {
  percent: number;
  label: string;
  cancelAction: () => void;
}

export interface SetupOptions {
  elements: Elements;
  onAuth: (token: string) => void;
  onUpload: (files: FileList) => void;
  onCancel: () => void;
  onReset: () => void;
}
