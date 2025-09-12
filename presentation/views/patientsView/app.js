const API_URL = 'http://localhost:3000/api'; // Asegúrate que el puerto sea el correcto
const content = document.getElementById('content-area');
const modal = document.getElementById('patient-modal');
const modalTitle = document.getElementById('modal-title');
const patientForm = document.getElementById('patient-form');
const patientIdInput = document.getElementById('patient-id');
const nameInput = document.getElementById('name_patient');
const phoneInput = document.getElementById('phone_patient');
const emailInput = document.getElementById('email_patient');
const cancelButton = document.getElementById('cancel-button');

/**
 * Renders the main view for patients.
 */
function renderMainView() {
  content.innerHTML = `
    <div class="page-header">
      <div class="page-title">Pacientes</div>
      <div class="controls">
        <button id="add-patient-btn" class="btn btn-primary">Nuevo Paciente</button>
      </div>
    </div>
    <div class="table-container">
      <table class="patient-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="patient-list">
          <!-- Patient rows will be inserted here -->
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('add-patient-btn').addEventListener('click', () => openCreateModal());
  fetchAndRenderPatients();
}

/**
 * Fetches patients from the API and renders them in the table.
 */
async function fetchAndRenderPatients() {
  try {
    const response = await fetch(`${API_URL}/patients`);
    if (!response.ok) throw new Error('Network response was not ok');
    const patients = await response.json();
    
    const patientList = document.getElementById('patient-list');
    patientList.innerHTML = ''; // Clear existing rows

    if (patients.length === 0) {
        patientList.innerHTML = '<tr><td colspan="4" class="muted" style="text-align:center;padding:20px;">No hay pacientes registrados.</td></tr>';
        return;
    }

    const template = document.getElementById('patient-row-template');
    patients.forEach(patient => {
      const row = template.content.cloneNode(true);
      const cells = row.querySelectorAll('td');
      cells[0].textContent = patient.name_patient;
      cells[1].textContent = patient.phone_patient || 'N/A';
      cells[2].textContent = patient.email_patient || 'N/A';
      // We will add event listeners for edit/delete buttons later
      patientList.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    content.innerHTML += `<div class="muted">Error al cargar los pacientes. Asegúrate de que el servidor backend esté corriendo.</div>`;
  }
}

/**
 * Opens the modal in 'create' mode.
 */
function openCreateModal() {
  patientForm.reset();
  patientIdInput.value = '';
  modalTitle.textContent = 'Nuevo Paciente';
  modal.style.display = 'flex';
}

/**
 * Closes the patient modal.
 */
function closeModal() {
  modal.style.display = 'none';
}

/**
 * Handles the form submission for both creating and updating patients.
 * @param {Event} event The form submission event.
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const patientData = {
    name_patient: nameInput.value,
    phone_patient: phoneInput.value,
    email_patient: emailInput.value,
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

    closeModal();
    fetchAndRenderPatients(); // Refresh the table
  } catch (error) {
    console.error('Error creating patient:', error);
    alert(`Error: ${error.message}`);
  }
}

// --- Initial Setup ---
cancelButton.addEventListener('click', closeModal);
patientForm.addEventListener('submit', handleFormSubmit);
// Close modal if clicking on the overlay
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Render the initial view when the script loads
renderMainView();