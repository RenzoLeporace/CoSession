/* ===== APP INIT & ROUTING ===== */

// Register all routes
Router.register('/', () => renderLanding());
Router.register('/entrar', () => renderLogin());
Router.register('/crear-cuenta', () => renderSignup());
Router.register('/app', () => renderDashboard());
Router.register('/agenda', () => AppAgenda.render());
Router.register('/pacientes', () => renderPatients());
Router.register('/paciente/:id', (parts, params) => renderPatientDetail(params.id));
Router.register('/comunidad', () => renderCommunity());

// Auto-redirect if logged in
const initialUser = DB.getUser();
if (initialUser && (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#')) {
  window.location.hash = '#/app';
}

// Initialize router
Router.init();

if (!localStorage.getItem('cosesion_initialized')) {
  localStorage.setItem('cosesion_initialized', 'true');
}
