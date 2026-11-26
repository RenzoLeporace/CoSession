/* ===== REUSABLE COMPONENTS – COSESIÓN ===== */
const Components = {
  brandLogo(light = false, onClick = "Router.navigate('/')") {
    return `
      <div class="brand-logo ${light ? 'brand-logo--light' : ''}" onclick="${onClick}">
        ${Icons.logo}
        <div class="brand-logo-text">
          <span class="brand-logo-name">CoSesión</span>
          <span class="brand-logo-tag">Agenda & Comunidad</span>
        </div>
      </div>`;
  },

  modal(title, bodyHtml, footerHtml = '') {
    return `
      <div class="modal-overlay" onclick="if(event.target===this)this.remove()">
        <div class="modal">
          <div class="modal-header">
            <h3>${title}</h3>
            <button onclick="this.closest('.modal-overlay').remove()" class="btn-ghost btn-sm">${Icons.x}</button>
          </div>
          <div class="modal-body">${bodyHtml}</div>
          ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
        </div>
      </div>`;
  },

  stat(icon, value, label, colorClass) {
    return `
      <div class="stat-card">
        <div class="stat-icon stat-icon--${colorClass}">${icon}</div>
        <div>
          <div class="stat-value">${value}</div>
          <div class="stat-label">${label}</div>
        </div>
      </div>`;
  },

  patientRow(patient, showClinicalDetails = true) {
    const color = getAvatarColor(patient.name);
    const initials = getInitials(patient.name);
    const typeLabel = patient.paymentType === 'obra_social' ? (patient.obraSocial ? `O.S. ${patient.obraSocial}` : 'Obra Social') : 'Particular';
    const typeBadge = patient.paymentType === 'obra_social' ? 'badge-blue' : 'badge-amber';
    const cudBadge = showClinicalDetails && patient.cud ? `<span class="badge badge-green">CUD</span>` : '';

    return `
      <div class="patient-row" ${showClinicalDetails ? `onclick="Router.navigate('/paciente/${patient.id}')"` : ''}>
        <div class="patient-avatar patient-avatar--${color}">${initials}</div>
        <div class="patient-info">
          <div class="patient-name">${patient.name}</div>
          <div class="patient-detail">${showClinicalDetails ? `DNI: ${patient.dni || 'Sin registrar'} ${patient.phone ? '· ' + patient.phone : ''}` : 'Datos básicos'}</div>
        </div>
        <div class="patient-badges">
          ${showClinicalDetails ? `<span class="badge ${typeBadge}">${typeLabel}</span>` : ''}
          ${cudBadge}
        </div>
      </div>`;
  },

  appointmentEvent(appt) {
    const patient = DB.getPatients().find(p => p.id === appt.patientId);
    const name = patient ? patient.name : 'Paciente';
    const typeClass = appt.paymentType === 'obra_social' ? 'agenda-event--os' : 'agenda-event--particular';
    const typeLabel = appt.paymentType === 'obra_social' ? 'Obra Social' : 'Particular';
    const paidBadge = appt.paid ? `<span class="badge badge-green">Pagado</span>` : `<span class="badge badge-amber">Pendiente</span>`;

    return `
      <div class="agenda-event ${typeClass}" onclick="event.stopPropagation(); AppAgenda.viewAppointment('${appt.id}')">
        <div>
          <div class="agenda-event-name">${name}</div>
          <div class="agenda-event-detail">${appt.service || 'Sesión'} · ${typeLabel}</div>
        </div>
        ${paidBadge}
      </div>`;
  },

  sessionNote(session, showAuthor = false) {
    const dateStr = DateUtil.formatShort(session.date);
    const authorInfo = showAuthor
      ? `<span class="session-note-author">${Icons.user} ${session.authorName || 'Profesional'}</span>`
      : '';

    return `
      <div class="session-note">
        <div class="session-note-header">
          <span class="session-note-date">${dateStr} · ${session.time || ''}</span>
          ${authorInfo}
        </div>
        <div class="session-note-body">${session.notes || 'Sin notas'}</div>
      </div>`;
  },

  emptyState(icon, title, description, buttonText = '', buttonAction = '') {
    const btn = buttonText ? `<button class="btn btn-primary btn-sm" onclick="${buttonAction}">${buttonText}</button>` : '';
    return `
      <div class="empty-state">
        ${icon}
        <h3>${title}</h3>
        <p>${description}</p>
        ${btn}
      </div>`;
  },

  appLayout(activeSection, content) {
    const user = DB.getUser();
    if (!user) { Router.navigate('/entrar'); return ''; }

    const links = [
      { id: 'inicio', icon: Icons.home, label: 'Resumen', path: '/app' },
      ...(DB.can('manage_agenda', user) ? [{ id: 'agenda', icon: Icons.calendar, label: 'Agenda', path: '/agenda' }] : []),
      ...(DB.can('manage_patients', user) || DB.can('view_patients', user) || DB.can('view_clinical', user)
        ? [{ id: 'pacientes', icon: Icons.users, label: 'Pacientes', path: '/pacientes' }]
        : []),
      { id: 'comunidad', icon: Icons.community, label: 'Comunidad', path: '/comunidad' },
    ];

    const topTabsHtml = links.map(l =>
      `<button class="app-nav-tab ${activeSection === l.id ? 'active' : ''}" onclick="Router.navigate('${l.path}')">${l.icon} ${l.label}</button>`
    ).join('');

    const bottomTabsHtml = links.map(l =>
      `<button class="app-bottom-item ${activeSection === l.id ? 'active' : ''}" onclick="Router.navigate('${l.path}')">${l.icon}<span>${l.label}</span></button>`
    ).join('');

    return `
      <div class="app-shell">
        <header class="app-navbar">
          <div class="app-navbar-inner">
            ${Components.brandLogo(true, "Router.navigate('/app')")}
            <nav class="app-nav-tabs">${topTabsHtml}</nav>
            <div class="app-nav-right">
              <button class="app-install-btn" onclick="showInstallAppModal()" title="Instalar en celular">
                ${Icons.smartphone} <span>App</span>
              </button>
              <div class="app-user-chip" onclick="handleLogout()" title="Cerrar sesión">
                <div class="app-user-avatar">${getInitials(user.name)}</div>
                <div class="app-user-meta">
                  <span class="app-user-name">${user.name}</span>
                  <span class="app-user-role">${user.profession || 'Profesional'} · ${user.communityRole || 'Individual'}</span>
                </div>
                ${Icons.logout}
              </div>
            </div>
          </div>
        </header>

        <main class="app-page-wrap">
          ${content}
        </main>

        <nav class="app-bottom-nav">${bottomTabsHtml}</nav>
      </div>`;
  }
};

function showInstallAppModal() {
  const modalHtml = Components.modal(
    'Instalar CoSesión en tu celular',
    `
    <p style="font-size:0.92rem;color:var(--ink-2)">Podés usar CoSesión como una aplicación directa desde la pantalla de inicio de tu teléfono, sin descargar nada de la tienda:</p>
    <div style="background:var(--green-50);padding:1rem;border-radius:var(--r-md);border:1px solid var(--border-card)">
      <strong style="color:var(--green-900);display:block;margin-bottom:0.35rem">En Android (Chrome):</strong>
      <span style="font-size:0.86rem;color:var(--ink-2)">Tocá los 3 puntitos arriba a la derecha → <strong>"Agregar a pantalla principal"</strong> o <strong>"Instalar aplicación"</strong>.</span>
    </div>
    <div style="background:var(--bg-page);padding:1rem;border-radius:var(--r-md);border:1px solid var(--border-card)">
      <strong style="color:var(--green-900);display:block;margin-bottom:0.35rem">En iPhone (Safari):</strong>
      <span style="font-size:0.86rem;color:var(--ink-2)">Tocá el botón <strong>Compartir</strong> abajo → <strong>"Agregar a inicio"</strong>.</span>
    </div>
    `,
    `<button class="btn btn-primary btn-sm" onclick="document.querySelector('.modal-overlay').remove()">Entendido</button>`
  );
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

async function handleLogout() {
  if (confirm('¿Querés cerrar sesión?')) {
    try {
      await DB.logout();
      Router.navigate('/');
    } catch (error) {
      showToast(error.message || 'No se pudo cerrar la sesión de forma segura', 'error');
    }
  }
}
