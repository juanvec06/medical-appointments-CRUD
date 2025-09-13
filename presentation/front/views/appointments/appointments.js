
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

        // Asumiendo que la API devuelve un 'id' único para cada cita.
        const filtered = filterDate ? list.filter(a => String(a.date_appointment).slice(0, 10) === filterDate) : list;

        if (filtered.length === 0) {
            container.innerHTML = '<div class="list-group-item text-muted">No hay citas para la fecha seleccionada.</div>';
            return;
        }

        container.innerHTML = '';
        filtered.forEach(a => {
            const el = document.createElement('div');
            // Usamos flexbox para alinear el contenido principal a la izquierda y los botones a la derecha.
            el.className = 'list-group-item d-flex justify-content-between align-items-center';

            const reason = a.reason_appointment || a.reason || '';
            const patients = Array.isArray(a.patients) ? a.patients.join(', ') : (a.patients || '');
            const dateObj = new Date(a.date_appointment);
            const formattedDate = isNaN(dateObj) ? 'Fecha inválida' : dateObj.toLocaleString();

            // Contenedor para la información de la cita
            const infoDiv = `
        <div>
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${escapeHtml(reason)}</h6>
            <small>${formattedDate}</small>
          </div>
          <p class="mb-1">Consultorio: ${a.office_id}</p>
          <small class="text-muted">Pacientes: ${escapeHtml(String(patients))}</small>
        </div>
      `;

            // Contenedor para los botones de acción
            // Añadimos data-id para poder identificar la cita en los eventos
            const actionsDiv = `
        <div>
          <button class="btn btn-sm btn-light btn-modify" data-id="${escapeHtml(a.id)}" title="Modificar">🛠️</button>
          <button class="btn btn-sm btn-light btn-delete" data-id="${escapeHtml(a.id)}" title="Eliminar">🗑️</button>
        </div>
      `;

            el.innerHTML = infoDiv + actionsDiv;
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

// --- Modal para Modificar Citas (No Implementado) ---
function openModifyModal(appointmentId, officeId, datetime, reasonAppointment, patientIds) {
    
}
// --- Funciones para manejar los botones (aún no implementadas) ---
function handleModifyAppointment(appointmentId) {
    // Lógica para modificar la cita.
    // Por ejemplo: abrir un modal con la información de la cita para editarla.
    console.log(`Función handleModifyAppointment llamada para la cita ID: ${appointmentId}`);
    alert(`Modificar la cita con ID: ${appointmentId}`);
}

function handleDeleteAppointment(appointmentId) {
    // Lógica para eliminar la cita.
    // Por ejemplo: mostrar un confirm() y luego hacer una petición DELETE a la API.
    console.log(`Función handleDeleteAppointment llamada para la cita ID: ${appointmentId}`);
    if (confirm(`¿Estás seguro de que quieres eliminar la cita con ID: ${appointmentId}?`)) {
        alert('Aquí iría la llamada a la API para eliminar.');
        // Ejemplo: fetch(`${API_URL}/appointments/${appointmentId}`, { method: 'DELETE' });
    }
}


// --- Función de Inicialización (Exportada) ---

export function initialize() {
    const apptForm = document.getElementById('apptForm');
    const filterDate = document.getElementById('filterDate');
    const appointmentsContainer = document.getElementById('appointmentsContainer');

    fetchAppointments();

    if (apptForm) {
        apptForm.addEventListener('submit', handleCreateAppointment);
    }
    if (filterDate) {
        filterDate.addEventListener('change', fetchAppointments);
    }

    // Delegación de eventos para los botones de modificar y eliminar
    if (appointmentsContainer) {
        appointmentsContainer.addEventListener('click', (event) => {
            const target = event.target;
            // Busca el botón más cercano al elemento clickeado
            const modifyButton = target.closest('.btn-modify');
            const deleteButton = target.closest('.btn-delete');

            if (modifyButton) {
                const appointmentId = modifyButton.dataset.id;
                handleModifyAppointment(appointmentId);
            } else if (deleteButton) {
                const appointmentId = deleteButton.dataset.id;
                handleDeleteAppointment(appointmentId);
            }
        });
    }
}