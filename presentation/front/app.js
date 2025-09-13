// 1. IMPORTAR los inicializadores de cada módulo de vista.
// Usamos alias (con 'as') para darles nombres únicos.
import { initialize as initializePatients } from './views/patients/patients.js';
import { initialize as initializeAppointments } from './views/appointments/appointments.js';
import { initialize as initializeOffice } from './views/office/office.js';

// 2. ELEMENTO DOM principal
const contentArea = document.getElementById('app-content');

// 3. DEFINICIÓN DE RUTAS
// Cada ruta apunta al HTML de su vista y a su función de inicialización.
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

// 4. LÓGICA DEL ROUTER

/**
 * Carga el HTML de una vista, lo inyecta en la página y ejecuta su JS.
 * @param {string} path - La ruta del hash (ej. '#/patients')
 */
async function loadView(path) {
  const route = routes[path] || routes['#/patients']; // Ruta por defecto si no se encuentra

  try {
    // Cargar el snippet de HTML
    const response = await fetch(route.html);
    if (!response.ok) throw new Error(`No se pudo cargar ${route.html}`);
    const html = await response.text();

    // Inyectar el HTML en el contenedor principal
    contentArea.innerHTML = html;

    // Ejecutar la función de inicialización del módulo correspondiente
    route.init();

  } catch (error) {
    console.error('Error al cargar la vista:', error);
    contentArea.innerHTML = `<div class="alert alert-danger">Error al cargar el contenido de la página.</div>`;
  }
}

function router() {
  const path = window.location.hash || '#/patients';
  loadView(path);
  updateActiveNavLink(path);
}

function updateActiveNavLink(path) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === path);
  });
}

// 5. INICIALIZACIÓN
window.addEventListener('hashchange', router);
window.addEventListener('load', router);