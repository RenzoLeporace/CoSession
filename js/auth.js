/* ===== AUTH PAGES – COSESIÓN ===== */

function renderLogin() {
  const app = document.getElementById('app');
  const lockedUser = DB.getLockedUser();
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-top-bar">
        ${Components.brandLogo(true, "Router.navigate('/')")}
        <a class="auth-back-link" onclick="Router.navigate('/')">${Icons.arrowLeft} Volver al inicio</a>
      </div>

      <div class="auth-card">
        <div class="auth-card-head">
          <h1>Ingresá a tu consultorio</h1>
          <p>Accedé a tu agenda y a tus fichas cifradas en este dispositivo.</p>
        </div>

        <form class="auth-form" id="loginForm" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label class="form-label" for="loginEmail">Correo electrónico</label>
            <input type="email" id="loginEmail" class="form-input" placeholder="tu@email.com" required autocomplete="email" value="${lockedUser ? escapeHTML(lockedUser.email) : ''}">
          </div>
          <div class="form-group">
            <label class="form-label" for="loginPassword">Contraseña</label>
            <div class="password-wrapper">
              <input type="password" id="loginPassword" class="form-input" style="width:100%;padding-right:3rem" placeholder="••••••••" required autocomplete="current-password">
              <button type="button" class="password-toggle" onclick="togglePassword('loginPassword', this)">${Icons.eye}</button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:0.25rem">Ingresar</button>
        </form>

        <div class="auth-footer-switch">
          ¿Todavía no tenés cuenta? <button onclick="Router.navigate('/crear-cuenta')">Creala gratis</button>
        </div>
      </div>
    </div>
  `;
}

function renderSignup() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-top-bar">
        ${Components.brandLogo(true, "Router.navigate('/')")}
        <a class="auth-back-link" onclick="Router.navigate('/')">${Icons.arrowLeft} Volver al inicio</a>
      </div>

      <div class="auth-card">
        <div class="auth-card-head">
          <h1>Creá tu cuenta en CoSesión</h1>
          <p>Elegí tu especialidad. Podés crear una cuenta individual y unirte a una comunidad más adelante.</p>
        </div>

        <form class="auth-form" id="signupForm" onsubmit="handleSignup(event)">
          <div class="auth-row-2">
            <div class="form-group">
              <label class="form-label" for="signupName">Nombre y apellido</label>
              <input type="text" id="signupName" class="form-input" placeholder="Ej: Aldana Gómez" required autocomplete="name">
            </div>
            <div class="form-group">
              <label class="form-label" for="signupEmail">Correo electrónico</label>
              <input type="email" id="signupEmail" class="form-input" placeholder="tu@email.com" required autocomplete="email">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="signupPassword">Contraseña</label>
            <div class="password-wrapper">
              <input type="password" id="signupPassword" class="form-input" style="width:100%;padding-right:3rem" placeholder="Mínimo 8 caracteres" required autocomplete="new-password" minlength="8">
              <button type="button" class="password-toggle" onclick="togglePassword('signupPassword', this)">${Icons.eye}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Tu profesión</label>
            <div class="profession-grid" id="professionGrid">
              <div class="profession-option" data-value="Psicopedagogo/a" onclick="selectProfession(this)">Psicopedagogo/a</div>
              <div class="profession-option" data-value="Psicólogo/a" onclick="selectProfession(this)">Psicólogo/a</div>
              <div class="profession-option" data-value="Fonoaudiólogo/a" onclick="selectProfession(this)">Fonoaudiólogo/a</div>
              <div class="profession-option" data-value="Terapeuta" onclick="selectProfession(this)">Terapeuta</div>
              <div class="profession-option" data-value="Coach" onclick="selectProfession(this)">Coach</div>
              <div class="profession-option" data-value="Otro" onclick="selectProfession(this)">Otro</div>
            </div>
            <input type="hidden" id="signupProfession" value="">
          </div>

          <div class="form-group">
            <label class="form-label" for="signupCommunityCode">Código de comunidad / centro (opcional)</label>
            <input type="text" id="signupCommunityCode" class="form-input" placeholder="Ej: INTEGRARTE" autocomplete="off">
            <span class="form-hint">Si lo ingresás, tu solicitud deberá ser aceptada por el coordinador. También podés unirte después desde la app.</span>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:0.25rem">Crear mi cuenta</button>
        </form>

        <div class="auth-footer-switch">
          ¿Ya tenés cuenta? <button onclick="Router.navigate('/entrar')">Ingresá acá</button>
        </div>
      </div>
    </div>
  `;
}

let selectedProfession = '';

function selectProfession(el) {
  document.querySelectorAll('.profession-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedProfession = el.dataset.value;
  document.getElementById('signupProfession').value = selectedProfession;
}

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = Icons.eyeOff;
  } else {
    input.type = 'password';
    btn.innerHTML = Icons.eye;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  try {
    const user = DB.getUsers().find(account => account.email.toLowerCase() === email);
    if (!user) {
      showToast('No encontramos una cuenta con ese correo', 'error');
      return;
    }
    if (!user.passwordHash || !user.passwordSalt) {
      showToast('Esta cuenta requiere una actualización segura. Contactá al administrador.', 'error');
      return;
    }
    if (!await DB.unlockUser(user, password)) {
      showToast('Contraseña incorrecta', 'error');
      return;
    }
    showToast(`¡Bienvenido/a, ${user.name}!`, 'success');
    Router.navigate('/app');
  } catch (error) {
    showToast(error.message || 'No se pudo descifrar tu información local', 'error');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  const profession = document.getElementById('signupProfession').value || 'Psicopedagogo/a';
  const communityCode = document.getElementById('signupCommunityCode').value.trim().toUpperCase();

  if (password.length < 8) {
    showToast('La contraseña debe tener al menos 8 caracteres', 'error');
    return;
  }

  const users = DB.getUsers();
  if (users.find(u => u.email.toLowerCase() === email)) {
    showToast('Ya existe una cuenta con ese correo', 'error');
    return;
  }
  if (communityCode && !DB.getCommunity(communityCode)) {
    showToast('No encontramos una comunidad con ese código. Podés crear tu cuenta individual y unirte más adelante.', 'error');
    return;
  }

  try {
    const credentials = await DB.createCredentials(password);
    const user = {
      id: DB.id(),
      name,
      email,
      profession,
      ...credentials,
      communityRole: 'Individual',
      communityStatus: null,
      createdAt: new Date().toISOString()
    };
    delete user.key;

    DB.saveUser(user);
    await DB.activateUser(user, credentials.key);
    if (communityCode) {
      requestCommunityMembership(user, communityCode);
      showToast(`Cuenta creada. Tu solicitud para "${communityCode}" quedó pendiente de aprobación.`, 'info');
    } else {
      showToast(`¡Cuenta individual creada! Bienvenido/a, ${name}`, 'success');
    }
    Router.navigate(communityCode ? '/comunidad' : '/app');
  } catch (error) {
    showToast(error.message || 'No se pudo crear tu cuenta cifrada', 'error');
  }
}
