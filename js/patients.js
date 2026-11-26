/* ===== PATIENTS – COSESIÓN ===== */
let currentPatientFilter = 'all';

function renderPatients() {
  const user = DB.getUser();
  if (!user) { Router.navigate('/entrar'); return; }

  const patients = DB.getPatients().filter(p => p.createdBy === user.id || p.communityCode === user.communityCode);

  const headerHtml = `
    <div class="app-page-header">
      <div>
        <h1>Pacientes</h1>
        <p class="app-page-subtitle">Fichas clínicas, cobertura (Obra Social / Particular), CUD y notas de sesión.</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="showAddPatientModal()">${Icons.plus} Nuevo paciente</button>
    </div>`;

  let listHtml;
  if (patients.length === 0) {
    listHtml = `
      <div class="section-card">
        <div class="section-card-body">
          ${Components.emptyState(Icons.users, 'Todavía no hay pacientes', 'Cargá tu primer paciente con su DNI, cobertura y estado del CUD.', 'Agregar paciente', 'showAddPatientModal()')}
        </div>
      </div>`;
  } else {
    const controlsHtml = `
      <div class="search-bar-row">
        <div class="search-wrapper">
          ${Icons.search}
          <input type="text" class="form-input" placeholder="Buscar por nombre o DNI..." id="patientSearch" oninput="filterPatients()">
        </div>
        <div class="filter-pills">
          <button class="filter-pill ${currentPatientFilter === 'all' ? 'active' : ''}" onclick="setPatientFilter('all')">Todos</button>
          <button class="filter-pill ${currentPatientFilter === 'obra_social' ? 'active' : ''}" onclick="setPatientFilter('obra_social')">Obra Social</button>
          <button class="filter-pill ${currentPatientFilter === 'particular' ? 'active' : ''}" onclick="setPatientFilter('particular')">Particular</button>
          <button class="filter-pill ${currentPatientFilter === 'cud' ? 'active' : ''}" onclick="setPatientFilter('cud')">Con CUD</button>
        </div>
      </div>`;

    listHtml = `
      ${controlsHtml}
      <div class="section-card">
        <div class="patient-list" id="patientList">
          ${getFilteredPatientsHtml(patients, '')}
        </div>
      </div>`;
  }

  const app = document.getElementById('app');
  app.innerHTML = Components.appLayout('pacientes', headerHtml + listHtml);
}

function setPatientFilter(filter) {
  currentPatientFilter = filter;
  renderPatients();
}

function getFilteredPatientsHtml(allPatients, query) {
  const filtered = allPatients.filter(p => {
    const matchesText = !query || p.name.toLowerCase().includes(query) || (p.dni && p.dni.includes(query));
    if (!matchesText) return false;
    if (currentPatientFilter === 'obra_social') return p.paymentType === 'obra_social';
    if (currentPatientFilter === 'particular') return p.paymentType === 'particular';
    if (currentPatientFilter === 'cud') return Boolean(p.cud);
    return true;
  });

  return filtered.map(p => Components.patientRow(p)).join('') ||
    '<div style="padding:2rem;text-align:center;color:var(--ink-3)">No hay pacientes que coincidan con la búsqueda.</div>';
}

function filterPatients() {
  const user = DB.getUser();
  const query = document.getElementById('patientSearch').value.toLowerCase();
  const allPatients = DB.getPatients().filter(p => p.createdBy === user.id || p.communityCode === user.communityCode);
  const list = document.getElementById('patientList');
  if (list) list.innerHTML = getFilteredPatientsHtml(allPatients, query);
}

function showAddPatientModal() {
  const modalHtml = Components.modal(
    'Nuevo paciente',
    `
    <div class="form-group">
      <label class="form-label">Nombre y apellido</label>
      <input type="text" id="patientName" class="form-input" placeholder="Ej: Lucas Fernández" required>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
      <div class="form-group">
        <label class="form-label">DNI</label>
        <input type="text" id="patientDni" class="form-input" placeholder="Ej: 42123456">
      </div>
      <div class="form-group">
        <label class="form-label">Teléfono (WhatsApp)</label>
        <input type="tel" id="patientPhone" class="form-input" placeholder="Ej: 5491122334455">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Correo electrónico</label>
      <input type="email" id="patientEmail" class="form-input" placeholder="paciente@email.com">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
      <div class="form-group">
        <label class="form-label">Tipo de atención</label>
        <select id="patientPaymentType" class="form-select">
          <option value="particular">Particular</option>
          <option value="obra_social">Obra Social</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Condición frente al CUD</label>
        <select id="patientCud" class="form-select">
          <option value="">Sin CUD</option>
          <option value="vigente">CUD Vigente</option>
          <option value="en_tramite">CUD en trámite</option>
          <option value="vencido">CUD Vencido</option>
        </select>
      </div>
    </div>
    <div class="form-group" id="obraSocialGroup" style="display:none">
      <label class="form-label">Nombre de la Obra Social / Prepaga</label>
      <input type="text" id="patientObraSocial" class="form-input" placeholder="Ej: OSDE, IOMA, Swiss Medical...">
    </div>
    <div class="form-group">
      <label class="form-label">Observaciones iniciales</label>
      <textarea id="patientNotes" class="form-input" placeholder="Motivo de consulta, escuela, derivación..."></textarea>
    </div>
    `,
    `
    <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveNewPatient()">Guardar paciente</button>
    `
  );

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.getElementById('patientPaymentType').addEventListener('change', function() {
    document.getElementById('obraSocialGroup').style.display = this.value === 'obra_social' ? '' : 'none';
  });
}

function saveNewPatient() {
  const name = document.getElementById('patientName').value.trim();
  if (!name) { showToast('Ingresá el nombre del paciente', 'error'); return; }

  const user = DB.getUser();
  const patient = {
    id: DB.id(),
    name,
    dni: document.getElementById('patientDni').value.trim(),
    phone: document.getElementById('patientPhone').value.trim(),
    email: document.getElementById('patientEmail').value.trim(),
    paymentType: document.getElementById('patientPaymentType').value,
    obraSocial: document.getElementById('patientObraSocial').value.trim(),
    cud: document.getElementById('patientCud').value,
    notes: document.getElementById('patientNotes').value.trim(),
    createdBy: user.id,
    createdByName: user.name,
    communityCode: user.communityCode,
    createdAt: new Date().toISOString()
  };

  DB.savePatient(patient);
  document.querySelector('.modal-overlay').remove();
  showToast(`Paciente "${name}" guardado`, 'success');
  if (Router.currentRoute === '/app') renderDashboard();
  else renderPatients();
}

function renderPatientDetail(id) {
  const user = DB.getUser();
  if (!user) { Router.navigate('/entrar'); return; }

  const patient = DB.getPatients().find(p => p.id === id);
  if (!patient) {
    showToast('Paciente no encontrado', 'error');
    Router.navigate('/pacientes');
    return;
  }

  const isCommunity = patient.communityCode === user.communityCode;
  const isOwner = patient.createdBy === user.id;

  const allSessions = DB.getSessionsByPatient(id).sort((a, b) => b.date.localeCompare(a.date));
  const myAppointments = DB.getAppointments().filter(a => a.patientId === id && a.createdBy === user.id).sort((a, b) => b.date.localeCompare(a.date));
  const color = getAvatarColor(patient.name);

  const typeLabel = patient.paymentType === 'obra_social'
    ? (patient.obraSocial ? `Obra Social · ${patient.obraSocial}` : 'Obra Social')
    : 'Particular';
  const typeBadge = patient.paymentType === 'obra_social' ? 'badge-blue' : 'badge-amber';

  const cudText = {
    '': 'Sin CUD',
    'vigente': 'CUD Vigente',
    'en_tramite': 'CUD en trámite',
    'vencido': 'CUD Vencido'
  }[patient.cud || ''];

  const cudBadgeClass = {
    '': '',
    'vigente': 'badge-green',
    'en_tramite': 'badge-amber',
    'vencido': 'badge-red'
  }[patient.cud || ''];

  const headerHtml = `
    <div class="app-page-header">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/pacientes')">${Icons.arrowLeft} Volver</button>
      </div>
      <div style="display:flex;gap:0.5rem">
        <button class="btn btn-outline btn-sm" onclick="showEditPatientModal('${id}')">${Icons.edit} Editar ficha</button>
        ${isOwner ? `<button class="btn btn-danger btn-sm" onclick="confirmDeletePatient('${id}')">${Icons.trash}</button>` : ''}
      </div>
    </div>

    <div class="patient-detail-header">
      <div class="patient-detail-avatar patient-avatar--${color}">${getInitials(patient.name)}</div>
      <div class="patient-detail-info">
        <h2>${patient.name}</h2>
        <div class="patient-detail-meta">
          <span class="badge ${typeBadge}">${typeLabel}</span>
          ${patient.cud ? `<span class="badge ${cudBadgeClass}">${cudText}</span>` : ''}
          ${isCommunity ? `<span class="badge badge-dark">Comunidad ${patient.communityCode}</span>` : ''}
        </div>
      </div>
    </div>`;

  const dataHtml = `
    <div class="section-card">
      <div class="section-card-header">
        <h2>${Icons.user} Datos clínicos y administrativos</h2>
      </div>
      <div class="section-card-body">
        <div class="patient-info-grid">
          <div class="patient-info-item">
            <label>DNI</label>
            <span>${patient.dni || 'Sin registrar'}</span>
          </div>
          <div class="patient-info-item">
            <label>Teléfono</label>
            <span>${patient.phone || 'Sin registrar'}</span>
          </div>
          <div class="patient-info-item">
            <label>Email</label>
            <span>${patient.email || 'Sin registrar'}</span>
          </div>
          <div class="patient-info-item">
            <label>Cobertura</label>
            <span>${typeLabel}</span>
          </div>
          <div class="patient-info-item">
            <label>Condición frente al CUD</label>
            <span>${cudText}</span>
          </div>
          <div class="patient-info-item">
            <label>Profesional de alta</label>
            <span>${patient.createdByName || 'Profesional'}</span>
          </div>
        </div>
        ${patient.notes ? `<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border-soft)">
          <label style="font-size:0.72rem;font-weight:700;color:var(--ink-muted);text-transform:uppercase;display:block;margin-bottom:0.35rem">Observaciones iniciales</label>
          <p style="font-size:0.92rem;color:var(--ink-2)">${patient.notes}</p>
        </div>` : ''}
      </div>
    </div>`;

  const sessionsHtml = `
    <div class="section-card">
      <div class="section-card-header">
        <h2>${Icons.fileText} Evoluciones / Qué se hizo en sesión (${allSessions.length})</h2>
        <button class="btn btn-primary btn-sm" onclick="showAddSessionModal('${id}')">${Icons.plus} Nueva evolución</button>
      </div>
      <div class="section-card-body">
        ${allSessions.length > 0
          ? allSessions.map(s => Components.sessionNote(s, isCommunity)).join('')
          : Components.emptyState(Icons.fileText, 'Sin evoluciones cargadas', 'Registrá qué se trabajó en la sesión para llevar un seguimiento claro.')}
      </div>
    </div>`;

  // Private appointments & payments ONLY visible to owner
  let privateApptsHtml = '';
  if (myAppointments.length > 0) {
    const apptRows = myAppointments.slice(0, 6).map(a => `
      <div class="patient-row" onclick="AppAgenda.viewAppointment('${a.id}')">
        <div style="font-family:monospace;font-weight:700;color:var(--green-800);min-width:5.5rem">${DateUtil.formatShort(a.date)}</div>
        <div style="font-family:monospace;font-weight:700;min-width:3.25rem">${a.time}</div>
        <div class="patient-info">
          <div class="patient-name">${a.service || 'Sesión'}</div>
          <div class="patient-detail">${a.amount ? 'Monto privado: $' + a.amount : 'Sin monto registrado'}</div>
        </div>
        <span class="badge ${a.paid ? 'badge-green' : 'badge-amber'}">${a.paid ? 'Pagado' : 'Pendiente'}</span>
      </div>`).join('');

    privateApptsHtml = `
      <div class="section-card">
        <div class="section-card-header">
          <h2>${Icons.lock} Tus turnos y cobros privados (solo vos los ves)</h2>
        </div>
        <div class="patient-list">${apptRows}</div>
      </div>`;
  }

  const app = document.getElementById('app');
  app.innerHTML = Components.appLayout('pacientes', headerHtml + dataHtml + sessionsHtml + privateApptsHtml);
}

function showAddSessionModal(patientId) {
  const modalHtml = Components.modal(
    'Registrar evolución de sesión',
    `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
      <div class="form-group">
        <label class="form-label">Fecha</label>
        <input type="date" id="sessionDate" class="form-input" value="${DateUtil.today()}">
      </div>
      <div class="form-group">
        <label class="form-label">Hora</label>
        <input type="time" id="sessionTime" class="form-input" value="${new Date().toTimeString().slice(0,5)}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">¿Qué se hizo en esta sesión?</label>
      <textarea id="sessionNotes" class="form-input" rows="5" placeholder="Actividades trabajadas, respuesta del paciente, indicaciones para la próxima..."></textarea>
      <span class="form-hint">Esta evolución será visible para los colegas de tu comunidad (sin mostrar cobros).</span>
    </div>
    `,
    `
    <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Cancelar</button>
    <button class="btn btn-primary" onclick="saveSession('${patientId}')">Guardar evolución</button>
    `
  );
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function saveSession(patientId) {
  const user = DB.getUser();
  const notes = document.getElementById('sessionNotes').value.trim();
  if (!notes) { showToast('Escribí la evolución de la sesión', 'error'); return; }

  const session = {
    id: DB.id(),
    patientId,
    date: document.getElementById('sessionDate').value,
    time: document.getElementById('sessionTime').value,
    notes,
    authorId: user.id,
    authorName: `${user.name} (${user.profession || 'Profesional'})`,
    communityCode: user.communityCode,
    createdAt: new Date().toISOString()
  };

  DB.saveSession(session);
  document.querySelector('.modal-overlay').remove();
  showToast('Evolución guardada', 'success');
  renderPatientDetail(patientId);
}

function showEditPatientModal(id) {
  const patient = DB.getPatients().find(p => p.id === id);
  if (!patient) return;

  const modalHtml = Components.modal(
    'Editar ficha del paciente',
    `
    <div class="form-group">
      <label class="form-label">Nombre y apellido</label>
      <input type="text" id="editPatientName" class="form-input" value="${patient.name}">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
      <div class="form-group">
        <label class="form-label">DNI</label>
        <input type="text" id="editPatientDni" class="form-input" value="${patient.dni || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Teléfono (WhatsApp)</label>
        <input type="tel" id="editPatientPhone" class="form-input" value="${patient.phone || ''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Email</label>
      <input type="email" id="editPatientEmail" class="form-input" value="${patient.email || ''}">
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
      <div class="form-group">
        <label class="form-label">Tipo de atención</label>
        <select id="editPatientPaymentType" class="form-select">
          <option value="particular" ${patient.paymentType === 'particular' ? 'selected' : ''}>Particular</option>
          <option value="obra_social" ${patient.paymentType === 'obra_social' ? 'selected' : ''}>Obra Social</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Condición frente al CUD</label>
        <select id="editPatientCud" class="form-select">
          <option value="" ${!patient.cud ? 'selected' : ''}>Sin CUD</option>
          <option value="vigente" ${patient.cud === 'vigente' ? 'selected' : ''}>CUD Vigente</option>
          <option value="en_tramite" ${patient.cud === 'en_tramite' ? 'selected' : ''}>CUD en trámite</option>
          <option value="vencido" ${patient.cud === 'vencido' ? 'selected' : ''}>CUD Vencido</option>
        </select>
      </div>
    </div>
    <div class="form-group" id="editObraSocialGroup" style="${patient.paymentType !== 'obra_social' ? 'display:none' : ''}">
      <label class="form-label">Nombre de la Obra Social</label>
      <input type="text" id="editPatientObraSocial" class="form-input" value="${patient.obraSocial || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">Observaciones</label>
      <textarea id="editPatientNotes" class="form-input">${patient.notes || ''}</textarea>
    </div>
    `,
    `
    <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Cancelar</button>
    <button class="btn btn-primary" onclick="updatePatient('${id}')">Guardar cambios</button>
    `
  );

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.getElementById('editPatientPaymentType').addEventListener('change', function() {
    document.getElementById('editObraSocialGroup').style.display = this.value === 'obra_social' ? '' : 'none';
  });
}

function updatePatient(id) {
  const patient = DB.getPatients().find(p => p.id === id);
  if (!patient) return;

  patient.name = document.getElementById('editPatientName').value.trim() || patient.name;
  patient.dni = document.getElementById('editPatientDni').value.trim();
  patient.phone = document.getElementById('editPatientPhone').value.trim();
  patient.email = document.getElementById('editPatientEmail').value.trim();
  patient.paymentType = document.getElementById('editPatientPaymentType').value;
  patient.obraSocial = document.getElementById('editPatientObraSocial').value.trim();
  patient.cud = document.getElementById('editPatientCud').value;
  patient.notes = document.getElementById('editPatientNotes').value.trim();

  DB.savePatient(patient);
  document.querySelector('.modal-overlay').remove();
  showToast('Ficha actualizada', 'success');
  renderPatientDetail(id);
}

function confirmDeletePatient(id) {
  if (confirm('¿Eliminás este paciente? Esta acción no se puede deshacer.')) {
    DB.deletePatient(id);
    showToast('Paciente eliminado', 'success');
    Router.navigate('/pacientes');
  }
}
