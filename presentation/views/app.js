/**
 * =================================================================
 * Clinic Dashboard - Single Page Application (SPA) Main Script
 * =================================================================
 */

// --- 1. CONFIGURACIÓN GLOBAL Y HELPERS ---

const API_URL = 'http://localhost:3000/api';
const contentArea = document.getElementById('app-content');

// Instancia del Modal de Bootstrap para Pacientes
const patientModal = new bootstrap.Modal(document.getElementById('patient-modal'));

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


// --- 2. LÓGICA DE LA VISTA DE PACIENTES ---

function renderPatientsView() {
  contentArea.innerHTML = `
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h2 class="h5 mb-0">Pacientes</h2>
        <button id="add-patient-btn" class="btn btn-primary">Nuevo Paciente</button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover patient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody id="patient-list"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  document.getElementById('add-patient-btn').addEventListener('click', openPatientCreateModal);
  document.getElementById('patient-form').addEventListener('submit', handlePatientFormSubmit);
  fetchAndRenderPatients();
}

async function fetchAndRenderPatients() {
  const patientList = document.getElementById('patient-list');
  if (!patientList) return;
  patientList.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>';
  try {
    const response = await fetch(`${API_URL}/patients`);
    if (!response.ok) throw new Error('Network response was not ok');
    const patients = await response.json();
    patientList.innerHTML = '';
    if (patients.length === 0) {
      patientList.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">No hay pacientes registrados.</td></tr>';
      return;
    }
    const template = document.getElementById('patient-row-template');
    patients.forEach(patient => {
      const rowClone = template.content.cloneNode(true);
      const cells = rowClone.querySelectorAll('td');
      cells[0].textContent = patient.id;
      cells[1].textContent = patient.name_patient;
      cells[2].textContent = patient.phone_patient || 'N/A';
      cells[3].textContent = patient.email_patient || 'N/A';
      patientList.appendChild(rowClone);
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    patientList.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-3">Error al cargar los pacientes.</td></tr>`;
  }
}

function openPatientCreateModal() {
  const form = document.getElementById('patient-form');
  const modalTitle = document.getElementById('modal-title');
  form.reset();
  form.dataset.mode = 'create';
  modalTitle.textContent = 'Nuevo Paciente';
  document.getElementById('id').readOnly = false;
  patientModal.show();
}

async function handlePatientFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const patientData = {
    id: Number(form.id.value), // Convertimos el valor a número
    name_patient: form.name_patient.value,
    phone_patient: form.phone_patient.value,
    email_patient: form.email_patient.value,
  };
  try {
    const response = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create patient');
    }
    patientModal.hide();
    fetchAndRenderPatients();
  } catch (error) {
    console.error('Error creating patient:', error);
    alert(`Error: ${error.message}`);
  }
}


// --- 3. LÓGICA DE LA VISTA DE CITAS (AHORA IMPLEMENTADA) ---

function renderAppointmentsView() {
  contentArea.innerHTML = `
    <div class="row">
      <div class="col-lg-5">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h4 class="card-title mb-3">Crear Cita</h4>
            <form id="apptForm">
              <div class="mb-3">
                <label class="form-label">ID del Consultorio</label>
                <input name="office_id" type="number" class="form-control" placeholder="Ej: 2" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Fecha y Hora</label>
                <input name="datetime_local" type="datetime-local" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Motivo</label>
                <input name="reason_appointment" type="text" class="form-control" placeholder="Motivo de la consulta..." required />
              </div>
              <div class="mb-3">
                <label class="form-label">IDs de Pacientes</label>
                <input name="patient_ids" type="text" class="form-control" placeholder="IDs separados por coma, ej: 101,102" required />
              </div>
              <div class="d-flex justify-content-end">
                <button type="submit" class="btn btn-primary">Crear Cita</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="col-lg-7">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">Lista de Citas</h4>
          <input type="date" id="filterDate" class="form-control" style="width: auto;" />
        </div>
        <div id="appointmentsContainer" class="list-group">
          <!-- Las citas se cargarán aquí -->
        </div>
      </div>
    </div>
  `;
  document.getElementById('apptForm').addEventListener('submit', handleCreateAppointment);
  document.getElementById('filterDate').addEventListener('change', fetchAppointments);
  fetchAppointments(); // Carga inicial
}

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


// --- 4. LÓGICA DE LA VISTA DE CONSULTORIOS ---

function renderOfficesView() {
  contentArea.innerHTML = `
    <div class="row">
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-body">
            <h4 class="card-title mb-3">Crear Consultorio</h4>
            <form id="officeForm">
              <div class="mb-3">
                <label for="name_office" class="form-label">Nombre del consultorio</label>
                <input id="name_office" name="name_office" type="text" class="form-control" placeholder="Ej: Odontología" required>
              </div>
              <div class="mb-3">
                <label for="location_office" class="form-label">Ubicación</label>
                <input id="location_office" name="location_office" type="text" class="form-control" placeholder="Ej: Piso 2, consultorio 203" required>
              </div>
              <div class="d-flex justify-content-end">
                <button type="submit" class="btn btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="col-md-7">
        <h4>Lista de Consultorios</h4>
        <div id="officesContainer" class="list-group"></div>
      </div>
    </div>
  `;
  document.getElementById('officeForm').addEventListener('submit', handleOfficeFormSubmit);
  loadOffices();
}

async function loadOffices() {
    const container = document.getElementById('officesContainer');
    if (!container) return;
    container.innerHTML = `<div class="list-group-item text-muted">Cargando...</div>`;
    try {
        const res = await fetch(`${API_URL}/offices`);
        const offices = await res.json();
        if (!offices || offices.length === 0) {
            container.innerHTML = `<div class="list-group-item text-muted">No hay consultorios registrados.</div>`;
            return;
        }
        container.innerHTML = "";
        offices.forEach(o => {
            const item = document.createElement("div");
            item.className = "list-group-item";
            item.textContent = `${o.name_office} — ${o.location_office}`;
            container.appendChild(item);
        });
    } catch (err) {
        container.innerHTML = `<div class="list-group-item text-danger">Error al conectar con el servidor.</div>`;
        console.error(err);
    }
}

async function handleOfficeFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const office = {
        name_office: form.name_office.value,
        location_office: form.location_office.value
    };
    try {
        const res = await fetch(`${API_URL}/offices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(office),
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Error desconocido');
        }
        form.reset();
        await loadOffices();
    } catch (err) {
        alert("Error: " + err.message);
        console.error("Error creando oficina", err);
    }
}


// --- 5. ROUTER (El que decide qué vista mostrar) ---

const routes = {
  '#/patients': renderPatientsView,
  '#/appointments': renderAppointmentsView,
  '#/office': renderOfficesView,
};

function router() {
  const path = window.location.hash || '#/patients';
  const viewRenderer = routes[path] || renderNotFound;
  viewRenderer();
  updateActiveNavLink(path);
}

function renderNotFound() {
    contentArea.innerHTML = `<div class="alert alert-danger">Error 404: Página no encontrada.</div>`;
}

function updateActiveNavLink(path) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === path);
    });
}

// --- 6. INICIALIZACIÓN ---

window.addEventListener('hashchange', router);
window.addEventListener('load', router);