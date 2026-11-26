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
Router.register('/perfil', () => renderProfile());

DB.initialize().then(() => {
  if (!DB.getUser() && DB.getLockedUser() && (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#')) {
    window.location.hash = '#/entrar';
  }
  Router.init();
}).catch(error => {
  const app = document.getElementById('app');
  app.textContent = `No se pudo preparar el almacenamiento seguro: ${error.message}`;
});
