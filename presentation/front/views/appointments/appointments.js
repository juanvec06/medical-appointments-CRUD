// Constantes y Helpers que esta vista necesita
const API_URL = 'http://localhost:3000/api';

function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}
/**
 * Formatea un objeto Date local a un string ISO con el offset de la zona horaria.
 * @param {Date} date - El objeto Date a formatear.
 * @returns {string} - ej: "2025-09-08T10:00:00.000-05:00"
 */
function formatLocalWithOffset(date) {
    function pad(n, w = 2) { return String(n).padStart(w, '0'); }
    const year = date.getFullYear(), month = pad(date.getMonth() + 1), day = pad(date.getDate());
    const hours = pad(date.getHours()), minutes = pad(date.getMinutes()), seconds = pad(date.getSeconds()), ms = pad(date.getMilliseconds(), 3);
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetMinutes);
    const offHours = pad(Math.floor(absOffset / 60));
    const offMins = pad(absOffset % 60);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${sign}${offHours}:${offMins}`;
}
// --- Funciones de la Vista de Citas ---

async function fetchAppointments() {
    const container = document.getElementById('appointmentsContainer');
    const filterDate = document.getElementById('filterDate').value;
    if (!container) return;
    container.innerHTML = `<div class="list-group-item text-muted">Cargando...</div>`;

    try {
        const res = await fetch(`${API_URL}/appointments`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();

        const filtered = filterDate ? list.filter(a => String(a.date_appointment).slice(0, 10) === filterDate) : list;

        if (filtered.length === 0) {
            container.innerHTML = '<div class="list-group-item text-muted">No hay citas para la fecha seleccionada.</div>';
            return;
        }

        container.innerHTML = '';
        filtered.forEach(a => {
            const el = document.createElement('div');
            el.className = 'list-group-item';
            const reason = a.reason_appointment || a.reason || '';
            const patients = Array.isArray(a.patient_ids) ? a.patient_ids.join(', ') : (a.patient_ids || '');
            // Formatear fecha para ser más legible
            const dateObj = new Date(a.date_appointment);
            const formattedDate = isNaN(dateObj) ? 'Fecha inválida' : dateObj.toLocaleString();

            el.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">${escapeHtml(reason)}</h6>
          <small>${formattedDate}</small>
        </div>
        <p class="mb-1">Consultorio: ${a.office_id}</p>
        <small class="text-muted">Pacientes: ${escapeHtml(String(patients))}</small>
      `;
            container.appendChild(el);
        });
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="list-group-item text-danger">Error al obtener citas: ${escapeHtml(err.message)}</div>`;
    }
}

async function handleCreateAppointment(ev) {
    ev.preventDefault();
    const form = ev.target;
    const fd = new FormData(form);
    const office_id = Number(fd.get('office_id'));
    const datetimeLocal = fd.get('datetime_local');
    const reason_appointment = fd.get('reason_appointment').trim();
    const patient_ids_raw = fd.get('patient_ids').trim();

    const patient_ids = patient_ids_raw.split(',').map(s => s.trim()).filter(Boolean);

    if (!office_id || !datetimeLocal || !reason_appointment || patient_ids.length === 0) {
        alert('Por favor completa todos los campos correctamente.');
        return;
    }

    const date_appointment = formatLocalWithOffset(new Date(datetimeLocal));
    const payload = { office_id, date_appointment, reason_appointment, patient_ids };

    try {
        const res = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`HTTP ${res.status} - ${txt}`);
        }
        form.reset();
        fetchAppointments();
    } catch (err) {
        console.error(err);
        alert('Error creando cita: ' + err.message);
    }
}

// --- Función de Inicialización (Exportada) ---

export function initialize() {
    document.getElementById('apptForm').addEventListener('submit', handleCreateAppointment);
    document.getElementById('filterDate').addEventListener('change', fetchAppointments);
    fetchAppointments();
}