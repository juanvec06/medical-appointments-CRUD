// Constantes que esta vista necesita
const API_URL = 'http://localhost:3000/api';
const patientModal = new bootstrap.Modal(document.getElementById('patient-modal'));

// --- Funciones de la Vista de Pacientes ---

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
    id: Number(form.id.value),
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

// --- Función de Inicialización (Exportada) ---

export function initialize() {
  document.getElementById('add-patient-btn').addEventListener('click', openPatientCreateModal);
  document.getElementById('patient-form').addEventListener('submit', handlePatientFormSubmit);
  fetchAndRenderPatients();
}