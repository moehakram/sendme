import type { Elements } from '../types';

export function showLoading(elements: Elements): void {
    elements.loading.style.display = 'flex';
    elements.fileList.style.display = 'none';
    elements.error.style.display = 'none';
}

export function hideLoading(elements: Elements): void {
    elements.loading.style.display = 'none';
    elements.fileList.style.display = 'block';
}

export function showError(elements: Elements, message: string): void {
    elements.error.textContent = `✗ ${message}`;
    elements.error.style.display = 'block';
    elements.loading.style.display = 'none';
    elements.fileList.style.display = 'none';
}

export function hideError(elements: Elements): void {
    elements.error.style.display = 'none';
}

export function showSuccess(message: string): void {
    alert(message);
}
