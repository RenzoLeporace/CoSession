/* ===== AUTH PAGES – COSESIÓN ===== */

function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-top-bar">
        ${Components.brandLogo(true, "Router.navigate('/')")}
        <a class="auth-back-link" onclick="Router.navigate('/')">${Icons.arrowLeft} Volver al inicio</a>
      </div>

      <div class="auth-card">
        <div class="auth-card-head">
          <h1>Ingresá a tu consultorio</h1>
          <p>Accedé a tu agenda flexible, fichas con CUD y evoluciones de tu comunidad.</p>
        </div>

        <form class="auth-form" id="loginForm" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label class="form-label" for="loginEmail">Correo electrónico</label>
            <input type="email" id="loginEmail" class="form-input" placeholder="tu@email.com" required autocomplete="email">
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
          <p>Elegí tu especialidad y, si trabajás en un centro, sumate con su código.</p>
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
            <span class="form-hint">Los colegas con el mismo código comparten fichas, CUD y evoluciones (sin ver cobros).</span>
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

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const users = DB.getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    showToast('No encontramos una cuenta con ese correo', 'error');
    return;
  }
  if (user.password !== password) {
    showToast('Contraseña incorrecta', 'error');
    return;
  }

  DB.setUser(user);
  showToast(`¡Bienvenido/a, ${user.name}!`, 'success');
  Router.navigate('/app');
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const profession = document.getElementById('signupProfession').value || 'Psicopedagogo/a';
  const communityCode = document.getElementById('signupCommunityCode').value.trim().toUpperCase() || 'INTEGRARTE';

  if (password.length < 8) {
    showToast('La contraseña debe tener al menos 8 caracteres', 'error');
    return;
  }

  const users = DB.getUsers();
  if (users.find(u => u.email === email)) {
    showToast('Ya existe una cuenta con ese correo', 'error');
    return;
  }

  const user = {
    id: DB.id(),
    name,
    email,
    password,
    profession,
    communityCode,
    createdAt: new Date().toISOString()
  };

  DB.saveUser(user);
  DB.setUser(user);

  const existing = DB.getCommunity();
  if (!existing || existing.code !== communityCode) {
    DB.setCommunity({
      code: communityCode,
      name: communityCode,
      members: [user.id]
    });
  } else if (!existing.members.includes(user.id)) {
    existing.members.push(user.id);
    DB.setCommunity(existing);
  }

  showToast(`¡Cuenta creada! Bienvenido/a, ${name}`, 'success');
  Router.navigate('/app');
}
