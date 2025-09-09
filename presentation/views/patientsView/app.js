// app.js for patients view
const content = document.getElementById('content-area');

function renderPending(target) {
  content.innerHTML = `
    <div class="page-header">
      <div class="page-title">${capitalize(target)}</div>
      <div class="controls"><div class="muted">Funcionalidad pendiente — debe integrarse con backend</div></div>
    </div>
    <div class="muted">Esta sección está marcada como pendiente. Integración con backend no implementada.</div>
  `;
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

renderPending('Patients');
