export const getFileEmoji = (mimeType: string | null): string => {
  if (!mimeType) return '📄';

  // 1. Pemetaan Spesifik (Priority)
  const emojiMap: Record<string, string> = {
    folder: '📁',
    // PDF
    'application/pdf': '📕',

    // Microsoft Office & Documents
    'application/msword': '📘',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      '📘', // .docx
    'application/vnd.ms-excel': '📗',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📗', // .xlsx
    'application/vnd.ms-powerpoint': '📙',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      '📙', // .pptx

    // Archives
    'application/zip': '📦',
    'application/x-7z-compressed': '📦',
    'application/x-rar-compressed': '📦',
    'application/x-tar': '📦',

    // Data & Code
    'application/json': '📜',
    'text/csv': '📊',
    'text/html': '🌐',
    'application/javascript': '💻',
    'application/typescript': '💻',
  };

  // Cek jika ada di map spesifik
  if (emojiMap[mimeType]) {
    return emojiMap[mimeType];
  }

  // 2. Fallback berdasarkan kategori (Prefix)
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.startsWith('text/')) return '📄';

  // 3. Default fallback
  return '📄';
};
