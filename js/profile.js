/* ===== USER PROFILE ===== */
function renderProfile() {
  const user = DB.getUser();
  if (!user) { Router.navigate('/entrar'); return; }

  const content = `
    <div class="app-page-header">
      <div>
        <h1>Mi perfil</h1>
        <p class="app-page-subtitle">Actualizá tus datos personales y profesionales. El teléfono y los datos de institución se cifran en este dispositivo.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="handleLogout()">${Icons.logout} Cerrar sesión</button>
    </div>
    <div class="section-card">
      <div class="section-card-header"><h2>${Icons.user} Datos personales y profesionales</h2></div>
      <div class="section-card-body">
        <form class="auth-form" id="profileForm" onsubmit="saveProfile(event)">
          <div class="auth-row-2">
            <div class="form-group">
              <label class="form-label" for="profileName">Nombre y apellido</label>
              <input id="profileName" class="form-input" maxlength="100" required autocomplete="name" value="${escapeHTML(user.name)}">
            </div>
            <div class="form-group">
              <label class="form-label" for="profileEmail">Correo electrónico</label>
              <input id="profileEmail" type="email" class="form-input" maxlength="254" required autocomplete="email" value="${escapeHTML(user.email)}">
            </div>
          </div>
          <div class="auth-row-2">
            <div class="form-group">
              <label class="form-label" for="profileProfession">Profesión</label>
              <select id="profileProfession" class="form-select">
                ${['Psicopedagogo/a', 'Psicólogo/a', 'Fonoaudiólogo/a', 'Terapeuta', 'Coach', 'Otro'].map(profession =>
                  `<option value="${profession}" ${user.profession === profession ? 'selected' : ''}>${profession}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="profilePhone">Teléfono</label>
              <input id="profilePhone" type="tel" class="form-input" maxlength="40" autocomplete="tel" value="${escapeHTML(user.phone || '')}">
            </div>
          </div>
          <div class="auth-row-2">
            <div class="form-group">
              <label class="form-label" for="profileInstitution">Institución / consultorio</label>
              <input id="profileInstitution" class="form-input" maxlength="120" autocomplete="organization" value="${escapeHTML(user.institution || '')}">
            </div>
            <div class="form-group">
              <label class="form-label" for="profileInstitutionRole">Cargo o función</label>
              <input id="profileInstitutionRole" class="form-input" maxlength="100" placeholder="Ej: Coordinación clínica" value="${escapeHTML(user.institutionRole || '')}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="profileRegistration">Matrícula profesional (opcional)</label>
            <input id="profileRegistration" class="form-input" maxlength="60" value="${escapeHTML(user.professionalRegistration || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Rol en la comunidad</label>
            <input class="form-input" value="${escapeHTML(user.communityRole || 'Individual')}" disabled>
            <span class="form-hint">El coordinador administra los roles de la comunidad.</span>
          </div>
          <button type="submit" class="btn btn-primary">${Icons.check} Guardar cambios</button>
        </form>
      </div>
    </div>`;
  document.getElementById('app').innerHTML = Components.appLayout('perfil', content);
}

async function saveProfile(event) {
  event.preventDefault();
  const name = document.getElementById('profileName').value.trim();
  const email = document.getElementById('profileEmail').value.trim().toLowerCase();
  if (!name || !email) {
    showToast('Completá tu nombre y correo electrónico', 'error');
    return;
  }

  try {
    await DB.updateProfile({
      name,
      email,
      profession: document.getElementById('profileProfession').value,
      phone: document.getElementById('profilePhone').value,
      institution: document.getElementById('profileInstitution').value,
      institutionRole: document.getElementById('profileInstitutionRole').value,
      professionalRegistration: document.getElementById('profileRegistration').value
    });
    showToast('Perfil actualizado', 'success');
    renderProfile();
  } catch (error) {
    showToast(error.message || 'No se pudo guardar el perfil', 'error');
  }
}
