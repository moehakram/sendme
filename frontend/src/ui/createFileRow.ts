import type { FileItem } from '../types';
import { formatSize, timeAgo } from '../utils/formatter';
import { getFileEmoji } from '../utils/get-icons';

export const createFileRow = (file: FileItem): HTMLTableRowElement => {
  const tr = document.createElement('tr');
  tr.className =
    'hover:bg-blue-50/50 transition-colors cursor-pointer group border-b border-gray-100 last:border-0';

  // Simpan data penting di dataset row
  tr.dataset.path = file.path;
  tr.dataset.isDir = String(file.is_dir);
  tr.dataset.name = file.name;

  tr.innerHTML = `
    <td class="px-6 py-4 min-w-0"> 
      <div class="flex items-center gap-3 min-w-0"> 
        <span class="flex-shrink-0 text-xl">${
          file.is_dir ? '📁' : getFileEmoji(file.mime_type)
        }</span>
        <span class="font-medium text-gray-700 truncate block">${
          file.name
        }</span>
      </div>
    </td>
    <td class="px-6 py-4 text-gray-500 hidden md:table-cell whitespace-nowrap text-sm">
      ${file.is_dir ? '-' : formatSize(file.size_byte)}
    </td>
    <td class="px-6 py-4 text-gray-500 hidden md:table-cell whitespace-nowrap text-sm">
      ${timeAgo(file.modified_at)}
    </td>
    <td class="px-6 py-4 text-right whitespace-nowrap">
      <div class="flex justify-end gap-2 items-center">
        ${
          !file.is_dir
            ? `
          <button data-action="dl" class="p-1.5 cursor-pointer hover:bg-white rounded border border-transparent hover:border-gray-200">⬇️</button>
        `
            : ''
        }
        <button data-action="del" class="p-1.5 cursor-pointer hover:bg-white rounded border border-transparent hover:text-red-500 hover:border-red-100">🗑️</button>
      </div>
    </td>
  `;

  return tr;
};
