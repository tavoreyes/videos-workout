document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('videoForm');
  const categoriasSelect = document.getElementById('categorias');
  const nuevaCategoriaInput = document.getElementById('nuevaCategoria');
  const videosList = document.getElementById('videosList');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const formContainer = document.getElementById('formContainer');
  const toggleFormBtn = document.getElementById('toggleFormBtn');
  let categorias = [];
  let videos = [];
  let formVisible = true;

  function cargarCategorias() {
    fetch('/categorias').then(r => r.json()).then(data => {
      categorias = data;
      categoriasSelect.innerHTML = '';
      filtroCategoria.innerHTML = '<option value="">Todas</option>';
      categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        categoriasSelect.appendChild(opt);
        const filtroOpt = document.createElement('option');
        filtroOpt.value = cat;
        filtroOpt.textContent = cat;
        filtroCategoria.appendChild(filtroOpt);
      });
    });
  }

  function cargarVideos() {
    fetch('/videos').then(r => r.json()).then(data => {
      videos = data;
      mostrarVideos();
    });
  }

  function mostrarVideos() {
    const filtro = filtroCategoria.value;
    videosList.innerHTML = '';
    videos.filter(v => !filtro || v.categorias.split(',').includes(filtro)).forEach(video => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';
      col.innerHTML = `
        <div class="card h-100">
          <img src="${video.miniatura_url}" class="card-img-top" alt="Miniatura">
          <div class="card-body">
            <div class="mb-2">
              ${video.categorias.split(',').map(cat => `<span class="badge bg-info me-1">${cat}</span>`).join('')}
            </div>
            <h5 class="card-title">${video.titulo.length > 60 ? video.titulo.slice(0, 60) + '...' : video.titulo}</h5>
            <p class="card-text">${video.descripcion && video.descripcion.length > 300 ? video.descripcion.slice(0, 300) + '...' : (video.descripcion || '')}</p>
            <div class="row mt-3 gx-1 justify-content-center">
              <div class="col-4 d-flex justify-content-center">
                <a href="${video.url}" target="_blank" class="btn btn-sm btn-outline-primary" title="Ver video">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM8 13.5c-4.478 0-7.5-4.5-7.5-5.5S3.522 2.5 8 2.5s7.5 4.5 7.5 5.5-3.022 5.5-7.5 5.5z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                  </svg>
                </a>
              </div>
              <div class="col-4 d-flex justify-content-center">
                <button class="btn btn-sm btn-warning" onclick="editarVideo(${video.id})" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-4 1a.5.5 0 0 1-.62-.62l1-4a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 12.5 5.793 10.207 3.5l1-1zM10.5 4.207 12.793 6.5l-8.147 8.146-2.853.713.713-2.853L10.5 4.207z"/>
                  </svg>
                </button>
              </div>
              <div class="col-4 d-flex justify-content-center">
                <button class="btn btn-sm btn-success" onclick="marcarSeguimiento(${video.id})" title="Marcar seguimiento">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1z"/>
                    <path d="M10.97 5.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02l-2.99-2.99a.75.75 0 1 1 1.06-1.06l2.47 2.47 3.47-4.47z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div id="editForm${video.id}" style="display:none;" class="mt-2">
              <input type="text" class="form-control mb-1" id="editTitulo${video.id}" value="${video.titulo}">
              <input type="text" class="form-control mb-1" id="editDescripcion${video.id}" value="${video.descripcion}">
              <select multiple class="form-select mb-1" id="editCategorias${video.id}">
                ${categorias.map(cat => `<option value="${cat}" ${video.categorias.split(',').includes(cat) ? 'selected' : ''}>${cat}</option>`).join('')}
              </select>
              <button class="btn btn-sm btn-success" onclick="guardarEdicion(${video.id})">Guardar cambios</button>
            </div>
          </div>
        </div>
      `;
      videosList.appendChild(col);
    });
  window.marcarSeguimiento = function(video_id) {
    const fecha = new Date().toISOString().slice(0,10);
    fetch('/marcar_seguimiento', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ video_id, fecha })
    })
    .then(r => {
      if (!r.ok) return r.json().then(err => Promise.reject(err));
      return r.json();
    })
    .then(() => {
      alert('¡Seguimiento registrado!');
    })
    .catch(err => alert(err.detail || 'Error al registrar seguimiento'));
  };
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const url = document.getElementById('url').value;
    const categoriasSeleccionadas = Array.from(categoriasSelect.selectedOptions).map(opt => opt.value);
    const nuevaCategoria = nuevaCategoriaInput.value.trim();
    fetch('/agregar_video', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ url, categorias: categoriasSeleccionadas, nueva_categoria: nuevaCategoria })
    })
    .then(r => {
      if (!r.ok) return r.json().then(err => Promise.reject(err));
      return r.json();
    })
    .then(() => {
      form.reset();
      cargarCategorias();
      cargarVideos();
    })
    .catch(err => alert(err.detail || 'Error al guardar'));
  });

  filtroCategoria.addEventListener('change', mostrarVideos);

  toggleFormBtn.addEventListener('click', () => {
    formVisible = !formVisible;
    formContainer.style.display = formVisible ? 'block' : 'none';
    toggleFormBtn.textContent = formVisible ? 'Ocultar formulario' : 'Mostrar formulario';
  });

  window.editarVideo = function(id) {
    document.getElementById('editForm'+id).style.display = 'block';
  };

  window.guardarEdicion = function(id) {
    const titulo = document.getElementById('editTitulo'+id).value;
    const descripcion = document.getElementById('editDescripcion'+id).value;
    const categoriasSeleccionadas = Array.from(document.getElementById('editCategorias'+id).selectedOptions).map(opt => opt.value);
    fetch(`/editar_video/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ titulo, descripcion, categorias: categoriasSeleccionadas })
    })
    .then(r => {
      if (!r.ok) return r.json().then(err => Promise.reject(err));
      return r.json();
    })
    .then(() => {
      cargarVideos();
    })
    .catch(err => alert(err.detail || 'Error al editar'));
  };

  cargarCategorias();
  cargarVideos();
});
