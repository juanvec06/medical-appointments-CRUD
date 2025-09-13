// Constantes que esta vista necesita
const API_URL = 'http://localhost:3000/api';

// --- Funciones de la Vista de Consultorios ---

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

// --- Función de Inicialización (Exportada) ---

export function initialize() {
  document.getElementById('officeForm').addEventListener('submit', handleOfficeFormSubmit);
  loadOffices();
}