// Breadcrumb Component - Fungsi untuk render breadcrumb navigation
import type { Breadcrumb, NavigateHandler } from '../types';

export function renderBreadcrumb(
    container: HTMLElement, 
    breadcrumbs: Breadcrumb[], 
    onNavigate: NavigateHandler
): void {
    let html = '<a href="#" data-path="">🏠 Home</a>';

    if (breadcrumbs && breadcrumbs.length > 0) {
        breadcrumbs.forEach(crumb => {
            html += ` <span>/</span> <a href="#" data-path="${crumb.path}">${crumb.name}</a>`;
        });
    }

    container.innerHTML = html;

    // Attach click events
    container.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target as HTMLAnchorElement;
            const path = target.dataset.path;
            if (path !== undefined) {
                onNavigate(path);
            }
        });
    });
}
