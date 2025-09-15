// Este módulo proporciona funciones para mostrar modales de Bootstrap estilizados
// en lugar de los diálogos nativos del navegador.

// Obtenemos la instancia del modal una sola vez
const appModalElement = document.getElementById('app-modal');
const appModal = new bootstrap.Modal(appModalElement);

// Referencias a los elementos internos del modal
const modalTitle = document.getElementById('app-modal-title');
const modalBody = document.getElementById('app-modal-body');
const confirmBtn = document.getElementById('app-modal-confirm-btn');
const cancelBtn = document.getElementById('app-modal-cancel-btn');


/**
 * Muestra una alerta estilizada.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} title - (Opcional) El título del modal.
 */
export function showAlert(message, title = 'Aviso') {
  return new Promise((resolve) => {
    modalTitle.textContent = title;
    modalBody.textContent = message;

    // Adaptamos los botones para una alerta simple
    cancelBtn.style.display = 'none'; // Ocultamos el botón de cancelar
    confirmBtn.textContent = 'Aceptar';
    confirmBtn.className = 'btn btn-primary'; // Reseteamos la clase por si se cambió

    confirmBtn.onclick = () => {
      appModal.hide();
      resolve();
    };
    
    appModal.show();
  });
}

/**
 * Muestra un diálogo de confirmación estilizado.
 * @param {string} message - La pregunta de confirmación.
 * @param {string} title - (Opcional) El título del modal.
 * @returns {Promise<boolean>} - Resuelve a 'true' si se confirma, 'false' si se cancela.
 */
export function showConfirm(message, title = 'Confirmación') {
  return new Promise((resolve) => {
    modalTitle.textContent = title;
    modalBody.textContent = message;

    // Mostramos ambos botones para la confirmación
    cancelBtn.style.display = 'inline-block';
    confirmBtn.textContent = 'Confirmar';
    confirmBtn.className = 'btn btn-danger'; // Hacemos el botón de confirmar más llamativo para acciones destructivas

    appModal.show();

    // Si el usuario confirma
    confirmBtn.onclick = () => {
      appModal.hide();
      resolve(true);
    };

    // Si el usuario cancela
    cancelBtn.onclick = () => {
      appModal.hide();
      resolve(false);
    };
    
    // Si el usuario cierra el modal con la 'x' o haciendo clic fuera
    appModalElement.addEventListener('hidden.bs.modal', () => resolve(false), { once: true });
  });
}