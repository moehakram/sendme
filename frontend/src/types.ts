export interface GlobalElements {
  mainViewport: HTMLElement;
  loading: HTMLElement;
  notificationArea: HTMLElement;
  uploadBtn: HTMLButtonElement;
  breadcrumb: HTMLElement;

  // Progress UI
  progressContainer: HTMLElement;
  progressBar: HTMLElement;
  progressLabel: HTMLElement;
  progressText: HTMLElement;
  cancelProgress: HTMLButtonElement;

  // Modal
  uploadModal: HTMLElement;
  uploadArea: HTMLElement;
  fileInput: HTMLInputElement;

  // templates
  tplBreadcrumbItem: HTMLTemplateElement;
  tplTable: HTMLTemplateElement;
  tplEmpty: HTMLTemplateElement;
  tplLocked: HTMLTemplateElement;
  tplFileRow: HTMLTemplateElement;
  tplToast: HTMLTemplateElement;
  tpl404: HTMLTemplateElement;
}
/** * Elemen yang lahir dari template 'tpl-table'
 */
export interface TableElements {
  mainTable: HTMLTableElement;
  bodyTable: HTMLTableSectionElement;
}

/** * Elemen yang lahir dari template 'tpl-locked'
 */
export interface LockedElements {
  lockedState: HTMLElement;
  btnRetry: HTMLAnchorElement;
}

type link = {
  href: string;
  method: string;
};

export type links = {
  download?: link;
  delete?: link;
  preview?: link;
  contents?: link;
};

export interface FileItem {
  name: string;
  path: string;
  size_byte: number | null;
  modified_at: number;
  type: string | null;
  _links: links;
}

export interface FileItemsResponse {
  items: FileItem[] | null;
  _links: {
    upload: link;
  };
}

export interface SetupOptions {
  elements: GlobalElements;
  onUpload: (files: FileList) => void;
  onCancel: () => void;
  onReset: () => void;
}

export interface uiStateType {
  loading: boolean;
  error: string;
  notification: string;
}

export interface ProgressView {
  label: string;
  percent: number | null; // null = indeterminate
  abortHook?: () => void;
}
