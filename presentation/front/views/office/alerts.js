/**
 * Muestra una alerta nativa del navegador.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} title - (Opcional) No se usa en los nativos, se ignora.
 */
export function showAlert(message, title = 'Aviso') {
  return new Promise((resolve) => {
    alert(message);
    resolve();
  });
}

/**
 * Muestra un diálogo de confirmación nativo.
 * @param {string} message - La pregunta de confirmación.
 * @param {string} title - (Opcional) No se usa en los nativos, se ignora.
 * @returns {Promise<boolean>} - Resuelve a 'true' si se confirma, 'false' si se cancela.
 */
export function showConfirm(message, title = 'Confirmación') {
  return new Promise((resolve) => {
    const result = confirm(message);
    resolve(result);
  });
}
