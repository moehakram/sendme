export function showLoading(elements) {
    elements.loading.style.display = 'flex';
    elements.fileList.style.display = 'none';
    elements.error.style.display = 'none';
}

export function hideLoading(elements) {
    elements.loading.style.display = 'none';
    elements.fileList.style.display = 'block';
}

export function showError(elements, message) {
    elements.error.textContent = `✗ ${message}`;
    elements.error.style.display = 'block';
    elements.loading.style.display = 'none';
    elements.fileList.style.display = 'none';
}

export function hideError(elements) {
    elements.error.style.display = 'none';
}

export function showSuccess(message) {
    alert(message);
}
