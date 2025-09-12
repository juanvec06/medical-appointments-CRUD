// app.js
// Conecta únicamente Appointments con los endpoints:
// GET  http://localhost:3000/api/appointments
// POST http://localhost:3000/api/appointments
// Otras funcionalidades: pendientes (UI marcadas como pending)

const API_BASE = 'http://localhost:3000/api';
const content = document.getElementById('content-area');
const navButtons = Array.from(document.querySelectorAll('.nav-btn'));

navButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    navButtons.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const target = e.currentTarget.dataset.target;
    if (target === 'appointments') renderAppointments();
    else renderPending(target);
  });
});

// Inicial: mostrar appointments
renderAppointments();

/* ----------------- PENDIENTES ----------------- */
function renderPending(target) {
  content.innerHTML = `
    <div class="page-header">
      <div class="page-title">${capitalize(target)}</div>
      <div class="controls"><div class="muted">Funcionalidad pendiente — debe integrarse con backend</div></div>
    </div>
    <div class="muted">Esta sección está marcada como pendiente. Integración con backend no implementada.</div>
  `;
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

/* ----------------- APPOINTMENTS ----------------- */
function renderAppointments(){
  content.innerHTML = `
    <div class="page-header">
      <div class="page-title">Appointments</div>
      <div class="controls">
        <input type="date" id="filterDate" />
        <button class="btn primary" id="refreshAppts">Refresh</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:12px">
      <h4 style="margin:0 0 8px 0">Create appointment</h4>
      <form id="apptForm">
        <div class="form-row">
          <label>office_id</label>
          <input name="office_id" type="number" placeholder="ej: 2" required />
        </div>
        <div class="form-row">
          <label>Fecha y hora</label>
          <input name="datetime_local" type="datetime-local" required />
        </div>
        <div class="form-row">
          <label>Reason</label>
          <input name="reason_appointment" type="text" placeholder="Motivo..." required />
        </div>
        <div class="form-row">
          <label>patient_ids</label>
          <input name="patient_ids" type="text" placeholder="IDs separados por comas, ej: 4,5,6" required />
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button type="submit" class="btn primary">Create</button>
        </div>
      </form>
    </div>

    <div>
      <h4>List of appointments</h4>
      <div id="appointmentsContainer" class="appt-list muted">Cargando...</div>
    </div>
  `;

  document.getElementById('refreshAppts').addEventListener('click', fetchAppointments);
  document.getElementById('apptForm').addEventListener('submit', handleCreateAppointment);
  document.getElementById('filterDate').addEventListener('change', fetchAppointments);
  // initial load
  fetchAppointments();
}

/* Utility: format local Date -> YYYY-MM-DDTHH:mm:ss.SSS±HH:MM (offset)
   We must produce an ISO-like string including the local timezone offset (e.g. -05:00).
*/
function formatLocalWithOffset(date) {
  // date: Date object (local time)
  // build YYYY-MM-DDTHH:mm:ss.SSS
  function pad(n, w=2){ return String(n).padStart(w,'0'); }
  const year = date.getFullYear();
  const month = pad(date.getMonth()+1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const ms = pad(date.getMilliseconds(), 3);

  // timezone offset in minutes: note getTimezoneOffset returns minutes to add to local time to get UTC,
  // e.g. for -05:00 it returns 300. We want sign reversed.
  const offsetMinutes = -date.getTimezoneOffset(); // positive for ahead of UTC, negative for behind
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const offHours = pad(Math.floor(absOffset / 60));
  const offMins = pad(absOffset % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${sign}${offHours}:${offMins}`;
}

/* ----------------- FETCH: GET appointments ----------------- */
async function fetchAppointments(){
  const container = document.getElementById('appointmentsContainer');
  const filterDate = document.getElementById('filterDate').value; // format YYYY-MM-DD or empty
  container.innerHTML = 'Cargando...';

  try {
    const res = await fetch(`${API_BASE}/appointments`, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // optionally filter by date (if filterDate given) by comparing date part of appointment date
    const list = Array.isArray(data) ? data : [];
    const filtered = filterDate ? list.filter(a => {
      // try to parse a.date_appointment or date_appointment-like fields
      const d = a.date_appointment || a.date || a.dateAppointment || '';
      // take first 10 chars YYYY-MM-DD
      return String(d).slice(0,10) === filterDate;
    }) : list;

    if (filtered.length === 0) {
      container.innerHTML = '<div class="muted">No hay citas.</div>';
      return;
    }

    container.innerHTML = '';
    filtered.forEach(a => {
      const el = document.createElement('div');
      el.className = 'appt';
      const dateStr = a.date_appointment || a.date || '';
      const reason = a.reason_appointment || a.reason || '';
      const patients = Array.isArray(a.patient_ids) ? a.patient_ids.join(', ') : (a.patient_ids || '');
      el.innerHTML = `
        <div>
          <div style="font-weight:700">${escapeHtml(reason)}</div>
          <div class="muted">${escapeHtml(String(dateStr))} · Patients: ${escapeHtml(String(patients))}</div>
        </div>
      `;
      container.appendChild(el);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="muted">Error al obtener citas: ${escapeHtml(err.message)}</div>`;
  }
}

/* ----------------- CREATE appointment (POST) ----------------- */
async function handleCreateAppointment(ev){
  ev.preventDefault();
  const form = ev.target;
  const fd = new FormData(form);
  const office_id = Number(fd.get('office_id'));
  const datetimeLocal = fd.get('datetime_local'); // ex: "2025-09-08T10:00"
  const reason_appointment = fd.get('reason_appointment').trim();
  const patient_ids_raw = fd.get('patient_ids').trim();

  // patient_ids: parse comma-separated numbers
  const patient_ids = patient_ids_raw.split(',')
    .map(s => s.trim())
    .filter(s => s.length>0)
    .map(s => Number(s))
    .filter(n => !Number.isNaN(n));

  if (!office_id || !datetimeLocal || !reason_appointment || patient_ids.length === 0) {
    alert('Por favor completa todos los campos correctamente (office_id, fecha/hora, reason, patient_ids).');
    return;
  }

  // convert datetime-local string -> Date object (local)
  // datetimeLocal is like "2025-09-08T10:00"
  const localDate = new Date(datetimeLocal);
  // Format into ISO-like with local offset, e.g. "2025-09-08T10:00:00.000-05:00"
  const date_appointment = formatLocalWithOffset(localDate);

  const payload = {
    office_id,
    date_appointment,
    reason_appointment,
    patient_ids
  };

  try {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} - ${txt}`);
    }
    const created = await res.json();
    alert('Cita creada correctamente.');
    form.reset();
    fetchAppointments();
  } catch (err) {
    console.error(err);
    alert('Error creando cita: ' + err.message);
  }
}

/* small util */
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str).replace(/[&<>"']/g, function(s) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[s];
  });
}
