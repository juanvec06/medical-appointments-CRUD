// =====================================
// CONSTANTES Y CONFIGURACIÓN
// =====================================
const API_URL = 'http://localhost:3000/api';
const appointmentModal = new bootstrap.Modal(document.getElementById('appointment-modal'));

// =====================================
// FUNCIONES AUXILIARES
// =====================================

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} str - String a escapar
 * @returns {string} String escapado
 */
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

// =====================================
// FUNCIONES DE INTERFAZ
// =====================================

/**
 * Obtiene y renderiza las citas desde la API
 * Aplica filtro por fecha si está seleccionado
 */
async function fetchAppointments() {
    const container = document.getElementById('appointmentsContainer');
    const filterDate = document.getElementById('filterDate').value;
    if (!container) return;
    
    // Mostrar estado de carga
    container.innerHTML = `<div class="list-group-item text-muted">Cargando citas...</div>`;

    try {
        const res = await fetch(`${API_URL}/appointments`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();

        // Aplicar filtro por fecha si está seleccionado
        const filtered = filterDate ? list.filter(a => String(a.date_appointment).slice(0, 10) === filterDate) : list;

        if (filtered.length === 0) {
            container.innerHTML = '<div class="list-group-item text-muted">No hay citas para la fecha seleccionada.</div>';
            return;
        }

        // Renderizar citas
        container.innerHTML = '';
        filtered.forEach(appointment => {
            renderAppointmentItem(appointment, container);
        });
    } catch (err) {
        console.error('Error fetching appointments:', err);
        container.innerHTML = `<div class="list-group-item text-danger">Error al obtener citas: ${escapeHtml(err.message)}</div>`;
    }
}

/**
 * Renderiza un elemento de cita individual en el contenedor
 * @param {Object} appointment - Objeto de cita
 * @param {HTMLElement} container - Contenedor donde renderizar
 */
function renderAppointmentItem(appointment, container) {
    const el = document.createElement('div');
    el.className = 'list-group-item d-flex justify-content-between align-items-center';

    // Preparar datos para mostrar
    const reason = appointment.reason_appointment || appointment.reason || '';
    const patients = Array.isArray(appointment.patients) ? appointment.patients.join(', ') : (appointment.patients || '');
    const dateObj = new Date(appointment.date_appointment);
    const formattedDate = isNaN(dateObj) ? 'Fecha inválida' : dateObj.toLocaleString();

    // HTML para la información de la cita
    const infoDiv = `
        <div>
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${escapeHtml(reason)}</h6>
                <small>${formattedDate}</small>
            </div>
            <p class="mb-1">Consultorio: ${appointment.office_id}</p>
            <small class="text-muted">Pacientes: ${escapeHtml(String(patients))}</small>
        </div>
    `;

    // HTML para los botones de acción
    const actionsDiv = `
        <div>
            <button class="btn btn-sm btn-light btn-modify" data-id="${escapeHtml(appointment.id)}" title="Modificar">🛠️</button>
            <button class="btn btn-sm btn-light btn-delete" data-id="${escapeHtml(appointment.id)}" title="Eliminar">🗑️</button>
        </div>
    `;

    el.innerHTML = infoDiv + actionsDiv;
    container.appendChild(el);
}

// =====================================
// FUNCIONES DE MODAL
// =====================================

/**
 * Abre el modal para crear una nueva cita
 * Resetea el formulario y configura el modo 'create'
 */
function openCreateModal() {
    const form = document.getElementById('appointment-form-create');
    const modalTitle = document.getElementById('appointment-modal-title');
    
    if (!form) {
        console.error('No se encontró el formulario appointment-form-create');
        return;
    }
    
    // Configurar formulario para crear
    form.reset();
    form.dataset.mode = 'create';
    delete form.dataset.appointmentId;
    modalTitle.textContent = 'Nueva Cita';
    
    // Mostrar el modal
    appointmentModal.show();
}

/**
 * Abre el modal para modificar una cita existente
 * Pre-llena el formulario con los datos de la cita
 * @param {string} appointmentId - ID de la cita a modificar
 * @param {number} officeId - ID del consultorio
 * @param {string} datetime - Fecha y hora de la cita
 * @param {string} reasonAppointment - Motivo de la cita
 * @param {Array} patientIds - Array de IDs de pacientes
 */
function openModifyModal(appointmentId, officeId, datetime, reasonAppointment, patientIds) {
    const form = document.getElementById('appointment-form-create');
    const modalTitle = document.getElementById('appointment-modal-title');
    
    if (!form) {
        console.error('No se encontró el formulario appointment-form-create');
        return;
    }
    
    // Configurar formulario para modificar
    form.reset();
    form.dataset.mode = 'modify';
    form.dataset.appointmentId = appointmentId;
    modalTitle.textContent = 'Modificar Cita';
    
    // Convertir fecha para el input datetime-local
    const dateObj = new Date(datetime);
    const localDateTime = dateObj.toISOString().slice(0, 16);
    
    // Pre-llenar campos del formulario con datos existentes
    document.getElementById('modal_office_id').value = officeId;
    document.getElementById('modal_datetime_local').value = localDateTime;
    document.getElementById('modal_reason_appointment').value = reasonAppointment;
    document.getElementById('modal_patient_ids').value = Array.isArray(patientIds) ? patientIds.join(', ') : patientIds;
    
    // Mostrar el modal
    appointmentModal.show();
}

// =====================================
// MANEJADORES DE EVENTOS DEL FORMULARIO
// =====================================

/**
 * Maneja el envío del formulario tanto para crear como para modificar citas
 * Determina la acción basándose en el modo del formulario
 * @param {Event} event - Evento de submit del formulario
 */
async function handleAppointmentFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Extraer y validar datos del formulario
    const appointmentData = extractAppointmentData(formData);
    if (!appointmentData) return; // La validación falló
    
    try {
        const mode = form.dataset.mode;
        const appointmentId = form.dataset.appointmentId;
        
        let response;
        let successMessage;
        
        if (mode === 'modify' && appointmentId) {
            // MODIFICAR CITA EXISTENTE
            response = await updateAppointment(appointmentId, appointmentData);
            successMessage = 'Cita modificada exitosamente';
        } else {
            // CREAR NUEVA CITA
            response = await createAppointment(appointmentData);
            successMessage = 'Cita creada exitosamente';
        }
        
        // Si llegamos aquí, la operación fue exitosa
        appointmentModal.hide();
        fetchAppointments(); // Refrescar la lista
        alert(successMessage);
        
    } catch (error) {
        console.error('Error en operación de cita:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Extrae y valida los datos del formulario
 * @param {FormData} formData - Datos del formulario
 * @returns {Object|null} Objeto con los datos validados o null si hay errores
 */
function extractAppointmentData(formData) {
    const office_id = Number(formData.get('office_id'));
    const datetimeLocal = formData.get('datetime_local');
    const reason_appointment = formData.get('reason_appointment').trim();
    const patient_ids_raw = formData.get('patient_ids').trim();
    
    // Validar campos requeridos
    if (!office_id || !datetimeLocal || !reason_appointment || !patient_ids_raw) {
        alert('Por favor completa todos los campos correctamente.');
        return null;
    }
    
    // Procesar IDs de pacientes
    const patient_ids = patient_ids_raw.split(',').map(s => s.trim()).filter(Boolean);
    if (patient_ids.length === 0) {
        alert('Debe especificar al menos un ID de paciente.');
        return null;
    }
    
    // Formatear fecha - usar formato ISO simple para compatibilidad con Joi
    const date_appointment = new Date(datetimeLocal).toISOString();
    
    return { office_id, date_appointment, reason_appointment, patient_ids };
}

// =====================================
// FUNCIONES DE API
// =====================================

/**
 * Crea una nueva cita en la API
 * @param {Object} appointmentData - Datos de la cita a crear
 * @returns {Promise} Respuesta de la API
 */
async function createAppointment(appointmentData) {
    console.log('Datos enviados al servidor:', appointmentData);
    
    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.error || 'Error al crear la cita');
            } catch (parseError) {
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }
        }
        
        return response.json();
    } catch (networkError) {
        console.error('Error de red:', networkError);
        if (networkError.message.includes('fetch')) {
            throw new Error('No se puede conectar con el servidor. Verifica que esté corriendo en http://localhost:3000');
        }
        throw networkError;
    }
}

/**
 * Actualiza una cita existente en la API
 * @param {string} appointmentId - ID de la cita a actualizar
 * @param {Object} appointmentData - Nuevos datos de la cita
 * @returns {Promise} Respuesta de la API
 */
async function updateAppointment(appointmentId, appointmentData) {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la cita');
    }
    
    return response.json();
}

/**
 * Obtiene los datos de una cita específica desde la API
 * @param {string} appointmentId - ID de la cita a obtener
 * @returns {Promise<Object>} Datos de la cita
 */
async function getAppointmentById(appointmentId) {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`);
    
    if (!response.ok) {
        throw new Error(`Error al obtener la cita: HTTP ${response.status}`);
    }
    
    return response.json();
}

/**
 * Elimina una cita desde la API
 * @param {string} appointmentId - ID de la cita a eliminar
 * @returns {Promise} Respuesta de la API
 */
async function deleteAppointment(appointmentId) {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, { 
        method: 'DELETE' 
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la cita');
    }
    
    return response.json();
}

// =====================================
// MANEJADORES DE ACCIONES
// =====================================

/**
 * Maneja la acción de modificar una cita
 * Obtiene los datos de la cita y abre el modal de modificación
 * @param {string} appointmentId - ID de la cita a modificar
 */
async function handleModifyAppointment(appointmentId) {
    try {
        // Obtener datos actuales de la cita
        const appointment = await getAppointmentById(appointmentId);
        
        // Abrir modal con los datos de la cita
        openModifyModal(
            appointment.id,
            appointment.office_id,
            appointment.date_appointment,
            appointment.reason_appointment,
            appointment.patient_ids || []
        );
    } catch (error) {
        console.error('Error al obtener datos de la cita:', error);
        alert('Error al obtener los datos de la cita: ' + error.message);
    }
}

/**
 * Maneja la acción de eliminar una cita
 * Muestra confirmación y procede con la eliminación
 * @param {string} appointmentId - ID de la cita a eliminar
 */
async function handleDeleteAppointment(appointmentId) {
    // Confirmar eliminación
    if (!confirm(`¿Estás seguro de que quieres eliminar la cita con ID: ${appointmentId}?`)) {
        return;
    }
    
    try {
        await deleteAppointment(appointmentId);
        alert('Cita eliminada exitosamente');
        fetchAppointments(); // Refrescar la lista
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        alert('Error eliminando cita: ' + error.message);
    }
}

// =====================================
// INICIALIZACIÓN Y EVENT LISTENERS
// =====================================

/**
 * Función de inicialización principal
 * Configura todos los event listeners y carga inicial de datos
 */
export function initialize() {
    // Event listener para el botón de crear nueva cita
    const addAppointmentBtn = document.getElementById('add-appointment-btn');
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', openCreateModal);
    }
    
    // Event listener para el formulario del modal (crear y modificar)
    const appointmentForm = document.getElementById('appointment-form-create');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentFormSubmit);
    }
    
    // Event listener para el filtro de fecha
    const filterDate = document.getElementById('filterDate');
    if (filterDate) {
        filterDate.addEventListener('change', fetchAppointments);
    }

    // Delegación de eventos para botones de acciones (modificar/eliminar)
    const appointmentsContainer = document.getElementById('appointmentsContainer');
    if (appointmentsContainer) {
        appointmentsContainer.addEventListener('click', (event) => {
            const target = event.target;
            
            // Buscar el botón más cercano al elemento clickeado
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
    
    // Cargar citas inicialmente
    fetchAppointments();
}