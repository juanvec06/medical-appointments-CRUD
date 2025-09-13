const routes = {
  pacientes: {
    html: "patientView/patient.html",
    js: "patientView/appPatient.js",
  },
  oficinas: {
    html: "officeView/office.html",
    js: "officeView/appOffice.js",
  },
  citas: {
    html: "appointmentView/appointment.html",
    js: "appointmentView/appAppointment.js",
  },
};

async function loadView(view) {
  const route = routes[view];
  if (!route) {
    document.getElementById("dinamicContent").innerHTML =
      "<h3 class='text-danger'>Vista no encontrada</h3>";
    return;
  }

  // 1. Cargar el HTML de la vista
  const res = await fetch(route.html);
  const html = await res.text();
  document.getElementById("dinamicContent").innerHTML = html;

  // 2. Eliminar script anterior si existiera
  const oldScript = document.getElementById("viewScript");
  if (oldScript) oldScript.remove();

  // 3. Cargar el JS de la vista actual
  const script = document.createElement("script");
  script.src = route.js;
  script.id = "viewScript"; // identificador para poder quitarlo luego
  document.body.appendChild(script);
}

function router() {
  const hash = location.hash.slice(1) || "oficinas"; // vista por defecto
  loadView(hash);
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);
