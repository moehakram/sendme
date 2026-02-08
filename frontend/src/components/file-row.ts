import type { FileItem } from '../types';
import { formatSize, timeAgo } from '../utils/format.util';
import { getFileEmoji } from '../utils/icon.util';
import { mapElements } from '../utils/dom.util';

type RowElements = {
  fileIcon: HTMLElement;
  fileName: HTMLElement;
  fileSize: HTMLElement;
  fileModified: HTMLElement;
  btnDownload: HTMLAnchorElement;
  btnDelete: HTMLButtonElement;
};

export const fileRowFactory = (template: HTMLTableRowElement) => {
  return (file: FileItem): HTMLElement => {
    const tr = template.cloneNode(true) as HTMLTableRowElement;

    const el = mapElements<RowElements>(tr);

    // 1. Set Metadata
    tr.dataset.path = file.path;
    tr.dataset.name = file.name;
    tr.dataset.hrefPreview = file._links?.preview?.href ?? '';
    tr.dataset.hrefNavigate = file._links?.contents?.href ?? '';

    // 2. Mapping Data Dasar
    el.fileIcon.textContent = getFileEmoji(file.type);
    el.fileName.textContent = file.name;
    el.fileSize.textContent =
      file.type === 'folder' ? '-' : formatSize(file.size_byte);
    el.fileModified.textContent = timeAgo(file.modified_at);

    // 3. Logika Kondisional Tombol (HATEOAS based)
    if (file._links.download) {
      el.btnDownload.href = file._links.download.href;
    } else {
      el.btnDownload.remove();
    }

    if (file._links.delete) {
      el.btnDelete.dataset.href = file._links.delete.href;
    } else {
      el.btnDelete.remove();
    }

    return tr;
  };
};
