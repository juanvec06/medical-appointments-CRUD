// app.js for office view
const content = document.getElementById('content-area');

function renderPending(target) {
  
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("officeForm");
  const container = document.getElementById("officesContainer");

  // Función para cargar oficinas al inicio
  async function loadOffices() {
  container.innerHTML = "Cargando...";
  try {
    const res = await fetch("http://localhost:3000/api/offices");
    const offices = await res.json();

    if (!offices || offices.length === 0) {
      container.innerHTML = `
        <div class="list-group-item text-muted">
          No hay oficinas registradas todavía. Usa el formulario para crear una.
        </div>`;
      return;
    }

    container.innerHTML = "";
    offices.forEach((o) => {
      const item = document.createElement("div");
      item.className = "list-group-item";
      item.textContent = `${o.name_office} — ${o.location_office}`;
      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = `
      <div class="list-group-item text-danger">
        Ocurrió un error al conectar con el servidor.
      </div>`;
    console.error(err);
  }
}


  // Manejar el envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const office = {
      name_office: form.name_office.value,
      location_office: form.location_office.value
    };

    try {
      await fetch("http://localhost:3000/api/offices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(office),
      });

      if (!res.ok) {
        const error = await res.json();
        alert("Error: " + error.error);
        return;
      }

      form.reset();
      await loadOffices(); // refrescar la lista
    } catch (err) {
      console.error("Error creando oficina", err);
    }
  });

  // Cargar oficinas al iniciar
  loadOffices();
});


function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

renderPending('Office');
