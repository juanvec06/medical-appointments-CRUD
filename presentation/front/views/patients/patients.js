/**
 * @fileoverview Lógica del lado del cliente para la vista de Pacientes.
 * Gestiona la obtención, renderizado, creación, edición y eliminación de pacientes,
 * así como la interacción con los modales y la tabla de la interfaz de usuario.
 * @module views/patients/patients
 */

import { showAlert, showConfirm } from './ui.js';

// --- Constantes y Referencias Globales ---

/**
 * URL base de la API para las peticiones de pacientes.
 * @type {string}
 */
const API_URL = 'http://localhost:3000/api';

/**
 * Instancia del modal de Bootstrap para el formulario de creación/edición de pacientes.
 * @type {bootstrap.Modal}
 */
const patientModal = new bootstrap.Modal(document.getElementById('patient-modal'));

/**
 * Referencia al elemento del formulario de paciente.
 * @type {HTMLFormElement}
 */
const patientForm = document.getElementById('patient-form');

// --- Funciones de la Vista ---

/**
 * Obtiene la lista de pacientes desde la API y la renderiza en la tabla HTML.
 * Maneja los estados de carga, lista vacía y errores de conexión.
 * @async
 */
async function fetchAndRenderPatients() {
    const patientList = document.getElementById('patient-list');
    if (!patientList) {
        console.error('El elemento de la lista de pacientes no fue encontrado en el DOM.');
        return;
    }
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
        if (!template) {
            console.error('¡La plantilla "patient-row-template" no se encontró!');
            return;
        }
        patients.forEach(patient => {
            const rowClone = template.content.cloneNode(true);
            const cells = rowClone.querySelectorAll('td');
            cells[0].textContent = patient.id;
            cells[1].textContent = patient.name_patient;
            cells[2].textContent = patient.phone_patient || 'N/A';
            cells[3].textContent = patient.email_patient || 'N/A';
            const editButton = rowClone.querySelector('.btn-outline-secondary');
            editButton.dataset.patientId = patient.id;
            const deleteButton = rowClone.querySelector('.btn-outline-danger');
            deleteButton.dataset.patientId = patient.id;
            patientList.appendChild(rowClone);
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        patientList.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-3">Error al cargar los pacientes.</td></tr>`;
    }
}

/**
 * Prepara y abre el modal de paciente en modo 'creación'.
 * Limpia el formulario, ajusta el título y los campos, y muestra el modal.
 */
function openPatientCreateModal() {
    const modalTitle = document.getElementById('modal-title');
    patientForm.reset();
    patientForm.dataset.mode = 'create';
    delete patientForm.dataset.patientId;
    modalTitle.textContent = 'Nuevo Paciente';
    document.getElementById('id').readOnly = false;
    patientModal.show();
}

/**
 * Obtiene los datos de un paciente específico, los carga en el formulario y abre el modal en modo 'edición'.
 * @async
 * @param {string|number} patientId - El ID del paciente a editar.
 */
async function openPatientEditModal(patientId) {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}`);
        if (!response.ok) throw new Error('Failed to fetch patient data.');
        const patient = await response.json();
        const modalTitle = document.getElementById('modal-title');
        patientForm.reset();
        patientForm.dataset.mode = 'edit';
        patientForm.dataset.patientId = patient.id;
        modalTitle.textContent = 'Editar Paciente';
        document.getElementById('id').value = patient.id;
        document.getElementById('id').readOnly = true;
        document.getElementById('name_patient').value = patient.name_patient;
        document.getElementById('phone_patient').value = patient.phone_patient || '';
        document.getElementById('email_patient').value = patient.email_patient || '';
        patientModal.show();
    } catch (error) {
        console.error('Error opening edit modal:', error);
        await showAlert('No se pudieron cargar los datos del paciente para editar.', 'Error');
    }
}

/**
 * Maneja el envío del formulario de paciente.
 * Determina si la operación es de creación (POST) o edición (PUT) basándose en el 'data-mode' del formulario,
 * y envía la petición correspondiente a la API.
 * @async
 * @param {Event} event - El objeto del evento de envío del formulario.
 */
async function handlePatientFormSubmit(event) {
    event.preventDefault();
    const mode = patientForm.dataset.mode;
    const patientId = patientForm.dataset.patientId;
    const patientData = {
        id: Number(patientForm.id.value),
        name_patient: patientForm.name_patient.value,
        phone_patient: patientForm.phone_patient.value,
        email_patient: patientForm.email_patient.value,
    };
    const isEdit = mode === 'edit';
    const url = isEdit ? `${API_URL}/patients/${patientId}` : `${API_URL}/patients`;
    const method = isEdit ? 'PUT' : 'POST';
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} patient`);
        }
        patientModal.hide();
        fetchAndRenderPatients();
    } catch (error) {
        console.error(`Error ${isEdit ? 'updating' : 'creating'} patient:`, error);
        await showAlert(error.message, 'Error al Guardar');
    }
}

/**
 * Envía una petición DELETE a la API para eliminar un paciente.
 * Tras una eliminación exitosa, refresca la tabla de pacientes.
 * @async
 * @param {string|number} patientId - El ID del paciente a eliminar.
 */
async function handleDeletePatient(patientId) {
    try {
        const response = await fetch(`${API_URL}/patients/${patientId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'No se pudo eliminar al paciente.');
        }
        fetchAndRenderPatients();
    } catch (error) {
        console.error('Error deleting patient:', error);
        await showAlert(error.message, 'Error al Eliminar');
    }
}

/**
 * Manejador de eventos para la tabla de pacientes (delegación de eventos).
 * Detecta clics en los botones de 'Editar' o 'Eliminar' de cualquier fila y
 * dispara la función correspondiente.
 * @async
 * @param {Event} event - El objeto del evento de clic.
 */
async function handleTableActions(event) {
    if (event.target.matches('.btn-outline-secondary')) {
        const patientId = event.target.dataset.patientId;
        await openPatientEditModal(patientId);
    }
    if (event.target.matches('.btn-outline-danger')) {
        const patientId = event.target.dataset.patientId;
        const patientRow = event.target.closest('tr');
        const patientName = patientRow.cells[1].textContent;

        const confirmed = await showConfirm(`¿Estás seguro de que deseas eliminar a "${patientName}"?`);
        if (confirmed) {
            await handleDeletePatient(patientId);
        }
    }
}

// --- Función de Inicialización (Exportada) ---

/**
 * @description Punto de entrada para la lógica de la vista de pacientes.
 * Se encarga de obtener las referencias a los elementos del DOM y de asignar
 * los listeners de eventos necesarios. Finalmente, inicia la carga de datos.
 * Esta función es exportada y llamada por el router principal.
 * @exports initialize
 */
export function initialize() {
    const addPatientBtn = document.getElementById('add-patient-btn');
    const patientList = document.getElementById('patient-list');
    if (patientForm) {
        patientForm.addEventListener('submit', handlePatientFormSubmit);
    }
    if (addPatientBtn) {
        addPatientBtn.addEventListener('click', openPatientCreateModal);
    }
    if (patientList) {
        patientList.addEventListener('click', handleTableActions);
    }
    fetchAndRenderPatients();
}