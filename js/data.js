/* ===== DATA LAYER (LocalStorage – CoSesión) ===== */
const COMMUNITY_ROLES = {
  Coordinador: {
    manage_members: true,
    manage_roles: true,
    manage_patients: true,
    view_clinical: true,
    edit_clinical: true,
    manage_agenda: true
  },
  Profesional: {
    manage_patients: true,
    view_clinical: true,
    edit_clinical: true,
    manage_agenda: true
  },
  Analista: {
    view_clinical: true
  },
  Recepcionista: {
    manage_agenda: true,
    manage_patients: true
  },
  Observador: {
    view_patients: true
  }
};

function escapeHTML(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

const DB = {
  _activeUserId: null,
  _encryptionKey: null,
  _vault: { patients: [], sessions: [], appointments: [] },
  _persisting: Promise.resolve(),

  _get(key) {
    try { return JSON.parse(localStorage.getItem('cosesion_' + key)) || null; }
    catch { return null; }
  },
  _set(key, val) {
    localStorage.setItem('cosesion_' + key, JSON.stringify(val));
  },

  _crypto() {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Este navegador no permite cifrado seguro. Abrí CoSesión desde HTTPS o localhost.');
    }
    return window.crypto.subtle;
  },

  _toBase64(bytes) {
    const data = new Uint8Array(bytes);
    let binary = '';
    for (let offset = 0; offset < data.length; offset += 0x8000) {
      binary += String.fromCharCode(...data.subarray(offset, offset + 0x8000));
    }
    return btoa(binary);
  },

  async _deriveKey(password, salt) {
    const subtle = this._crypto();
    const material = await subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
      material,
      512
    );
    const derivedBytes = new Uint8Array(bits);
    return {
      hash: this._toBase64(derivedBytes.slice(0, 32)),
      key: await subtle.importKey('raw', derivedBytes.slice(32), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
    };
  },

  async _encrypt(value, key) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await this._crypto().encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(JSON.stringify(value))
    );
    return { iv: this._toBase64(iv), data: this._toBase64(ciphertext) };
  },

  async _decrypt(encrypted, key) {
    const decode = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));
    const plaintext = await this._crypto().decrypt(
      { name: 'AES-GCM', iv: decode(encrypted.iv) },
      key,
      decode(encrypted.data)
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
  },

  async initialize() {
    const users = this._get('users') || [];
    const hasLegacyData = ['patients', 'sessions', 'appointments']
      .some(key => localStorage.getItem(`cosesion_${key}`));
    const legacyUsers = users.filter(user => typeof user.password === 'string' && !user.passwordHash);

    if (hasLegacyData && (legacyUsers.length !== users.length || !legacyUsers.length)) {
      throw new Error('Hay datos clínicos antiguos que no se pueden migrar sin la contraseña original de cada cuenta.');
    }

    const userIds = new Set(users.map(user => user.id));
    const legacyPatients = this._get('patients') || [];
    const legacySessions = this._get('sessions') || [];
    const legacyAppointments = this._get('appointments') || [];
    const patientIds = new Set(legacyPatients.map(patient => patient.id));
    if (legacyPatients.some(patient => !userIds.has(patient.createdBy)) ||
        legacySessions.some(session => !patientIds.has(session.patientId)) ||
        legacyAppointments.some(appointment => !userIds.has(appointment.createdBy))) {
      throw new Error('Hay datos clínicos sin una cuenta propietaria identificable. No se modificaron para evitar perderlos.');
    }

    for (const user of legacyUsers) {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const credentials = await this._deriveKey(user.password, salt);
      user.passwordHash = credentials.hash;
      user.passwordSalt = this._toBase64(salt);
      delete user.password;

      const patients = legacyPatients.filter(patient => patient.createdBy === user.id);
      const ownedPatientIds = new Set(patients.map(patient => patient.id));
      const vault = {
        patients,
        sessions: legacySessions.filter(session => ownedPatientIds.has(session.patientId)),
        appointments: legacyAppointments.filter(appointment => appointment.createdBy === user.id)
      };
      this._set(`vault_${user.id}`, await this._encrypt(vault, credentials.key));
    }

    if (legacyUsers.length) {
      this._set('users', users);
      ['patients', 'sessions', 'appointments'].forEach(key => localStorage.removeItem(`cosesion_${key}`));
      const oldCurrentUser = this._get('currentUser');
      if (oldCurrentUser && oldCurrentUser.id) this._set('currentUser', oldCurrentUser.id);
    }

    const legacyCommunity = this._get('community');
    let communities = this._get('communities') || [];
    if (!communities.length && (legacyCommunity || users.some(user => user.communityCode))) {
      const code = (legacyCommunity && legacyCommunity.code) || users.find(user => user.communityCode)?.communityCode;
      if (code) {
        const members = users.filter(user => user.communityCode === code);
        const community = {
          id: (legacyCommunity && legacyCommunity.id) || this.id(),
          code,
          name: (legacyCommunity && legacyCommunity.name) || code,
          createdBy: members[0] ? members[0].id : null,
          members: members.map((user, index) => ({
            userId: user.id,
            role: index === 0 ? 'Coordinador' : 'Profesional',
            status: 'approved',
            joinedAt: new Date().toISOString()
          })),
          requests: []
        };
        communities = [community];
        this._set('communities', communities);
        members.forEach((user, index) => {
          user.communityId = community.id;
          user.communityRole = index === 0 ? 'Coordinador' : 'Profesional';
          user.communityStatus = 'approved';
        });
        this._set('users', users);
      }
    }
  },

  getLockedUser() {
    const selected = this._get('currentUser');
    const id = typeof selected === 'string' ? selected : selected && selected.id;
    return (this._get('users') || []).find(user => user.id === id) || null;
  },

  getUser() {
    if (!this._activeUserId || !this._encryptionKey) return null;
    return (this._get('users') || []).find(user => user.id === this._activeUserId) || null;
  },

  async unlockUser(user, password) {
    const salt = Uint8Array.from(atob(user.passwordSalt), char => char.charCodeAt(0));
    const credentials = await this._deriveKey(password, salt);
    if (credentials.hash !== user.passwordHash) return false;

    const encryptedVault = this._get(`vault_${user.id}`);
    const vault = encryptedVault
      ? await this._decrypt(encryptedVault, credentials.key)
      : { patients: [], sessions: [], appointments: [] };
    this._activeUserId = user.id;
    this._encryptionKey = credentials.key;
    this._vault = vault;
    this._set('currentUser', user.id);
    return true;
  },

  async createCredentials(password) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const credentials = await this._deriveKey(password, salt);
    return { passwordSalt: this._toBase64(salt), passwordHash: credentials.hash, key: credentials.key };
  },

  async activateUser(user, key) {
    this._activeUserId = user.id;
    this._encryptionKey = key;
    this._vault = { patients: [], sessions: [], appointments: [] };
    this._set('currentUser', user.id);
    await this._saveVault();
  },

  setUser(u) { this._activeUserId = u.id; },
  lock() {
    this._activeUserId = null;
    this._encryptionKey = null;
    this._vault = { patients: [], sessions: [], appointments: [] };
  },
  async logout() {
    await this._persisting;
    localStorage.removeItem('cosesion_currentUser');
    this.lock();
  },

  getUsers() { return this._get('users') || []; },
  saveUser(user) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id || u.email === user.email);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
    this._set('users', users);
  },

  can(permission, user = this.getUser()) {
    if (!user) return false;
    if (user.communityStatus !== 'approved') {
      return ['manage_patients', 'view_patients', 'view_clinical', 'edit_clinical', 'manage_agenda'].includes(permission);
    }
    return Boolean((COMMUNITY_ROLES[user.communityRole] || {})[permission]);
  },

  requirePermission(permission) {
    if (!this.getUser()) {
      Router.navigate('/entrar');
      return false;
    }
    if (!this.can(permission)) {
      showToast('Tu rol no tiene permiso para esta acción', 'error');
      Router.navigate('/app');
      return false;
    }
    return true;
  },

  getCommunities() { return this._get('communities') || []; },
  getCommunity(code) {
    const user = this.getUser();
    const communities = this.getCommunities();
    return code
      ? communities.find(community => community.code.toUpperCase() === code.toUpperCase()) || null
      : communities.find(community => community.id === (user && user.communityId)) || null;
  },
  saveCommunity(community) {
    const communities = this.getCommunities();
    const index = communities.findIndex(item => item.id === community.id);
    if (index >= 0) communities[index] = community;
    else communities.push(community);
    this._set('communities', communities);
  },

  async _saveVault() {
    if (!this._encryptionKey || !this._activeUserId) throw new Error('Iniciá sesión para guardar datos cifrados.');
    this._set(`vault_${this._activeUserId}`, await this._encrypt(this._vault, this._encryptionKey));
  },

  async _updateVault(update) {
    const previous = this._persisting;
    let release;
    this._persisting = new Promise(resolve => { release = resolve; });
    await previous;
    try {
      if (!this._encryptionKey || !this._activeUserId) throw new Error('Iniciá sesión para guardar datos cifrados.');
      const next = JSON.parse(JSON.stringify(this._vault));
      update(next);
      const encrypted = await this._encrypt(next, this._encryptionKey);
      this._set(`vault_${this._activeUserId}`, encrypted);
      this._vault = next;
    } finally {
      release();
    }
  },

  getPatients() { return this._vault.patients; },
  async savePatient(patient) {
    await this._updateVault(vault => {
      const index = vault.patients.findIndex(item => item.id === patient.id);
      if (index >= 0) vault.patients[index] = patient;
      else vault.patients.push(patient);
    });
  },
  async deletePatient(id) {
    await this._updateVault(vault => {
      vault.patients = vault.patients.filter(patient => patient.id !== id);
      vault.sessions = vault.sessions.filter(session => session.patientId !== id);
      vault.appointments = vault.appointments.filter(appointment => appointment.patientId !== id);
    });
  },

  getSessions() { return this._vault.sessions; },
  async saveSession(session) {
    await this._updateVault(vault => {
      const index = vault.sessions.findIndex(item => item.id === session.id);
      if (index >= 0) vault.sessions[index] = session;
      else vault.sessions.push(session);
    });
  },
  getSessionsByPatient(patientId) { return this._vault.sessions.filter(session => session.patientId === patientId); },

  getAppointments() { return this._vault.appointments; },
  async saveAppointment(appointment) {
    await this._updateVault(vault => {
      const index = vault.appointments.findIndex(item => item.id === appointment.id);
      if (index >= 0) vault.appointments[index] = appointment;
      else vault.appointments.push(appointment);
    });
  },
  async deleteAppointment(id) {
    await this._updateVault(vault => {
      vault.appointments = vault.appointments.filter(appointment => appointment.id !== id);
    });
  },
  getAppointmentsByDate(dateStr) { return this._vault.appointments.filter(appointment => appointment.date === dateStr); },

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
