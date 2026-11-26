/* ===== SIMPLE HASH ROUTER ===== */
const Router = {
  routes: {},
  currentRoute: null,

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(path) {
    window.location.hash = path;
  },

  _resolve() {
    window.scrollTo(0, 0);
    const hash = window.location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(Boolean);

    // Try exact match first
    if (this.routes[hash]) {
      this.currentRoute = hash;
      this.routes[hash](parts);
      return;
    }

    // Try pattern match (e.g., /paciente/:id)
    for (const route of Object.keys(this.routes)) {
      const routeParts = route.split('/').filter(Boolean);
      if (routeParts.length !== parts.length) continue;

      const params = {};
      let match = true;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          params[routeParts[i].slice(1)] = parts[i];
        } else if (routeParts[i] !== parts[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        this.currentRoute = route;
        this.routes[route](parts, params);
        return;
      }
    }

    // Default to landing
    this.currentRoute = '/';
    if (this.routes['/']) this.routes['/']([]);
  },

  init() {
    window.addEventListener('hashchange', () => this._resolve());
    this._resolve();
  }
};
