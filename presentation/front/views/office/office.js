/**
 * @fileoverview Lógica del lado del cliente para la vista de Consultorios.
 * Gestiona la obtención, renderizado, creación, edición y eliminación de consultorios,
 * así como la interacción con los modales y la tabla de la interfaz de usuario.
 * @module views/offices/offices
 */

// --- Constantes y Referencias Globales ---
/**
 * URL base de la API del backend.
 * @constant {string}
 */
const API_URL = 'http://localhost:3000/api';

/**
 * Instancia del modal de Bootstrap para el formulario de consultorios.
 * @type {bootstrap.Modal}
 */
const officeModal = new bootstrap.Modal(document.getElementById('office-modal'));

/**
 * Referencia al formulario.
 * @type {HTMLFormElement}
 */
const officeForm = document.getElementById('office-form');

// --- Funciones de la Vista ---

/**
 * Obtiene la lista de consultorios desde la API y la renderiza en la tabla.
 * Muestra mensajes de carga, error o vacío según el estado.
 * @async
 * @returns {Promise<void>}
 */
async function fetchAndRenderOffices() {
  const officeList = document.getElementById('office-list');
  if (!officeList) return;

  officeList.innerHTML = '<tr><td colspan="4" class="text-center">Cargando...</td></tr>';

  try {
    const response = await fetch(`${API_URL}/offices`);
    if (!response.ok) throw new Error('Error al obtener consultorios');
    const offices = await response.json();

    officeList.innerHTML = '';
    if (offices.length === 0) {
      officeList.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No hay consultorios registrados.</td></tr>';
      return;
    }

    const template = document.getElementById('office-row-template');
    offices.forEach(office => {
      const rowClone = template.content.cloneNode(true);
      const cells = rowClone.querySelectorAll('td');
      cells[0].textContent = office.id;
      cells[1].textContent = office.name_office;
      cells[2].textContent = office.location_office;

      const editBtn = rowClone.querySelector('.btn-outline-secondary');
      editBtn.dataset.officeId = office.id;

      const deleteBtn = rowClone.querySelector('.btn-outline-danger');
      deleteBtn.dataset.officeId = office.id;

      officeList.appendChild(rowClone);
    });
  } catch (error) {
    console.error('Error cargando consultorios:', error);
    officeList.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-3">Error al cargar consultorios.</td></tr>`;
  }
}

/**
 * Abre el modal en modo creación de un nuevo consultorio.
 * Limpia el formulario y establece el modo en "create".
 * @returns {void}
 */
function openOfficeCreateModal() {
  const modalTitle = document.getElementById('office-modal-title');
  officeForm.reset();
  officeForm.dataset.mode = 'create';
  delete officeForm.dataset.officeId;
  modalTitle.textContent = 'Nuevo Consultorio';
  officeModal.show();
}

/**
 * Abre el modal en modo edición con datos cargados.
 * @param {string|number} officeId
 */
async function openOfficeEditModal(officeId) {
  try {
    const response = await fetch(`${API_URL}/offices/${officeId}`);
    if (!response.ok) throw new Error('No se pudo obtener el consultorio.');
    const office = await response.json();

    officeForm.reset();
    officeForm.dataset.mode = 'edit';
    officeForm.dataset.officeId = office.id;

    document.getElementById('name_office').value = office.name_office;
    document.getElementById('location_office').value = office.location_office;

    officeModal.show();

  } catch (error) {
    console.error('Error abriendo modal de edición:', error);
  }
}



/**
 * Abre el modal en modo edición con los datos del consultorio cargados.
 * @async
 * @param {string|number} officeId - ID del consultorio a editar.
 * @returns {Promise<void>}
 */
async function handleOfficeFormSubmit(event) {
  event.preventDefault();

  const mode = officeForm.dataset.mode;
    const officeId = officeForm.dataset.officeId;

  const officeData = {
    name_office: officeForm.name_office.value,
    location_office: officeForm.location_office.value,
  };

  const url = mode === 'edit'
    ? `${API_URL}/offices/${officeId}`
    : `${API_URL}/offices`;

  const method = mode === 'edit' ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(officeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al guardar consultorio');
    }

    officeModal.hide();
    fetchAndRenderOffices();

  } catch (error) {
    console.error(`Error ${mode === 'edit' ? 'actualizando' : 'creando'} consultorio:`, error);
  }
}


/**
 * Elimina un consultorio por su ID.
 * @async
 * @param {string|number} officeId - ID del consultorio a eliminar.
 * @returns {Promise<void>}
 */
async function handleDeleteOffice(officeId) {
  try {
    const response = await fetch(`${API_URL}/offices/${officeId}`, { method: 'DELETE' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'No se pudo eliminar consultorio.');
    }
    fetchAndRenderOffices();
  } catch (error) {
    console.error('Error eliminando consultorio:', error);
    alert(error.message);
  }
}

/**
 * Maneja las acciones delegadas en la tabla (editar/eliminar).
 * @async
 * @param {Event} event - Evento de click en la tabla.
 * @returns {Promise<void>}
 */
async function handleTableActions(event) {
  if (event.target.matches('.btn-outline-secondary')) {
    const officeId = event.target.dataset.officeId;
    await openOfficeEditModal(officeId);
  }
  if (event.target.matches('.btn-outline-danger')) {
    const officeId = event.target.dataset.officeId;
    const officeRow = event.target.closest('tr');
    const officeName = officeRow.cells[1].textContent;

    const confirmed = confirm(`¿Estás seguro de que deseas eliminar el consultorio "${officeName}"?`);
    if (confirmed) {
      await handleDeleteOffice(officeId);
    }
  }
}

// --- Inicialización ---
/**
 * Inicializa los eventos y renderiza la lista inicial de consultorios.
 * - Asigna eventos al formulario, botón de creación y tabla.
 * - Llama a la función de renderizado inicial.
 * @function
 * @returns {void}
 */
export function initialize() {
  const addOfficeBtn = document.getElementById('add-office-btn');
  const officeList = document.getElementById('office-list');

  if (officeForm) {
    officeForm.addEventListener('submit', handleOfficeFormSubmit);
  }
  if (addOfficeBtn) {
    addOfficeBtn.addEventListener('click', openOfficeCreateModal);
  }
  if (officeList) {
    officeList.addEventListener('click', handleTableActions);
  }

  fetchAndRenderOffices();
}
