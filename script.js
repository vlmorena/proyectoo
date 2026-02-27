document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formTurno');
    if (form) form.addEventListener('submit', guardarTurno);
});

// Función para abrir modales (Ahora sí funcionará)
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex'; // Forzamos que se vea
        if (id === 'modalCalendario') cargarTurnos();
    }
}

// Función para cerrar modales
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// GUARDAR EN LA BASE DE DATOS
async function guardarTurno(e) {
    e.preventDefault();
    const datos = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        tratamiento: document.getElementById('tratamiento').value,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value
    };

    try {
        const response = await fetch('guardar_turno.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(datos)
        });
        const res = await response.json();
        if(res.status === "success") {
            alert("¡Turno guardado en la base de datos!");
            closeModal('modalRegistro');
            e.target.reset();
        }
    } catch (error) {
        alert("Error: Asegúrate que XAMPP tenga Apache y MySQL encendidos.");
    }
}

// CARGAR DESDE LA BASE DE DATOS
async function cargarTurnos() {
    const contenedor = document.getElementById('listaTurnos');
    contenedor.innerHTML = "Cargando turnos...";
    try {
        const response = await fetch('obtener_turnos.php');
        const turnos = await response.json();
        contenedor.innerHTML = "";
        if(turnos.length === 0) {
            contenedor.innerHTML = "No hay turnos agendados.";
            return;
        }
        turnos.forEach(t => {
            contenedor.innerHTML += `
                <div style="border-bottom:1px solid #ddd; padding:10px;">
                    <strong>${t.nombre} ${t.apellido}</strong><br>
                    <span>📅 ${t.fecha} - 🕐 ${t.hora}hs</span><br>
                    <small>Tratamiento: ${t.tratamiento}</small>
                </div>`;
        });
    } catch (error) {
        contenedor.innerHTML = "Error al conectar con la base de datos.";
    }
}