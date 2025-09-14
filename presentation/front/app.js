/**
 * @fileoverview Archivo principal de la aplicación de una sola página (SPA).
 * Contiene el router del lado del cliente que carga dinámicamente las vistas (pacientes, citas, etc.)
 * sin necesidad de recargar la página completa.
 * @module app
 */

// --- 1. IMPORTACIONES DE MÓDULOS DE VISTA ---

import { initialize as initializePatients } from './views/patients/patients.js';
import { initialize as initializeAppointments } from './views/appointments/appointments.js';
import { initialize as initializeOffice } from './views/office/office.js';

// --- 2. REFERENCIAS AL DOM ---

/**
 * El contenedor principal donde se inyectará el contenido HTML de cada vista.
 * @type {HTMLElement}
 */
const contentArea = document.getElementById('app-content');

// --- 3. DEFINICIÓN DE RUTAS ---

/**
 * Representa la configuración de una ruta de la aplicación.
 * @typedef {object} RouteConfig
 * @property {string} html - La ruta al archivo HTML de la vista.
 * @property {function(): void} init - La función de inicialización que se ejecuta después de cargar el HTML de la vista.
 */

/**
 * Mapeo de las rutas de la aplicación (hashes de URL) a sus correspondientes configuraciones de vista.
 * @type {Object<string, RouteConfig>}
 */
const routes = {
  '#/patients': {
    html: './views/patients/patients.html',
    init: initializePatients
  },
  '#/appointments': {
    html: './views/appointments/appointments.html',
    init: initializeAppointments
  },
  '#/office': {
    html: './views/office/office.html',
    init: initializeOffice
  },
};

// --- 4. LÓGICA DEL ROUTER ---

/**
 * Carga el HTML de una vista de forma asíncrona, lo inyecta en el contenedor principal
 * de la página y ejecuta su script de inicialización.
 * Si la ruta no es válida, carga la vista por defecto ('#/patients').
 * @async
 * @param {string} path - La ruta del hash de la URL (ej. '#/patients').
 */
async function loadView(path) {
  const route = routes[path] || routes['#/patients']; // Ruta por defecto si no se encuentra

  try {
    const response = await fetch(route.html);
    if (!response.ok) throw new Error(`No se pudo cargar ${route.html}`);
    const html = await response.text();

    contentArea.innerHTML = html;
    route.init(); // Ejecutar la función de inicialización del módulo

  } catch (error) {
    console.error('Error al cargar la vista:', error);
    contentArea.innerHTML = `<div class="alert alert-danger">Error al cargar el contenido de la página.</div>`;
  }
}

/**
 * Controlador principal del router. Lee el hash de la URL actual,
 * carga la vista correspondiente y actualiza el estado activo del enlace de navegación.
 */
function router() {
  const path = window.location.hash || '#/patients';
  loadView(path);
  updateActiveNavLink(path);
}

/**
 * Actualiza la clase 'active' en los enlaces de la barra de navegación para que coincida
 * con la ruta actual, proporcionando feedback visual al usuario.
 * @param {string} path - La ruta activa actual.
 */
function updateActiveNavLink(path) {
  document.querySelectorAll('.nav-link').forEach(link => {
    // Compara el href del enlace con la ruta y añade/quita la clase 'active'.
    link.classList.toggle('active', link.getAttribute('href') === path);
  });
}

// --- 5. INICIALIZACIÓN DE LA APLICACIÓN ---

/**
 * Se asignan los listeners a los eventos de la ventana para activar el router.
 * 'hashchange' se dispara cuando cambia la URL (ej. el usuario hace clic en un enlace de navegación).
 * 'load' se dispara cuando la página se carga por primera vez.
 */
window.addEventListener('hashchange', router);
window.addEventListener('load', router);