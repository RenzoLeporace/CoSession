/* ===== COMMUNITY – COSESIÓN (CENTRO / INTEGRARTE) ===== */
function renderCommunity() {
  const user = DB.getUser();
  if (!user) { Router.navigate('/entrar'); return; }

  const community = DB.getCommunity();
  const allUsers = DB.getUsers();
  const code = (community && community.code) || user.communityCode || 'INTEGRARTE';

  const headerHtml = `
    <div class="app-page-header">
      <div>
        <h1>Comunidad del Centro</h1>
        <p class="app-page-subtitle">Compartí fichas, DNI, CUD y evoluciones clínicas con tu equipo, sin exponer cobros.</p>
      </div>
      <button class="btn btn-outline btn-sm" onclick="showJoinCommunityModal()">${Icons.plus} Cambiar o unirse por código</button>
    </div>`;

  const bannerHtml = `
    <div class="community-banner">
      <div>
        <h2>${Icons.community} Espacio: ${code}</h2>
        <p>Todos los profesionales con el código <strong>${code}</strong> comparten la historia clínica de sus pacientes en común.</p>
      </div>
      <div class="community-code" onclick="copyCommunityCode('${code}')" title="Copiar código">
        ${Icons.copy}
        <span>${code}</span>
      </div>
    </div>`;

  const members = allUsers.filter(u => u.communityCode === code);
  const memberCards = members.map(member => {
    const isYou = member.id === user.id;
    return `
      <div class="community-member-card">
        <div class="community-member-avatar">${getInitials(member.name)}</div>
        <div>
          <div class="community-member-name">${member.name} ${isYou ? '(Vos)' : ''}</div>
          <div class="community-member-role">${member.profession || 'Profesional'}</div>
        </div>
      </div>`;
  }).join('');

  const membersHtml = `
    <h3 style="font-size:0.98rem;font-weight:700;color:var(--green-900);margin-bottom:0.85rem;display:flex;align-items:center;gap:0.4rem">${Icons.users} Profesionales conectados (${members.length})</h3>
    <div class="community-members">${memberCards}</div>`;

  const sharedPatients = DB.getPatients().filter(p => p.communityCode === code);
  let sharedPatientsHtml = '';

  if (sharedPatients.length > 0) {
    const patientRows = sharedPatients.map(p => {
      const color = getAvatarColor(p.name);
      const sessions = DB.getSessions().filter(s => s.patientId === p.id).sort((a, b) => b.date.localeCompare(a.date));
      const lastSession = sessions[0];
      const isYours = p.createdBy === user.id;

      return `
        <div class="patient-row" onclick="Router.navigate('/paciente/${p.id}')">
          <div class="patient-avatar patient-avatar--${color}">${getInitials(p.name)}</div>
          <div class="patient-info">
            <div class="patient-name">${p.name}</div>
            <div class="patient-detail">
              DNI: ${p.dni || 'Sin registrar'} · ${sessions.length} ${sessions.length === 1 ? 'evolución' : 'evoluciones'}
              ${lastSession ? ` · Última por ${lastSession.authorName || 'Colega'} (${DateUtil.formatShort(lastSession.date)})` : ''}
            </div>
          </div>
          <div class="patient-badges">
            ${p.cud ? `<span class="badge badge-green">CUD: ${p.cud === 'vigente' ? 'Vigente' : p.cud === 'en_tramite' ? 'Trámite' : 'Vencido'}</span>` : ''}
            ${isYours ? `<span class="badge badge-dark">Tuyo</span>` : `<span class="badge badge-blue">Equipo</span>`}
          </div>
        </div>`;
    }).join('');

    sharedPatientsHtml = `
      <div class="section-card">
        <div class="section-card-header">
          <h2>${Icons.fileText} Pacientes compartidos en ${code} (${sharedPatients.length})</h2>
        </div>
        <div class="patient-list">${patientRows}</div>
      </div>`;
  } else {
    sharedPatientsHtml = `
      <div class="section-card">
        <div class="section-card-header">
          <h2>${Icons.fileText} Pacientes compartidos en ${code}</h2>
        </div>
        <div class="section-card-body">
          ${Components.emptyState(Icons.users, 'Aún no hay pacientes en esta comunidad', 'Cuando vos o un colega agreguen un paciente, aparecerá acá para ver su DNI, CUD y evoluciones.', 'Agregar paciente', "Router.navigate('/pacientes')")}
        </div>
      </div>`;
  }

  const privacyHtml = `
    <div class="section-card">
      <div class="section-card-header">
        <h2>${Icons.shield} Reglas de privacidad en ${code}</h2>
      </div>
      <div class="section-card-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1.25rem">
          <div>
            <h4 style="font-size:0.88rem;font-weight:700;color:var(--green-800);margin-bottom:0.5rem;display:flex;align-items:center;gap:0.35rem">${Icons.checkCircle} Visible para colegas de ${code}</h4>
            <ul style="font-size:0.86rem;color:var(--ink-2);display:flex;flex-direction:column;gap:0.35rem">
              <li>• Nombre completo y DNI del paciente</li>
              <li>• Condición frente al CUD</li>
              <li>• Tipo de cobertura (Obra Social / Particular)</li>
              <li>• Evoluciones clínicas de sesiones anteriores</li>
            </ul>
          </div>
          <div>
            <h4 style="font-size:0.88rem;font-weight:700;color:var(--ink-2);margin-bottom:0.5rem;display:flex;align-items:center;gap:0.35rem">${Icons.lock} 100% Privado (solo vos)</h4>
            <ul style="font-size:0.86rem;color:var(--ink-2);display:flex;flex-direction:column;gap:0.35rem">
              <li>• Pagos, cobros y montos de sesiones</li>
              <li>• Estado de pago (Pagado / Pendiente)</li>
              <li>• Tu agenda individual de turnos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>`;

  const app = document.getElementById('app');
  app.innerHTML = Components.appLayout('comunidad', headerHtml + bannerHtml + membersHtml + sharedPatientsHtml + privacyHtml);
}

function copyCommunityCode(code) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => showToast(`Código "${code}" copiado`, 'info'));
  } else {
    showToast(`Código: ${code}`, 'info');
  }
}

function showJoinCommunityModal() {
  const user = DB.getUser();
  const modalHtml = Components.modal(
    'Código de comunidad del centro',
    `
    <p style="font-size:0.9rem;color:var(--ink-2)">
      Ingresá el código de tu centro (por ejemplo <strong>INTEGRARTE</strong>) para compartir datos clínicos y evoluciones con tus colegas.
    </p>
    <div class="form-group">
      <label class="form-label">Código de comunidad</label>
      <input type="text" id="joinCommunityCode" class="form-input" placeholder="Ej: INTEGRARTE" value="${user.communityCode || ''}">
    </div>
    `,
    `
    <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Cancelar</button>
    <button class="btn btn-primary" onclick="joinCommunity()">Guardar código</button>
    `
  );
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function joinCommunity() {
  const code = document.getElementById('joinCommunityCode').value.trim().toUpperCase();
  if (!code) { showToast('Ingresá un código válido', 'error'); return; }

  const user = DB.getUser();
  user.communityCode = code;
  DB.setUser(user);
  DB.saveUser(user);

  let community = DB.getCommunity();
  if (!community || community.code !== code) {
    community = { code, name: code, members: [user.id] };
  } else if (!community.members.includes(user.id)) {
    community.members.push(user.id);
  }
  DB.setCommunity(community);

  document.querySelector('.modal-overlay').remove();
  showToast(`Conectado a la comunidad "${code}"`, 'success');
  renderCommunity();
}
