/* ===== DASHBOARD – COSESIÓN ===== */
function renderDashboard() {
  const user = DB.getUser();
  if (!user) { Router.navigate('/entrar'); return; }

  const patients = DB.getPatients().filter(p => p.createdBy === user.id || p.communityCode === user.communityCode);
  const myAppts = DB.getAppointments().filter(a => a.createdBy === user.id);
  const todayAppts = myAppts.filter(a => a.date === DateUtil.today());
  const sessions = DB.getSessions();

  const osCount = patients.filter(p => p.paymentType === 'obra_social').length;
  const partCount = patients.filter(p => p.paymentType === 'particular').length;
  const cudCount = patients.filter(p => p.cud === 'vigente' || p.cud === 'en_tramite').length;

  const headerHtml = `
    <div class="app-page-header">
      <div>
        <h1>Hola, ${user.name.split(' ')[0]}</h1>
        <p class="app-page-subtitle">${DateUtil.format(DateUtil.today())} · ${user.profession || 'Profesional'} · Comunidad ${user.communityCode || 'INTEGRARTE'}</p>
      </div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="showAddPatientModal()">${Icons.plus} Paciente</button>
        <button class="btn btn-primary btn-sm" onclick="Router.navigate('/agenda')">${Icons.calendar} Agendar turno</button>
      </div>
    </div>`;

  const statsHtml = `
    <div class="stats-grid">
      ${Components.stat(Icons.users, patients.length, 'Pacientes en espacio', 'green')}
      ${Components.stat(Icons.calendar, todayAppts.length, 'Tus turnos de hoy', 'dark')}
      ${Components.stat(Icons.shield, `${osCount} O.S. · ${partCount} Part.`, 'Obra Social / Particular', 'blue')}
      ${Components.stat(Icons.fileText, `${cudCount} con CUD · ${sessions.length} notas`, 'CUD y evoluciones', 'amber')}
    </div>`;

  let todayHtml = '';
  if (todayAppts.length > 0) {
    const apptRows = todayAppts
      .sort((a, b) => a.time.localeCompare(b.time))
      .map(a => {
        const p = patients.find(x => x.id === a.patientId);
        const name = p ? p.name : 'Paciente';
        const typeClass = a.paymentType === 'obra_social' ? 'badge-blue' : 'badge-amber';
        const typeLabel = a.paymentType === 'obra_social' ? 'Obra Social' : 'Particular';
        return `
          <div class="patient-row" onclick="Router.navigate('/paciente/${a.patientId}')">
            <div style="font-family:monospace;font-weight:800;font-size:1rem;color:var(--green-800);min-width:3.5rem">${a.time}</div>
            <div class="patient-info">
              <div class="patient-name">${name}</div>
              <div class="patient-detail">${a.service || 'Sesión'}</div>
            </div>
            <div class="patient-badges">
              <span class="badge ${typeClass}">${typeLabel}</span>
              <span class="badge ${a.paid ? 'badge-green' : 'badge-amber'}">${a.paid ? 'Pagado' : 'Pendiente'}</span>
            </div>
          </div>`;
      }).join('');
    todayHtml = `
      <div class="section-card">
        <div class="section-card-header">
          <h2>${Icons.clock} Turnos de hoy</h2>
          <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/agenda')">Ver agenda completa</button>
        </div>
        <div class="patient-list">${apptRows}</div>
      </div>`;
  } else {
    todayHtml = `
      <div class="section-card">
        <div class="section-card-header">
          <h2>${Icons.clock} Turnos de hoy</h2>
          <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/agenda')">Ir a Agenda</button>
        </div>
        <div class="section-card-body">
          ${Components.emptyState(Icons.calendar, 'Sin turnos para hoy', 'Agendá en el horario exacto que necesitás (ej. 16:20).', 'Agendar turno', "Router.navigate('/agenda')")}
        </div>
      </div>`;
  }

  let recentHtml = '';
  const recentPatients = patients.slice(-5).reverse();
  if (recentPatients.length > 0) {
    recentHtml = `
      <div class="section-card">
        <div class="section-card-header">
          <h2>${Icons.users} Pacientes recientes</h2>
          <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/pacientes')">Ver todos</button>
        </div>
        <div class="patient-list">
          ${recentPatients.map(p => Components.patientRow(p)).join('')}
        </div>
      </div>`;
  }

  const app = document.getElementById('app');
  app.innerHTML = Components.appLayout('inicio', headerHtml + statsHtml + todayHtml + recentHtml);
}
