window.onload = function () {

    window.agregarProceso = function () {
    const tabla = document.getElementById('tabla-procesos');
    const tbody = document.getElementById('tbody-procesos');
    const filas = tbody.getElementsByTagName('tr');
    const nuevaFila = document.createElement('tr');

    const nuevoID = `P${filas.length + 1}`;

    // Obtener cuántas columnas de tiempo hay realmente
    const subfila = document.getElementById('subfila-principal');
    const cantidadTiempos = subfila.children.length;

    // ID (no editable)
    const celdaID = document.createElement('td');
    celdaID.contentEditable = false;
    celdaID.textContent = nuevoID;    
    nuevaFila.appendChild(celdaID);

    // Nombre y Memoria a usar (editable)
    const celdaNombre = document.createElement('td');
    celdaNombre.contentEditable = true;
    nuevaFila.appendChild(celdaNombre);

    const celdaMemoria = document.createElement('td');
    celdaMemoria.contentEditable = true;
    nuevaFila.appendChild(celdaMemoria);

    // Celdas de tiempo (editable, basado en la cantidad real de tiempos)
    for (let i = 0; i < cantidadTiempos; i++) {
        const celdaTiempo = document.createElement('td');
        celdaTiempo.contentEditable = true;
        nuevaFila.appendChild(celdaTiempo);
    }

    tbody.appendChild(nuevaFila);
};


    // Lo mismo para las otras funciones...
    window.eliminarUltimoProceso = function () {
        const tbody = document.getElementById('tbody-procesos');
        if (tbody.rows.length > 0) {
            tbody.deleteRow(tbody.rows.length - 1);
        }
    };

    window.agregarTiempo = function () {
        const tabla = document.getElementById('tabla-procesos');
        const filaTiempos = document.getElementById('subfila-principal');
        const headersTiempo = filaTiempos.children.length;
        const nuevoTiempo = headersTiempo + 1;

        const th = document.createElement('th');
        th.textContent = `Tiempo ${nuevoTiempo}`;
        filaTiempos.appendChild(th);

        const filaPrincipal = document.getElementById('fila-principal');
        filaPrincipal.querySelector('.tiempo-header').colSpan = nuevoTiempo;

        const tbody = document.getElementById('tbody-procesos');
        for (const fila of tbody.rows) {
            const nuevaCelda = document.createElement('td');
            nuevaCelda.contentEditable = true;
            fila.appendChild(nuevaCelda);
        }
    };

    window.eliminarUltimoTiempo = function () {
        const filaTiempos = document.getElementById('subfila-principal');
        const tiempos = filaTiempos.children.length;
        if (tiempos > 0) {
            filaTiempos.removeChild(filaTiempos.lastElementChild);

            const filaPrincipal = document.getElementById('fila-principal');
            filaPrincipal.querySelector('.tiempo-header').colSpan = tiempos - 1;

            const tbody = document.getElementById('tbody-procesos');
            for (const fila of tbody.rows) {
                fila.removeChild(fila.lastElementChild);
            }
        }
    };

    window.leerTabla = function () {
        const tabla = document.getElementById('tabla-procesos');
        const datos = [];
        for (const fila of tabla.tBodies[0].rows) {
            const filaDatos = [];
            for (const celda of fila.cells) {
                filaDatos.push(celda.textContent.trim());
            }
            datos.push(filaDatos);
        }
        console.log('Datos de la tabla:', datos);
    };
};
