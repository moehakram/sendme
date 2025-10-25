// Breadcrumb Component - Fungsi untuk render breadcrumb navigation

export function renderBreadcrumb(container, breadcrumbs, onNavigate) {
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
            onNavigate(e.target.dataset.path);
        });
    });
}
