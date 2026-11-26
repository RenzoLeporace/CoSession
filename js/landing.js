/* ===== COSESIÓN LANDING PAGE – ORIGINAL BOTANICAL DESIGN ===== */
let activeDemoTab = 'agenda';

function renderLanding() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="cs-landing">
      <!-- Forest Green Hero Zone -->
      <section class="cs-hero-zone">
        <div class="container">
          <header class="cs-topbar">
            ${Components.brandLogo(true, "Router.navigate('/')")}
            <nav class="cs-topbar-links">
              <a href="#funciones">Herramientas</a>
              <a href="#comunidad">Comunidad</a>
              <a href="#acceso">Cómo empezar</a>
            </nav>
            <div class="cs-topbar-actions">
              <button class="btn btn-outline-light btn-sm" onclick="Router.navigate('/entrar')">Ingresar</button>
              <button class="btn btn-mint btn-sm" onclick="Router.navigate('/crear-cuenta')">Crear cuenta</button>
            </div>
          </header>

          <div class="cs-hero-grid">
            <div>
              <div class="cs-kicker">
                ${Icons.community}
                Para psicopedagogos, psicólogos y centros interdisciplinarios
              </div>
              <h1 class="cs-hero-title">
                Cohesión para tu equipo, <span class="serif-em">claridad</span> en cada sesión.
              </h1>
              <p class="cs-hero-desc">
                Agendá en el horario exacto que atendés (como 16:20), distinguí pacientes de Obra Social o Particular, registrá su CUD y compartí evoluciones clínicas con tu centro manteniendo tus cobros 100% privados.
              </p>
              <div class="cs-hero-cta">
                <button class="btn btn-mint" onclick="Router.navigate('/crear-cuenta')">Empezar gratis ahora</button>
                <button class="btn btn-outline-light" onclick="Router.navigate('/entrar')">Ya tengo cuenta</button>
              </div>
              <div class="cs-hero-tags">
                <span>${Icons.check} Horarios al minuto</span>
                <span>${Icons.check} Código de centro (ej. INTEGRARTE)</span>
                <span>${Icons.check} Instalable en celular</span>
              </div>
            </div>

            <!-- Interactive Live Tabbed Showcase -->
            <div class="cs-demo-shell">
              <div class="cs-demo-tabs">
                <button class="cs-demo-tab ${activeDemoTab === 'agenda' ? 'active' : ''}" onclick="switchHeroTab('agenda', this)">1. Turno exacto</button>
                <button class="cs-demo-tab ${activeDemoTab === 'ficha' ? 'active' : ''}" onclick="switchHeroTab('ficha', this)">2. Ficha y CUD</button>
                <button class="cs-demo-tab ${activeDemoTab === 'comunidad' ? 'active' : ''}" onclick="switchHeroTab('comunidad', this)">3. Comunidad</button>
              </div>
              <div class="cs-demo-screen" id="heroDemoScreen">
                ${renderHeroDemoScreen(activeDemoTab)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6-Feature Clean Grid -->
      <section class="cs-section" id="funciones">
        <div class="container">
          <div class="cs-section-head cs-section-head--center">
            <div class="cs-eyebrow">Pensado para el consultorio real</div>
            <h2>Lo justo y necesario para trabajar ordenado</h2>
            <p>Sin pantallas recargadas. Cada herramienta resuelve un problema concreto del día a día en el centro.</p>
          </div>

          <div class="cs-feat-grid">
            <article class="cs-feat-card">
              <div class="cs-feat-icon">${Icons.clock}</div>
              <h3>Horarios libres al minuto</h3>
              <p>¿Tenés un paciente a las 16:20 o 17:45? Agendá cualquier minuto exacto, sin atarte a bloques rígidos cada 30 minutos.</p>
            </article>

            <article class="cs-feat-card">
              <div class="cs-feat-icon">${Icons.user}</div>
              <h3>Hecho para tu especialidad</h3>
              <p>Elegí tu rol real al registrarte: Psicopedagogo/a, Psicólogo/a, Fonoaudiólogo/a, Terapeuta o Coach.</p>
            </article>

            <article class="cs-feat-card">
              <div class="cs-feat-icon">${Icons.shield}</div>
              <h3>Obra Social, Particular y CUD</h3>
              <p>Identificá al instante cada paciente con su cobertura y su condición frente al Certificado Único de Discapacidad (CUD).</p>
            </article>

            <article class="cs-feat-card">
              <div class="cs-feat-icon">${Icons.fileText}</div>
              <h3>Evolución de cada sesión</h3>
              <p>Anotá qué trabajaste en el encuentro. Si otro colega del equipo atiende al mismo paciente, puede leer tu evolución.</p>
            </article>

            <article class="cs-feat-card">
              <div class="cs-feat-icon">${Icons.send}</div>
              <h3>Recordatorios por WhatsApp o Mail</h3>
              <p>Enviá el aviso del turno con horario y día listos para mandar, evitando ausencias y olvidos.</p>
            </article>

            <article class="cs-feat-card">
              <div class="cs-feat-icon">${Icons.smartphone}</div>
              <h3>Usala como App en el celular</h3>
              <p>Instalable en la pantalla de inicio de Android o iPhone en dos toques, liviana y rápida.</p>
            </article>
          </div>
        </div>
      </section>

      <!-- Community Privacy vs Shared Split -->
      <section class="cs-comm-band" id="comunidad">
        <div class="container cs-comm-grid">
          <div>
            <div class="cs-eyebrow">Trabajo en equipo · Ej. Código INTEGRARTE</div>
            <h2 style="font-size:2.1rem;font-weight:800;color:var(--green-900);line-height:1.15;margin-bottom:1rem">
              Una comunidad para todo tu centro, cuidando la privacidad
            </h2>
            <p style="color:var(--ink-2);margin-bottom:1.25rem;font-size:0.98rem">
              Ingresando un código compartido, todos los profesionales del mismo lugar acceden al historial clínico del paciente en común, sin mezclar la administración personal de cada uno.
            </p>
            <button class="btn btn-primary" onclick="Router.navigate('/crear-cuenta')">Crear espacio para mi centro</button>
          </div>

          <div class="cs-privacy-cards">
            <div class="cs-priv-card cs-priv-card--shared">
              <h4 style="color:var(--green-800)">${Icons.checkCircle} Visible en la comunidad</h4>
              <ul>
                <li>${Icons.check} Nombre y DNI del paciente</li>
                <li>${Icons.check} Condición frente al CUD</li>
                <li>${Icons.check} Obra Social / Particular</li>
                <li>${Icons.check} Qué evolucionó cada profesional</li>
              </ul>
            </div>

            <div class="cs-priv-card">
              <h4 style="color:var(--ink-2)">${Icons.lock} Privado (solo vos)</h4>
              <ul>
                <li>• Quién pagó o debe la sesión</li>
                <li>• Montos y cobros personales</li>
                <li>• Tu agenda individual de turnos</li>
                <li>• Notas personales privadas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Simple Honest Access Section -->
      <section class="cs-section" id="acceso">
        <div class="container">
          <div class="cs-section-head cs-section-head--center">
            <div class="cs-eyebrow">Simple desde el día uno</div>
            <h2>Empezá solo o con todo tu equipo</h2>
            <p>Podés probarlo hoy mismo sin tarjeta, o sumar a todos los profesionales de tu centro con un único código.</p>
          </div>

          <div class="cs-access-grid">
            <div class="cs-access-card">
              <div>
                <h3>Profesional Independiente</h3>
                <p style="color:var(--ink-3);font-size:0.92rem">Para organizar tu propio consultorio con agenda flexible, notas de sesión y recordatorios.</p>
                <ul style="margin-top:1.25rem;display:flex;flex-direction:column;gap:0.55rem;font-size:0.9rem;color:var(--ink-2)">
                  <li>${Icons.check} Agenda libre al minuto (ej. 16:20)</li>
                  <li>${Icons.check} Obra Social / Particular y CUD</li>
                  <li>${Icons.check} Recordatorios por WhatsApp y Mail</li>
                </ul>
              </div>
              <button class="btn btn-outline" onclick="Router.navigate('/crear-cuenta')">Crear cuenta individual</button>
            </div>

            <div class="cs-access-card cs-access-card--highlight">
              <div>
                <span class="badge badge-green" style="margin-bottom:0.75rem">Ideal Centros · Ej. Integrarte</span>
                <h3>Equipo & Comunidad</h3>
                <p style="font-size:0.92rem">Un solo espacio conectado por código para que psicopedagogos, psicólogos y colegas compartan evoluciones.</p>
                <ul style="margin-top:1.25rem;display:flex;flex-direction:column;gap:0.55rem;font-size:0.9rem">
                  <li>${Icons.check} Todo lo del modo individual</li>
                  <li>${Icons.check} Código de comunidad del centro</li>
                  <li>${Icons.check} Historial compartido con cobros ocultos</li>
                </ul>
              </div>
              <button class="btn btn-mint" onclick="Router.navigate('/crear-cuenta')">Crear comunidad del centro</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="cs-footer">
        <div class="container cs-footer-inner">
          ${Components.brandLogo(true, "Router.navigate('/')")}
          <div class="cs-footer-note">CoSesión · Gestión clínica simple para profesionales y centros terapéuticos.</div>
        </div>
      </footer>
    </div>
  `;
}

function renderHeroDemoScreen(tab) {
  if (tab === 'agenda') {
    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.9rem">
          <strong style="font-size:0.92rem;color:var(--green-900)">Agenda · Horario exacto</strong>
          <span class="badge badge-green">Sin saltos de 30 min</span>
        </div>
        <div class="cs-demo-row">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <span class="cs-demo-hour">15:30</span>
            <div>
              <div style="font-weight:700;font-size:0.9rem">Valentina Paz</div>
              <div style="font-size:0.76rem;color:var(--ink-3)">Evaluación · Particular</div>
            </div>
          </div>
          <span class="badge badge-amber">Particular</span>
        </div>
        <div class="cs-demo-row cs-demo-row--exact" style="margin-top:0.6rem">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <span class="cs-demo-hour">16:20</span>
            <div>
              <div style="font-weight:700;font-size:0.9rem">Lucas Fernández</div>
              <div style="font-size:0.76rem;color:var(--ink-3)">Psicopedagogía · O.S. OSDE</div>
            </div>
          </div>
          <span class="badge badge-blue">Obra Social</span>
        </div>
      </div>
      <div style="font-size:0.8rem;color:var(--green-800);background:var(--green-50);padding:0.6rem 0.8rem;border-radius:var(--r-md);display:flex;justify-content:space-between;align-items:center">
        <span>Recordatorio listo para WhatsApp / Email</span>
        <strong>Enviar →</strong>
      </div>`;
  }
  if (tab === 'ficha') {
    return `
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.9rem">
          <strong style="font-size:0.95rem;color:var(--green-900)">Lucas Fernández · DNI 42.123.456</strong>
          <span class="badge badge-green">CUD Vigente</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;font-size:0.82rem;margin-bottom:0.85rem">
          <div style="background:var(--bg-page);padding:0.65rem;border-radius:var(--r-md)">
            <span style="color:var(--ink-muted);display:block;font-size:0.7rem;font-weight:700">COBERTURA</span>
            <strong>Obra Social · OSDE</strong>
          </div>
          <div style="background:var(--bg-page);padding:0.65rem;border-radius:var(--r-md)">
            <span style="color:var(--ink-muted);display:block;font-size:0.7rem;font-weight:700">CERTIFICADO</span>
            <strong>Condición frente al CUD</strong>
          </div>
        </div>
      </div>
      <div style="background:var(--green-50);border-left:3px solid var(--green-700);padding:0.7rem;border-radius:var(--r-md);font-size:0.82rem">
        <strong>Última nota de sesión:</strong> Se trabajó comprensión lectora y planificación de tareas.
      </div>`;
  }
  return `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.85rem">
        <strong style="font-size:0.92rem;color:var(--green-900)">Comunidad: INTEGRARTE</strong>
        <span class="badge badge-dark">2 colegas conectados</span>
      </div>
      <div style="background:var(--bg-page);padding:0.75rem;border-radius:var(--r-md);margin-bottom:0.6rem;border-left:3px solid var(--green-700)">
        <div style="font-size:0.72rem;font-weight:700;color:var(--green-800)">Ayer · Lic. Marcos Ruiz (Psicólogo)</div>
        <div style="font-size:0.82rem;color:var(--ink-1);margin-top:0.2rem">Buena predisposición en sesión vincular. Se sugiere reforzar consignas cortas.</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:0.45rem;font-size:0.78rem;color:var(--ink-3);background:var(--bg-cream);padding:0.55rem 0.75rem;border-radius:var(--r-md);border:1px dashed var(--border-input)">
      ${Icons.lock} Tus cobros y montos permanecen ocultos para la comunidad.
    </div>`;
}

function switchHeroTab(tab, btn) {
  activeDemoTab = tab;
  document.querySelectorAll('.cs-demo-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('heroDemoScreen').innerHTML = renderHeroDemoScreen(tab);
}
