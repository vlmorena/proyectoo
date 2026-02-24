// ─────────────────────────────────────────
//  TUBELLEZA – script.js
//  Lógica de turnos, modales y agenda
// ─────────────────────────────────────────

// ── DATOS ──────────────────────────────────
let turnos = JSON.parse(localStorage.getItem('tubelleza_turnos') || '[]');

function save() {
  localStorage.setItem('tubelleza_turnos', JSON.stringify(turnos));
}

// ── ESTADO SEMANA ──────────────────────────
let semanaOffset = 0;
let diaSeleccionado = null;

// ── UTILIDADES DE FECHA ────────────────────
function toISO(d) {
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0');
}

function getLunes(offset) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dow = hoy.getDay();
  const diffLunes = dow === 0 ? -6 : 1 - dow;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + diffLunes + offset * 7);
  return lunes;
}

function formatDateNice(iso) {
  const [y, m, d] = iso.split('-');
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const dt = new Date(+y, +m - 1, +d);
  return `${dias[dt.getDay()]} ${+d} de ${meses[+m - 1]} de ${y}`;
}

// ── CALENDARIO SEMANAL ────────────────────
function renderCalendario() {
  const lunes  = getLunes(semanaOffset);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  const hoyISO = toISO(new Date());
  const meses  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  document.getElementById('weekLabel').textContent =
    `${lunes.getDate()} ${meses[lunes.getMonth()]} – ${domingo.getDate()} ${meses[domingo.getMonth()]} ${domingo.getFullYear()}`;

  // Armar array con los 7 días de la semana
  const diasSemana = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    diasSemana.push(toISO(d));
  }

  const totalSemana = turnos.filter(t => diasSemana.includes(t.fecha)).length;
  document.getElementById('weekCount').textContent =
    totalSemana > 0 ? `${totalSemana} turno${totalSemana !== 1 ? 's' : ''} esta semana` : '';

  // Día seleccionado por defecto
  if (!diaSeleccionado || !diasSemana.includes(diaSeleccionado)) {
    diaSeleccionado = diasSemana.includes(hoyISO) ? hoyISO : toISO(lunes);
  }

  const nombres = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const grid = document.getElementById('weekGrid');
  grid.innerHTML = '';

  diasSemana.forEach((iso, i) => {
    const dd    = iso.split('-')[2];
    const lista = turnos.filter(t => t.fecha === iso).sort((a, b) => a.hora.localeCompare(b.hora));
    const col   = document.createElement('div');

    col.className = 'day-col'
      + (iso === hoyISO ? ' today' : '')
      + (iso === diaSeleccionado ? ' selected' : '');

    col.onclick = () => { diaSeleccionado = iso; renderCalendario(); };

    let pillsHTML = '';
    lista.slice(0, 2).forEach(t => {
      pillsHTML += `<div class="day-pill">${t.hora} ${t.nombre.substring(0, 5)}</div>`;
    });
    if (lista.length > 2) pillsHTML += `<div class="day-more">+${lista.length - 2} más</div>`;

    col.innerHTML = `
      <span class="day-name">${nombres[i]}</span>
      <span class="day-num">${+dd}</span>
      <div class="day-pills">${pillsHTML}</div>`;

    grid.appendChild(col);
  });

  renderDetalle(diaSeleccionado);
}

function renderDetalle(iso) {
  const det   = document.getElementById('detalleDia');
  const lista = turnos.filter(t => t.fecha === iso).sort((a, b) => a.hora.localeCompare(b.hora));

  let html = `<div class="det-title">📅 ${formatDateNice(iso)}</div>`;

  if (!lista.length) {
    html += `<div class="det-empty">No hay turnos agendados para este día.</div>`;
  } else {
    lista.forEach(t => {
      html += `
        <div class="turno-card">
          <div class="turno-info">
            <strong>${t.nombre} ${t.apellido}</strong>
            <span>🕐 ${t.hora} hs</span>
            <span class="turno-badge">${t.tratamiento}</span>
          </div>
          <div class="turno-actions">
            <button class="btn-action btn-edit"   onclick="editarTurno('${t.id}')">Editar</button>
            <button class="btn-action btn-delete" onclick="eliminarTurno('${t.id}')">Eliminar</button>
          </div>
        </div>`;
    });
  }

  det.innerHTML = html;
}

function cambiarSemana(n) { semanaOffset += n; renderCalendario(); }
function irHoy()          { semanaOffset = 0; diaSeleccionado = toISO(new Date()); renderCalendario(); }

// ── MODALES ───────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('active');
  if (id === 'modalCalendario') renderCalendario();
  if (id === 'modalRegistro')   document.getElementById('fecha').min = toISO(new Date());
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  if (id === 'modalRegistro') resetForm();
}

// Cerrar modal al hacer clic fuera
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
});

// ── FORMULARIO ────────────────────────────
function resetForm() {
  document.getElementById('formTurno').reset();
  document.getElementById('editId').value = '';
  document.getElementById('btnSubmitLabel').textContent = 'Confirmar turno';
}

function guardarTurno(e) {
  e.preventDefault();
  const id = document.getElementById('editId').value;

  const turno = {
    id:          id || Date.now().toString(),
    nombre:      document.getElementById('nombre').value.trim(),
    apellido:    document.getElementById('apellido').value.trim(),
    tratamiento: document.getElementById('tratamiento').value,
    fecha:       document.getElementById('fecha').value,
    hora:        document.getElementById('hora').value,
  };

  if (id) {
    const idx = turnos.findIndex(t => t.id === id);
    if (idx !== -1) turnos[idx] = turno;
    showToast('✓ Turno actualizado');
  } else {
    turnos.push(turno);
    showToast('✓ Turno registrado');
  }

  save();
  closeModal('modalRegistro');
}

// ── EDITAR TURNO ──────────────────────────
function editarTurno(id) {
  const t = turnos.find(x => x.id === id);
  if (!t) return;

  closeModal('modalCalendario');
  document.getElementById('editId').value       = t.id;
  document.getElementById('nombre').value       = t.nombre;
  document.getElementById('apellido').value     = t.apellido;
  document.getElementById('tratamiento').value  = t.tratamiento;
  document.getElementById('fecha').value        = t.fecha;
  document.getElementById('hora').value         = t.hora;
  document.getElementById('btnSubmitLabel').textContent = 'Guardar cambios';
  openModal('modalRegistro');
}

// ── ELIMINAR TURNO ────────────────────────
function eliminarTurno(id) {
  if (!confirm('¿Eliminar este turno?')) return;
  turnos = turnos.filter(t => t.id !== id);
  save();
  renderCalendario();
  showToast('Turno eliminado');
}

// ── TOAST ─────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
