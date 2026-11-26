/* ===== AGENDA – COSESIÓN (HORARIOS LIBRES AL MINUTO + RECORDATORIOS + COBROS PRIVADOS) ===== */
const AppAgenda = {
  currentDate: DateUtil.today(),

  render() {
    const user = DB.getUser();
    if (!user) { Router.navigate('/entrar'); return; }

    this.currentDate = this.currentDate || DateUtil.today();
    const appointments = DB.getAppointmentsByDate(this.currentDate).filter(a => a.createdBy === user.id);

    const headerHtml = `
      <div class="app-page-header">
        <div>
          <h1>Agenda</h1>
          <p class="app-page-subtitle">Agendá en cualquier horario exacto (ej. 16:20). Tus turnos y cobros son privados.</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="AppAgenda.showAddAppointment()">${Icons.plus} Nuevo turno</button>
      </div>`;

    const dayNavHtml = `
      <div class="agenda-toolbar">
        <div class="agenda-date-title">${DateUtil.format(this.currentDate)}</div>
        <div class="agenda-nav">
          <button onclick="AppAgenda.prevDay()" title="Día anterior">${Icons.chevronLeft}</button>
          <button onclick="AppAgenda.goToday()">Hoy</button>
          <button onclick="AppAgenda.nextDay()" title="Día siguiente">${Icons.chevronRight}</button>
        </div>
      </div>`;

    const apptMap = {};
    appointments.forEach(a => {
      if (!apptMap[a.time]) apptMap[a.time] = [];
      apptMap[a.time].push(a);
    });

    const displayTimes = new Set();
    for (let h = 8; h <= 20; h++) {
      displayTimes.add(`${String(h).padStart(2,'0')}:00`);
      displayTimes.add(`${String(h).padStart(2,'0')}:30`);
    }
    appointments.forEach(a => displayTimes.add(a.time));

    const sortedTimes = Array.from(displayTimes).sort();

    const slotsHtml = sortedTimes.map(time => {
      const appts = apptMap[time] || [];
      const eventsHtml = appts.map(a => Components.appointmentEvent(a)).join('');
      const isCustomTime = !time.endsWith(':00') && !time.endsWith(':30');

      return `
        <div class="agenda-slot">
          <div class="agenda-slot-time ${isCustomTime ? 'agenda-slot-time--custom' : ''}">${time}</div>
          <div class="agenda-slot-content" onclick="AppAgenda.showAddAppointment('${time}')">
            ${eventsHtml}
          </div>
        </div>`;
    }).join('');

    const contentHtml = `
      ${headerHtml}
      ${dayNavHtml}
      <div class="section-card">
        <div class="agenda-slots">${slotsHtml}</div>
      </div>`;

    const app = document.getElementById('app');
    app.innerHTML = Components.appLayout('agenda', contentHtml);
  },

  prevDay() { this.currentDate = DateUtil.addDays(this.currentDate, -1); this.render(); },
  nextDay() { this.currentDate = DateUtil.addDays(this.currentDate, 1); this.render(); },
  goToday() { this.currentDate = DateUtil.today(); this.render(); },

  showAddAppointment(defaultTime = '') {
    const user = DB.getUser();
    const patients = DB.getPatients().filter(p => p.createdBy === user.id || p.communityCode === user.communityCode);

    if (patients.length === 0) {
      showToast('Primero cargá al menos un paciente', 'info');
      Router.navigate('/pacientes');
      return;
    }

    const patientOptions = patients.map(p =>
      `<option value="${p.id}">${p.name} (${p.paymentType === 'obra_social' ? 'O.S.' : 'Particular'})</option>`
    ).join('');

    const modalHtml = Components.modal(
      'Agendar nuevo turno',
      `
      <div class="form-group">
        <label class="form-label">Paciente</label>
        <select id="apptPatient" class="form-select" onchange="AppAgenda.onPatientSelect()">
          <option value="">Seleccionar paciente...</option>
          ${patientOptions}
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
        <div class="form-group">
          <label class="form-label">Fecha</label>
          <input type="date" id="apptDate" class="form-input" value="${this.currentDate}">
        </div>
        <div class="form-group">
          <label class="form-label">Hora exacta (al minuto)</label>
          <input type="time" id="apptTime" class="form-input" value="${defaultTime || '16:20'}" step="60">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de sesión / Servicio</label>
        <input type="text" id="apptService" class="form-input" placeholder="Ej: Sesión psicopedagógica, Evaluación...">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
        <div class="form-group">
          <label class="form-label">Cobertura</label>
          <select id="apptPaymentType" class="form-select">
            <option value="particular">Particular</option>
            <option value="obra_social">Obra Social</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Monto privado ($)</label>
          <input type="number" id="apptAmount" class="form-input" placeholder="Opcional (privado)">
        </div>
      </div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.88rem;font-weight:600;color:var(--ink-2)">
          <input type="checkbox" id="apptPaid"> Ya está pagado
        </label>
      </div>
      `,
      `
      <button class="btn btn-ghost" onclick="document.querySelector('.modal-overlay').remove()">Cancelar</button>
      <button class="btn btn-primary" onclick="AppAgenda.saveAppointment()">Guardar turno</button>
      `
    );

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  onPatientSelect() {
    const patientId = document.getElementById('apptPatient').value;
    if (patientId) {
      const patient = DB.getPatients().find(p => p.id === patientId);
      if (patient) document.getElementById('apptPaymentType').value = patient.paymentType;
    }
  },

  saveAppointment() {
    const patientId = document.getElementById('apptPatient').value;
    if (!patientId) { showToast('Seleccioná un paciente', 'error'); return; }

    const user = DB.getUser();
    const appointment = {
      id: DB.id(),
      patientId,
      date: document.getElementById('apptDate').value,
      time: document.getElementById('apptTime').value,
      service: document.getElementById('apptService').value.trim(),
      paymentType: document.getElementById('apptPaymentType').value,
      amount: document.getElementById('apptAmount').value.trim(),
      paid: document.getElementById('apptPaid').checked,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    DB.saveAppointment(appointment);
    document.querySelector('.modal-overlay').remove();
    showToast(`Turno agendado a las ${appointment.time}`, 'success');
    this.render();
  },

  viewAppointment(id) {
    const appt = DB.getAppointments().find(a => a.id === id);
    if (!appt) return;

    const patient = DB.getPatients().find(p => p.id === appt.patientId);
    const name = patient ? patient.name : 'Paciente';
    const typeLabel = appt.paymentType === 'obra_social' ? 'Obra Social' : 'Particular';

    const reminderMsg = encodeURIComponent(
      `Hola ${name}, te recordamos tu sesión el ${DateUtil.format(appt.date)} a las ${appt.time} hs. ¡Te esperamos!`
    );
    const waLink = patient && patient.phone
      ? `https://wa.me/${patient.phone.replace(/\D/g, '')}?text=${reminderMsg}`
      : `https://wa.me/?text=${reminderMsg}`;
    const mailLink = patient && patient.email
      ? `mailto:${patient.email}?subject=${encodeURIComponent('Recordatorio de sesión')}&body=${reminderMsg}`
      : `mailto:?subject=${encodeURIComponent('Recordatorio de sesión')}&body=${reminderMsg}`;

    const modalHtml = Components.modal(
      'Detalle del turno',
      `
      <div class="patient-info-grid">
        <div class="patient-info-item"><label>Paciente</label><span>${name}</span></div>
        <div class="patient-info-item"><label>Fecha y hora</label><span>${DateUtil.formatShort(appt.date)} · ${appt.time}</span></div>
        <div class="patient-info-item"><label>Servicio</label><span>${appt.service || 'Sesión'}</span></div>
        <div class="patient-info-item"><label>Cobertura</label><span>${typeLabel}</span></div>
        <div class="patient-info-item"><label>Estado de cobro (privado)</label><span>${appt.paid ? 'Pagado ✓' : 'Pendiente'}${appt.amount ? ' · $' + appt.amount : ''}</span></div>
      </div>

      <div style="background:var(--green-50);padding:1rem;border-radius:var(--r-md);border:1px solid var(--border-card)">
        <div style="font-size:0.82rem;font-weight:700;color:var(--green-900);margin-bottom:0.5rem">Enviar recordatorio al paciente</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">${Icons.phone} WhatsApp</a>
          <a href="${mailLink}" class="btn btn-outline btn-sm">${Icons.mail} Email</a>
        </div>
      </div>
      `,
      `
      <button class="btn btn-danger btn-sm" onclick="AppAgenda.deleteAppointment('${id}')">Eliminar</button>
      <button class="btn btn-outline btn-sm" onclick="AppAgenda.togglePaid('${id}')">${appt.paid ? 'Marcar pendiente' : 'Marcar pagado'}</button>
      ${patient ? `<button class="btn btn-primary btn-sm" onclick="document.querySelector('.modal-overlay').remove(); Router.navigate('/paciente/${patient.id}')">Ver ficha</button>` : ''}
      `
    );
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  togglePaid(id) {
    const appt = DB.getAppointments().find(a => a.id === id);
    if (!appt) return;
    appt.paid = !appt.paid;
    DB.saveAppointment(appt);
    document.querySelector('.modal-overlay').remove();
    showToast(appt.paid ? 'Cobro registrado (privado)' : 'Marcado como pendiente', 'success');
    if (Router.currentRoute === '/agenda') this.render();
    else if (Router.currentRoute.startsWith('/paciente/')) renderPatientDetail(appt.patientId);
  },

  deleteAppointment(id) {
    DB.deleteAppointment(id);
    document.querySelector('.modal-overlay').remove();
    showToast('Turno eliminado', 'success');
    this.render();
  }
};
