import type { FileItem } from '../types';

export const handleTableClick = (
  event: MouseEvent,
  act: {
    downloadFn: (f: FileItem) => void;
    deleteFn: (f: FileItem) => void;
    openFn: (f: FileItem) => void;
  },
): void => {
  const target = event.target as HTMLElement;

  const row = target.closest('tr');
  if (!row || !row.dataset.path) return;

  const { path, name, isDir } = row.dataset;
  const isDirectory = isDir === 'true';
  const file = {
    path: path!,
    name: name!,
    is_dir: isDirectory,
  } as FileItem;

  const button = target.closest('button[data-action]');
  const action = button?.getAttribute('data-action');

  if (action === 'dl') {
    act.downloadFn(file);
    return;
  }

  if (action === 'del') {
    act.deleteFn(file);
    return;
  }

  act.openFn(file);
};
