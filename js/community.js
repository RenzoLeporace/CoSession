/* ===== COMMUNITY MEMBERSHIP AND ROLE MANAGEMENT ===== */
function renderCommunity() {
  const user = DB.getUser();
  if (!user) { Router.navigate('/entrar'); return; }

  const community = DB.getCommunity();
  if (user.communityStatus === 'approved' && community) {
    renderCommunityMembers(user, community);
    return;
  }
  if (user.communityStatus === 'pending') {
    renderPendingMembership(user);
    return;
  }
  renderIndividualCommunityOptions();
}

function renderIndividualCommunityOptions() {
  const content = `
    <div class="app-page-header">
      <div>
        <h1>Tu cuenta individual</h1>
        <p class="app-page-subtitle">Podés usar tu espacio personal o solicitar unirte a una comunidad.</p>
      </div>
    </div>
    <div class="section-card">
      <div class="section-card-header"><h2>${Icons.community} Unirte a una comunidad</h2></div>
      <div class="section-card-body">
        <p style="margin-bottom:1rem;color:var(--ink-2)">Ingresá el código que te compartió el coordinador. Tu ingreso queda pendiente hasta que te acepte.</p>
        <div class="form-group">
          <label class="form-label" for="joinCommunityCode">Código de comunidad</label>
          <input type="text" id="joinCommunityCode" class="form-input" placeholder="Ej: INTEGRARTE">
        </div>
        <button class="btn btn-primary" onclick="joinCommunity()">Solicitar ingreso</button>
      </div>
    </div>
    <div class="section-card">
      <div class="section-card-header"><h2>${Icons.users} Crear una comunidad</h2></div>
      <div class="section-card-body">
        <p style="margin-bottom:1rem;color:var(--ink-2)">Al crearla, vas a ser su coordinador/a y podrás aceptar integrantes y administrar sus roles.</p>
        <button class="btn btn-outline" onclick="showCreateCommunityModal()">${Icons.plus} Crear comunidad</button>
      </div>
    </div>
    <div class="section-card">
      <div class="section-card-body" style="color:var(--ink-2)">
        <strong>Modo demo local:</strong> las cuentas, solicitudes y aprobaciones se guardan en este navegador. No se sincronizan entre dispositivos ni comparten fichas clínicas con otros usuarios.
      </div>
    </div>`;
  document.getElementById('app').innerHTML = Components.appLayout('comunidad', content);
}

function renderPendingMembership(user) {
  const requestedCommunity = DB.getCommunities().find(item => item.id === user.requestedCommunityId);
  const content = `
    <div class="app-page-header">
      <div>
        <h1>Solicitud pendiente</h1>
        <p class="app-page-subtitle">Todavía conservás tu espacio individual.</p>
      </div>
    </div>
    <div class="section-card">
      <div class="section-card-body">
        <h2 style="margin-bottom:0.5rem">${Icons.clock} Esperando al coordinador</h2>
        <p style="color:var(--ink-2)">Tu solicitud para unirte a <strong>${requestedCommunity ? escapeHTML(requestedCommunity.name) : 'la comunidad'}</strong> está pendiente. Hasta que te acepten, no sos integrante ni ves datos de la comunidad.</p>
        <button class="btn btn-outline btn-sm" style="margin-top:1rem" onclick="cancelCommunityRequest()">Cancelar solicitud</button>
      </div>
    </div>`;
  document.getElementById('app').innerHTML = Components.appLayout('comunidad', content);
}

function renderCommunityMembers(user, community) {
  const users = DB.getUsers();
  const members = community.members
    .filter(member => member.status === 'approved')
    .map(member => ({ membership: member, user: users.find(account => account.id === member.userId) }))
    .filter(item => item.user);

  const memberCards = members.map(({ membership, user: member }) => `
    <div class="community-member-card">
      <div class="community-member-avatar">${getInitials(member.name)}</div>
      <div style="flex:1">
        <div class="community-member-name">${escapeHTML(member.name)}${member.id === user.id ? ' (Vos)' : ''}</div>
        <div class="community-member-role">${escapeHTML(member.profession || 'Profesional')} · ${escapeHTML(membership.role)}</div>
      </div>
    </div>`).join('');

  const requests = community.requests || [];
  const requestsHtml = DB.can('manage_members', user) ? `
    <div class="section-card">
      <div class="section-card-header"><h2>${Icons.users} Solicitudes pendientes (${requests.length})</h2></div>
      <div class="section-card-body">
        ${requests.length ? requests.map(request => {
          const applicant = users.find(account => account.id === request.userId);
          if (!applicant) return '';
          return `<div class="community-member-card">
            <div class="community-member-avatar">${getInitials(applicant.name)}</div>
            <div style="flex:1">
              <div class="community-member-name">${escapeHTML(applicant.name)}</div>
              <div class="community-member-role">${escapeHTML(applicant.profession || 'Profesional')} · ${escapeHTML(applicant.email)}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="decideCommunityRequest('${request.userId}', true)">Aceptar</button>
            <button class="btn btn-outline btn-sm" onclick="decideCommunityRequest('${request.userId}', false)">Rechazar</button>
          </div>`;
        }).join('') : '<p style="color:var(--ink-3)">No hay solicitudes por revisar.</p>'}
      </div>
    </div>` : '';

  const rolesHtml = DB.can('manage_roles', user) ? `
    <div class="section-card">
      <div class="section-card-header"><h2>${Icons.shield} Panel de roles</h2></div>
      <div class="section-card-body">
        <p style="margin-bottom:1rem;color:var(--ink-2)">Solo el coordinador puede cambiar roles. El rol Coordinador está reservado a quien creó esta comunidad.</p>
        <ul style="margin-bottom:1rem;color:var(--ink-2)">
          <li><strong>Profesional:</strong> administra pacientes, agenda y evoluciones clínicas.</li>
          <li><strong>Analista:</strong> consulta información clínica sin editarla.</li>
          <li><strong>Recepcionista:</strong> administra agenda y datos básicos de pacientes, sin acceso a fichas clínicas.</li>
          <li><strong>Observador:</strong> consulta solo el directorio, sin acceso a las fichas clínicas.</li>
        </ul>
        ${members.filter(({ user: member }) => member.id !== user.id).map(({ membership, user: member }) => `
          <div class="community-member-card">
            <div class="community-member-avatar">${getInitials(member.name)}</div>
            <div style="flex:1">
              <div class="community-member-name">${escapeHTML(member.name)}</div>
              <div class="community-member-role">${escapeHTML(member.profession || 'Profesional')}</div>
            </div>
            <label class="visually-hidden" for="role-${member.id}">Rol de ${escapeHTML(member.name)}</label>
            <select id="role-${member.id}" class="form-select" style="max-width:12rem" onchange="updateMemberRole('${member.id}', this.value)">
              ${['Profesional', 'Analista', 'Recepcionista', 'Observador'].map(role => `<option value="${role}" ${membership.role === role ? 'selected' : ''}>${role}</option>`).join('')}
            </select>
            <button class="btn btn-outline btn-sm" onclick="removeCommunityMember('${member.id}')">Quitar</button>
          </div>`).join('') || '<p style="color:var(--ink-3)">Todavía no hay otros integrantes.</p>'}
      </div>
    </div>` : '';

  const content = `
    <div class="app-page-header">
      <div>
        <h1>Comunidad · ${escapeHTML(community.name)}</h1>
        <p class="app-page-subtitle">${user.communityRole} · ${members.length} ${members.length === 1 ? 'integrante' : 'integrantes'}</p>
      </div>
      <button class="btn btn-outline btn-sm" data-code="${escapeHTML(community.code)}" onclick="copyCommunityCode(this.dataset.code)">${Icons.copy} Código: ${escapeHTML(community.code)}</button>
    </div>
    <div class="section-card">
      <div class="section-card-header"><h2>${Icons.users} Integrantes aprobados</h2></div>
      <div class="community-members">${memberCards}</div>
    </div>
    ${requestsHtml}
    ${rolesHtml}
    <div class="section-card">
      <div class="section-card-body" style="color:var(--ink-2)">
        <strong>Modo demo local:</strong> las solicitudes, los roles y los datos cifrados se guardan en este navegador. No se sincronizan entre dispositivos ni comparten fichas clínicas con otros usuarios.
      </div>
    </div>`;
  document.getElementById('app').innerHTML = Components.appLayout('comunidad', content);
}

function showCreateCommunityModal() {
  const html = Components.modal(
    'Crear comunidad',
    `<div class="form-group">
      <label class="form-label" for="communityName">Nombre de la comunidad</label>
      <input id="communityName" class="form-input" maxlength="60" placeholder="Ej: Centro Integrarte">
    </div>
    <div class="form-group">
      <label class="form-label" for="communityCode">Código para invitar integrantes</label>
      <input id="communityCode" class="form-input" maxlength="16" placeholder="Ej: INTEGRARTE">
      <span class="form-hint">Usá entre 4 y 16 letras, números o guiones.</span>
    </div>`,
    `<button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Cancelar</button>
     <button class="btn btn-primary" onclick="createCommunity()">Crear comunidad</button>`
  );
  document.body.insertAdjacentHTML('beforeend', html);
}

function createCommunity() {
  const name = document.getElementById('communityName').value.trim();
  const code = document.getElementById('communityCode').value.trim().toUpperCase();
  if (!name || !/^[A-Z0-9-]{4,16}$/.test(code)) {
    showToast('Completá el nombre y un código válido (4 a 16 letras, números o guiones)', 'error');
    return;
  }
  if (DB.getUser().communityStatus === 'approved') {
    showToast('Ya pertenecés a una comunidad', 'error');
    return;
  }
  if (DB.getCommunity(code)) {
    showToast('Ese código ya está en uso. Elegí otro.', 'error');
    return;
  }

  const user = DB.getUser();
  const community = {
    id: DB.id(),
    name,
    code,
    createdBy: user.id,
    members: [{ userId: user.id, role: 'Coordinador', status: 'approved', joinedAt: new Date().toISOString() }],
    requests: []
  };
  user.communityId = community.id;
  user.communityRole = 'Coordinador';
  user.communityStatus = 'approved';
  if (user.requestedCommunityId) {
    const oldRequestCommunity = DB.getCommunities().find(item => item.id === user.requestedCommunityId);
    if (oldRequestCommunity) {
      oldRequestCommunity.requests = (oldRequestCommunity.requests || []).filter(request => request.userId !== user.id);
      DB.saveCommunity(oldRequestCommunity);
    }
  }
  delete user.requestedCommunityId;
  DB.saveCommunity(community);
  DB.saveUser(user);
  document.querySelector('.modal-overlay').remove();
  showToast('Comunidad creada. En esta demo, el código solo funciona en este navegador.', 'success');
  renderCommunity();
}

function requestCommunityMembership(user, code) {
  const community = DB.getCommunity(code);
  if (!community) {
    showToast('No encontramos una comunidad con ese código', 'error');
    return false;
  }
  if (user.communityStatus === 'approved') {
    showToast('Ya pertenecés a una comunidad', 'error');
    return false;
  }
  community.requests = community.requests || [];
  if (community.requests.some(request => request.userId === user.id)) {
    showToast('Tu solicitud ya está pendiente de aprobación', 'info');
    return true;
  }
  community.requests.push({ userId: user.id, requestedAt: new Date().toISOString() });
  user.communityStatus = 'pending';
  user.requestedCommunityId = community.id;
  DB.saveCommunity(community);
  DB.saveUser(user);
  return true;
}

function joinCommunity() {
  const code = document.getElementById('joinCommunityCode').value.trim().toUpperCase();
  if (!code) { showToast('Ingresá un código válido', 'error'); return; }
  const user = DB.getUser();
  if (requestCommunityMembership(user, code)) {
    showToast('Solicitud enviada. Vas a poder ingresar cuando te acepte el coordinador.', 'success');
    renderCommunity();
  }
}

function cancelCommunityRequest() {
  const user = DB.getUser();
  const requested = DB.getCommunities().find(item => item.id === user.requestedCommunityId);
  if (requested) {
    requested.requests = (requested.requests || []).filter(request => request.userId !== user.id);
    DB.saveCommunity(requested);
  }
  user.communityStatus = null;
  delete user.requestedCommunityId;
  DB.saveUser(user);
  renderCommunity();
}

function decideCommunityRequest(userId, approved) {
  const currentUser = DB.getUser();
  const community = DB.getCommunity();
  if (!community || !DB.can('manage_members', currentUser)) {
    showToast('Solo el coordinador puede revisar solicitudes', 'error');
    return;
  }
  const request = (community.requests || []).find(item => item.userId === userId);
  const applicant = DB.getUsers().find(item => item.id === userId);
  if (!request || !applicant || community.members.some(member => member.userId === userId && member.status === 'approved')) {
    showToast('La solicitud ya no está disponible', 'error');
    return;
  }
  community.requests = community.requests.filter(item => item.userId !== userId);
  if (approved) {
    community.members.push({
      userId,
      role: 'Profesional',
      status: 'approved',
      joinedAt: new Date().toISOString()
    });
    applicant.communityId = community.id;
    applicant.communityRole = 'Profesional';
    applicant.communityStatus = 'approved';
    delete applicant.requestedCommunityId;
  } else {
    applicant.communityStatus = 'rejected';
    applicant.requestedCommunityId = community.id;
  }
  DB.saveCommunity(community);
  DB.saveUser(applicant);
  showToast(approved ? `${applicant.name} ya es integrante` : `Solicitud de ${applicant.name} rechazada`, 'success');
  renderCommunity();
}

function updateMemberRole(userId, role) {
  const community = DB.getCommunity();
  const user = DB.getUser();
  if (!community || !DB.can('manage_roles', user)) {
    showToast('Solo el coordinador puede administrar roles', 'error');
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(COMMUNITY_ROLES, role) || role === 'Coordinador') {
    showToast('Ese rol no se puede asignar desde este panel', 'error');
    renderCommunity();
    return;
  }
  const member = community.members.find(item => item.userId === userId && item.status === 'approved');
  const account = DB.getUsers().find(item => item.id === userId);
  if (!member || !account || community.createdBy === userId) {
    showToast('No se puede cambiar el rol de este integrante', 'error');
    renderCommunity();
    return;
  }
  member.role = role;
  account.communityRole = role;
  DB.saveCommunity(community);
  DB.saveUser(account);
  showToast(`Rol actualizado a ${role}`, 'success');
  renderCommunity();
}

function removeCommunityMember(userId) {
  const community = DB.getCommunity();
  const coordinator = DB.getUser();
  if (!community || !DB.can('manage_members', coordinator)) {
    showToast('Solo el coordinador puede quitar integrantes', 'error');
    return;
  }
  const membership = community.members.find(item => item.userId === userId && item.status === 'approved');
  const account = DB.getUsers().find(item => item.id === userId);
  if (!membership || !account || community.createdBy === userId) {
    showToast('No se puede quitar a este integrante', 'error');
    return;
  }
  if (!confirm(`¿Quitar a ${account.name} de la comunidad?`)) return;

  community.members = community.members.filter(item => item.userId !== userId);
  account.communityId = null;
  account.communityRole = 'Individual';
  account.communityStatus = null;
  DB.saveCommunity(community);
  DB.saveUser(account);
  showToast(`${account.name} ya no pertenece a la comunidad`, 'success');
  renderCommunity();
}

function copyCommunityCode(code) {
  if (!navigator.clipboard) {
    showToast(`Código: ${code}`, 'info');
    return;
  }
  navigator.clipboard.writeText(code)
    .then(() => showToast(`Código "${code}" copiado`, 'info'))
    .catch(() => showToast(`No se pudo copiar. Código: ${code}`, 'error'));
}
