/* ===== DATA LAYER (LocalStorage – CoSesión) ===== */
const DB = {
  _get(key) {
    try { return JSON.parse(localStorage.getItem('cosesion_' + key)) || null; }
    catch { return null; }
  },
  _set(key, val) {
    localStorage.setItem('cosesion_' + key, JSON.stringify(val));
  },

  getUser() { return this._get('currentUser'); },
  setUser(u) { this._set('currentUser', u); },
  logout() { localStorage.removeItem('cosesion_currentUser'); },

  getUsers() { return this._get('users') || []; },
  saveUser(user) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    this._set('users', users);
  },

  getPatients() { return this._get('patients') || []; },
  savePatient(p) {
    const patients = this.getPatients();
    const idx = patients.findIndex(x => x.id === p.id);
    if (idx >= 0) patients[idx] = p;
    else patients.push(p);
    this._set('patients', patients);
  },
  deletePatient(id) {
    this._set('patients', this.getPatients().filter(p => p.id !== id));
  },

  getSessions() { return this._get('sessions') || []; },
  saveSession(s) {
    const sessions = this.getSessions();
    const idx = sessions.findIndex(x => x.id === s.id);
    if (idx >= 0) sessions[idx] = s;
    else sessions.push(s);
    this._set('sessions', sessions);
  },
  getSessionsByPatient(patientId) {
    return this.getSessions().filter(s => s.patientId === patientId);
  },

  getAppointments() { return this._get('appointments') || []; },
  saveAppointment(a) {
    const appts = this.getAppointments();
    const idx = appts.findIndex(x => x.id === a.id);
    if (idx >= 0) appts[idx] = a;
    else appts.push(a);
    this._set('appointments', appts);
  },
  deleteAppointment(id) {
    this._set('appointments', this.getAppointments().filter(a => a.id !== id));
  },
  getAppointmentsByDate(dateStr) {
    return this.getAppointments().filter(a => a.date === dateStr);
  },

  getCommunity() { return this._get('community') || null; },
  setCommunity(c) { this._set('community', c); },

  id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
};

const Icons = {
  logo: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0E2E20"/><circle cx="39" cy="50" r="19" fill="none" stroke="#34D399" stroke-width="8"/><circle cx="61" cy="50" r="19" fill="none" stroke="#A7F3D0" stroke-width="8"/><circle cx="50" cy="50" r="6" fill="#FFFFFF"/></svg>`,
  calendar: `<svg class="icon" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  users: `<svg class="icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  user: `<svg class="icon" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  home: `<svg class="icon" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  bell: `<svg class="icon" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  clipboard: `<svg class="icon" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>`,
  wallet: `<svg class="icon" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>`,
  community: `<svg class="icon" viewBox="0 0 24 24"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></svg>`,
  logout: `<svg class="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
  plus: `<svg class="icon" viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>`,
  search: `<svg class="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>`,
  check: `<svg class="icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCircle: `<svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  x: `<svg class="icon" viewBox="0 0 24 24"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`,
  chevronLeft: `<svg class="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevronRight: `<svg class="icon" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`,
  arrowLeft: `<svg class="icon" viewBox="0 0 24 24"><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  edit: `<svg class="icon" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg class="icon" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  eye: `<svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg class="icon" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" x2="23" y1="1" y2="23"/></svg>`,
  fileText: `<svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>`,
  clock: `<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  mail: `<svg class="icon" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  phone: `<svg class="icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  shield: `<svg class="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  lock: `<svg class="icon" viewBox="0 0 24 24"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  copy: `<svg class="icon" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  smartphone: `<svg class="icon" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>`,
  send: `<svg class="icon" viewBox="0 0 24 24"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
};

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

const DateUtil = {
  format(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
  },
  today() { return new Date().toISOString().split('T')[0]; },
  addDays(dateStr, n) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  },
  formatShort(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }
};

const avatarColors = ['green', 'teal', 'blue', 'amber'];
function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
function getInitials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
