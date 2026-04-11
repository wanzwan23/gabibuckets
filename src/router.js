// Simple hash-based SPA router with smooth page transitions
export class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentPage = null;
        this.isTransitioning = false;
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, queryString] = hash.split('?');
        const params = new URLSearchParams(queryString || '');

        const route = this.routes[path] || this.routes['*'] || this.routes['/'];
        if (route) {
            this.currentPage = route;
            this.transitionTo(() => route.render(params));
        }
    }

    transitionTo(renderFn) {
        const app = document.getElementById('app');
        if (!app) {
            renderFn();
            return;
        }

        // If it's the first render (empty app), skip transition
        if (!app.innerHTML.trim()) {
            renderFn();
            app.classList.add('page-visible');
            return;
        }

        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Fade out
        app.classList.add('page-exit');
        app.classList.remove('page-visible');

        setTimeout(() => {
            renderFn();
            app.classList.remove('page-exit');
            app.classList.add('page-enter');

            // Trigger reflow, then add visible
            requestAnimationFrame(() => {
                app.classList.remove('page-enter');
                app.classList.add('page-visible');
                this.isTransitioning = false;
            });
        }, 250);
    }

    start() {
        this.handleRoute();
    }
}

export function navigate(path) {
    window.location.hash = path;
}
