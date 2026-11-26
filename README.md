# CoSesión · Agenda al minuto, CUD y evoluciones en comunidad

**CoSesión** es una aplicación web (instalable como PWA en celular) pensada para psicopedagogos, psicólogos y centros interdisciplinarios (como *Integrarte*).

## Demo

La aplicación está publicada en [GitHub Pages](https://renzoleporace.github.io/CoSession/).

## Funcionalidades principales

- **Horarios exactos al minuto**: Agendá turnos en cualquier minuto (por ejemplo `16:20`), sin grilla fija cada 30 minutos.
- **Especialidades**: Incluye Psicopedagogo/a, Psicólogo/a, Fonoaudiólogo/a, Terapeuta, Coach y más.
- **Obra Social / Particular y CUD**: Distinción clara de cobertura y registro de condición frente al Certificado Único de Discapacidad (CUD).
- **Evoluciones por sesión**: Registro clínico de qué se trabajó en cada encuentro.
- **Comunidades con aprobación**: Un usuario crea la comunidad como coordinador. Los ingresos por código quedan pendientes hasta que el coordinador los acepte.
- **Roles y permisos**: Coordinador, Profesional, Analista, Recepcionista y Observador. Solo el coordinador administra solicitudes y roles; los permisos limitan el acceso a agenda, directorio y fichas clínicas.
- **Recordatorios**: Envío rápido de recordatorio por WhatsApp o Email.
- **Instalable en el celular**: Soporte PWA (`manifest.json`).

## Seguridad y alcance de la demo

- Las contraseñas se derivan con PBKDF2-SHA-256 (310.000 iteraciones y sal aleatoria); nunca se guardan en texto plano.
- Fichas, evoluciones y turnos se cifran con AES-GCM en el almacenamiento local y se desbloquean al ingresar la contraseña.
- Esta versión usa `localStorage`: cuentas, aprobaciones y roles solo existen en el navegador actual. No hay sincronización entre dispositivos ni intercambio de fichas entre cuentas. Los permisos de interfaz no reemplazan controles de acceso en un servidor.
- No usar con información clínica real ni como sistema de producción. Para colaboración real se necesita un backend con autenticación y autorización del lado del servidor, almacenamiento cifrado y gestión de claves.
- Si el navegador contiene datos de una versión anterior, la app intenta cifrarlos durante la actualización con las contraseñas que estaban guardadas localmente. Si la migración no puede completarse, muestra un error y no carga esos datos.
