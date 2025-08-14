document.addEventListener('DOMContentLoaded', () => {
  const calendar = document.getElementById('calendar');
  const detalle = document.getElementById('seguimientoDetalle');

  function fetchSeguimientos() {
    fetch('/seguimientos')
      .then(r => r.json())
      .then(data => renderCalendar(data));
  }

  function renderCalendar(seguimientos) {
    // Agrupar por fecha
    const fechas = {};
    seguimientos.forEach(s => {
      if (!fechas[s.fecha]) fechas[s.fecha] = [];
      fechas[s.fecha].push(s);
    });
    // Obtener fechas únicas
    const dias = Object.keys(fechas).sort();
    let html = '<div class="row">';
    dias.forEach(fecha => {
      html += `<div class="col-6 col-md-3 mb-3">
        <div class="card h-100">
          <div class="card-body text-center">
            <h5 class="card-title">${fecha}</h5>
            <button class="btn btn-primary btn-sm" onclick="mostrarDetalle('${fecha}')">Ver ejercicios</button>
          </div>
        </div>
      </div>`;
    });
    html += '</div>';
    calendar.innerHTML = html;
    window.mostrarDetalle = function(fecha) {
      const ejercicios = fechas[fecha] || [];
      let dhtml = `<h4>Ejercicios del ${fecha}</h4>`;
      dhtml += '<ul class="list-group">';
        ejercicios.forEach(ej => {
          dhtml += `<li class="list-group-item">
            <strong>${ej.titulo}</strong><br>
            <span class="badge bg-info">${ej.categorias}</span><br>
            <a href="${ej.url}" target="_blank">Ver video</a>
            <button class="btn btn-danger btn-sm ms-2" onclick="eliminarSeguimiento('${fecha}', '${ej.video_id}')">Eliminar</button>
          </li>`;
      });
      dhtml += '</ul>';
      detalle.innerHTML = dhtml;
    };
  }

  window.eliminarSeguimiento = function(fecha, video_id) {
    if (!confirm('¿Eliminar este seguimiento?')) return;
    fetch(`/eliminar_seguimiento?fecha=${encodeURIComponent(fecha)}&video_id=${encodeURIComponent(video_id)}`, {
      method: 'DELETE'
    })
    .then(r => {
      if (r.ok) {
        fetchSeguimientos();
        detalle.innerHTML = '<div class="alert alert-success">Seguimiento eliminado.</div>';
      } else {
        detalle.innerHTML += '<div class="alert alert-danger">Error al eliminar seguimiento.</div>';
      }
    });
  }

  fetchSeguimientos();
});
