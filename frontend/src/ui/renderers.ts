import type { Elements, FileItem, ProgressData } from '../types';
import { createFileRow } from './createFileRow';

/* --- Render Tabel --- */
export const renderTable = (container: HTMLElement, items: FileItem[]) => {
  const fragment = document.createDocumentFragment();
  items.forEach(item => fragment.appendChild(createFileRow(item)));
  container.replaceChildren(fragment);
};

/* --- Render Breadcrumb --- */
export const renderBreadcrumb = (
  container: HTMLElement,
  parts: string[],
  onNavigate: (p: string) => void,
) => {
  container.innerHTML = '';
  //   const parts = path.split('/').filter(Boolean);

  const createBtn = (text: string, p: string, isLast: boolean) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = isLast
      ? 'font-bold text-gray-800'
      : 'hover:text-blue-600 text-gray-500 cursor-pointer';
    if (!isLast) btn.onclick = () => onNavigate(p);
    return btn;
  };

  container.appendChild(createBtn('My Files', '', parts.length === 0));
  let currentPath = '';
  parts.forEach((part, index) => {
    container.append(' / ');
    currentPath += (currentPath ? '/' : '') + part;
    container.appendChild(
      createBtn(part, currentPath, index === parts.length - 1),
    );
  });
};

/* --- Render Progress --- */
export const renderProgress = (
  elements: Elements,
  data: ProgressData | null,
) => {
  const isVisible = data !== null;
  elements.progContainer.classList.toggle('-translate-y-full', !isVisible);

  if (data) {
    elements.progBar.style.width = `${data.percent}%`;
    elements.progText.textContent = `${data.percent}%`;
    elements.progLabel.textContent = data.label;
  }
};

/* --- Render App Status --- */
export const renderStatus = (
  elements: Elements,
  loading: boolean,
  error: string | null,
  showTable: boolean,
  showEmpty: boolean,
) => {
  elements.loading.classList.toggle('hidden', !loading);
  elements.error.classList.toggle('hidden', !error);
  elements.error.textContent = error || '';

  //   const shouldShowTable = !loading && hasFiles;
  //   const shouldShowEmpty = !loading && !hasFiles && !error;

  elements.table.classList.toggle('hidden', !showTable);
  elements.emptyState.classList.toggle('hidden', !showEmpty);
};
