// Bloque de importación ---------------------------------------------------------------------------
import * as particionesFijas from "./particionesFijas.js";
import * as particionesVariables from "./particionesVariables.js";
import * as particionesConCompactacion from "./AlgoParticionDinamicaConCompactacion.mjs";
import * as particionesSinCompactacion from "./AlgoParticionDinamicaSinCompactacion.mjs";

// Listeners mamahuevo----------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
	document
		.getElementById("btn-leerTabla")
		.addEventListener("click", leerTablaProcesos);
	document
		.getElementById("btn-agregarProceso")
		.addEventListener("click", agregarProceso);
	document
		.getElementById("btn-eliminarUltimoProceso")
		.addEventListener("click", eliminarUltimoProceso);
	document
		.getElementById("btn-agregarTiempo")
		.addEventListener("click", agregarTiempo);
	document
		.getElementById("btn-eliminarUltimoTiempo")
		.addEventListener("click", eliminarUltimoTiempo);
	document.getElementById("Simular-btn").addEventListener("click", simular);
});

// Funciones mamahuevo---------------------------------------------------------------------------
async function simular() {
	// Apartado para la constante os ----------------------------------------------------------------
	const osWeight = document.getElementById("os-weight").textContent.trim();

	// Obtener la fila que contiene la celda "t1"
	const subfila = document.getElementById("subfila-principal");
	const celdas = subfila.querySelectorAll("th");
	let contar = false;
	const osTiempos = [];

	celdas.forEach((celda, index) => {
		if (contar) {
			osTiempos.push(index);
		}
		if (celda.textContent.trim() === "t1") {
			contar = true;
			osTiempos.push(index);
		}
	});

	if (!/^[1-9]\d*$/.test(osWeight)) {
		return alert(
			"El peso del OS debe ser un número entero positivo mayor que cero"
		);
	}

	let os = crearProceso(
		"P0",
		document.getElementById("os-name").textContent.trim(),
		BigInt(osWeight),
		osTiempos,
		{ 0: { start: 0n, finish: 1048575n } }
	);
	console.log(os);
	// -------------------------------------------------------------------------------------------

	const procesos = leerTablaProcesos();
	if (!procesos) return;

	const selector = document.getElementById("selector");
	const seleccion = selector.value;

	// Limpiar resultados previos si hay
	const resultadosContenedor = document.getElementById("resultados");
	resultadosContenedor.innerHTML = "";

	for (let i = 1; i <= osTiempos.length; i++) {
		let resultado;

		switch (seleccion) {
			case "1":
				alert("Manu hace esta mkda");
				return;
			case "2":
				alert("Manu hace esta mkda");
				return;
			case "3":
				// La función debe retornar { procesos, bloquesOcupados }
				resultado = particionesSinCompactacion.gestionarMemoriaConFragmentacion(
					procesos,
					i,
					os
				);
				break;
			case "4":
				resultado = particionesConCompactacion.gestionarMemoriaConTiempos(
					procesos,
					i,
					os
				);
				break;
			default:
				alert("jaiiii niño, usted como llego aqui??");
				return;
		}

		// Crear tabla de procesos para el tiempo i
		const tablaProcesos = crearTablaProcesos(resultado.procesos, i.toString());

		// Crear tabla descripción para el tiempo i
		const tablaDescripcion = crearTablaDescripcion(resultado.bloquesOcupados);

		// Contenedor para el tiempo i
		const contenedorTiempo = document.createElement("div");
		contenedorTiempo.style.border = "1px solid #ccc";
		contenedorTiempo.style.margin = "1em 0";
		contenedorTiempo.style.padding = "0.5em";

		const titulo = document.createElement("h3");
		titulo.textContent = `Tiempo t${i}`;
		contenedorTiempo.appendChild(titulo);

		contenedorTiempo.appendChild(tablaProcesos);
		contenedorTiempo.appendChild(tablaDescripcion);

		resultadosContenedor.appendChild(contenedorTiempo);
	}
}

function crearTablaProcesos(procesos, tiempo) {
  const tabla = document.createElement("table");
  tabla.id = "tabla-procesos";

  // Crear thead con dos filas según estructura
  const thead = document.createElement("thead");
  thead.id = "thead-procesos";

  const filaPrincipal = document.createElement("tr");
  filaPrincipal.id = "fila-principal";

  const thPid = document.createElement("th");
  thPid.rowSpan = 2;
  thPid.textContent = "PID";
  filaPrincipal.appendChild(thPid);

  const thLo = document.createElement("th");
  thLo.rowSpan = 2;
  thLo.textContent = "L/O";
  filaPrincipal.appendChild(thLo);

  const thBase = document.createElement("th");
  thBase.colSpan = 2;
  thBase.classList.add("bloqueo-header");
  thBase.textContent = "Base";
  filaPrincipal.appendChild(thBase);

  const subfilaPrincipal = document.createElement("tr");
  subfilaPrincipal.id = "subfila-principal";

  const thDec = document.createElement("th");
  thDec.textContent = "DEC";
  subfilaPrincipal.appendChild(thDec);

  const thHex = document.createElement("th");
  thHex.textContent = "HEX";
  subfilaPrincipal.appendChild(thHex);

  thead.appendChild(filaPrincipal);
  thead.appendChild(subfilaPrincipal);

  tabla.appendChild(thead);

  // Crear tbody
  const tbody = document.createElement("tbody");
  tbody.id = "tbody-procesos";

  // Recorrer procesos para crear filas
  procesos.forEach((proceso, index) => {
    const tr = document.createElement("tr");

    // PID (ID o nombre)
    const tdPid = document.createElement("td");
    tdPid.contentEditable = index === 0 ? "false" : "true"; // SO no editable
    tdPid.textContent = proceso.name || proceso.nombre || "0";
    tr.appendChild(tdPid);

    // L/O (en el ejemplo siempre es 1 para procesos y 0 para SO? Aquí lo dejamos 1 excepto SO)
    const tdLo = document.createElement("td");
    tdLo.contentEditable = index === 0 ? "false" : "true";
    tdLo.textContent = index === 0 ? "1" : "1"; // Puedes ajustar si tienes otro dato para esto
    tr.appendChild(tdLo);

    // Base DEC (Posición inicio de memoria para el tiempo dado)
    const tdDec = document.createElement("td");
    tdDec.contentEditable = index === 0 ? "false" : "true";

    const posicion = proceso.positions?.[tiempo];
    tdDec.textContent = posicion ? posicion.start.toString() : "0";
    tr.appendChild(tdDec);

    // Base HEX (convertir a hexadecimal sin 0x y en mayúsculas)
    const tdHex = document.createElement("td");
    tdHex.contentEditable = index === 0 ? "false" : "true";

    if (posicion) {
      tdHex.textContent = posicion.start.toString(16).toUpperCase().padStart(6, "0");
    } else {
      tdHex.textContent = "000000";
    }
    tr.appendChild(tdHex);

    tbody.appendChild(tr);
  });

  tabla.appendChild(tbody);

  return tabla;
}


export function crearTablaDescripcion(bloquesOcupados) {
  if (!Array.isArray(bloquesOcupados)) {
    console.warn("bloquesOcupados no es un arreglo válido.");
    return document.createTextNode("Error: no se pudo generar la tabla.");
  }

  const tabla = document.createElement("table");
  tabla.style.border = "black";

  // ----- Encabezado -----
  const thead = document.createElement("thead");
  const filaEncabezado = document.createElement("tr");

  const thDireccion = document.createElement("th");
  thDireccion.textContent = "Dirección";
  filaEncabezado.appendChild(thDireccion);

  const thNombre = document.createElement("th");
  thNombre.textContent = "Proceso";
  filaEncabezado.appendChild(thNombre);

  const thTamano = document.createElement("th");
  thTamano.textContent = "Tamaño (bytes)";
  filaEncabezado.appendChild(thTamano);

  thead.appendChild(filaEncabezado);
  tabla.appendChild(thead);

  // ----- Cuerpo de la tabla -----
  const tbody = document.createElement("tbody");

  // Orden inverso para simular pila
  const bloquesOrdenados = bloquesOcupados
    .slice()
    .sort((a, b) => (a.start < b.start ? -1 : 1))
    .reverse();

  bloquesOrdenados.forEach((bloque, index) => {
    const fila = document.createElement("tr");

    // Dirección
    const tdDireccion = document.createElement("td");
    const divDireccion = document.createElement("div");
    divDireccion.className = "vacio";
    divDireccion.textContent = bloque.start.toString();
    tdDireccion.appendChild(divDireccion);
    fila.appendChild(tdDireccion);

    // Proceso
    const tdNombre = document.createElement("td");
    const divNombre = document.createElement("div");

    if (bloque.name === "SO" || bloque.name === "S. O") {
      divNombre.className = "so";
      divNombre.textContent = "S. O";
    } else if (!bloque.name || bloque.name === "0" || bloque.name === "") {
      divNombre.className = "vacio";
      divNombre.textContent = "";
    } else {
      divNombre.className = "ejecucion";
      divNombre.textContent = bloque.name;
    }

    tdNombre.appendChild(divNombre);
    fila.appendChild(tdNombre);

    // Tamaño
    const tdTamano = document.createElement("td");
    const divTamano = document.createElement("div");
    divTamano.className = divNombre.className; // misma clase visual
    const tamano = (bloque.finish - bloque.start + 1n).toString();
    divTamano.textContent = tamano;
    tdTamano.appendChild(divTamano);
    fila.appendChild(tdTamano);

    // 🔶 Última fila fondo amarillo
    if (index === bloquesOrdenados.length - 1) {
      fila.style.backgroundColor = "yellow";
    }

    tbody.appendChild(fila);
  });

  tabla.appendChild(tbody);
  return tabla;
}


function agregarProceso() {
	const tbody = document.getElementById("tbody-procesos");
	const filas = tbody.getElementsByTagName("tr");
	const nuevaFila = document.createElement("tr");

	const nuevoID = `P${filas.length + 1}`;

	const subfila = document.getElementById("subfila-principal");
	const cantidadTiempos = subfila.children.length;

	const celdaID = document.createElement("td");
	celdaID.contentEditable = false;
	celdaID.textContent = nuevoID;
	nuevaFila.appendChild(celdaID);

	const celdaNombre = document.createElement("td");
	celdaNombre.contentEditable = true;
	nuevaFila.appendChild(celdaNombre);

	const celdaMemoria = document.createElement("td");
	celdaMemoria.contentEditable = true;
	nuevaFila.appendChild(celdaMemoria);

	for (let i = 0; i < cantidadTiempos; i++) {
		const celdaTiempo = document.createElement("td");
		celdaTiempo.contentEditable = true;
		nuevaFila.appendChild(celdaTiempo);
	}

	tbody.appendChild(nuevaFila);
}

function eliminarUltimoProceso() {
	const tbody = document.getElementById("tbody-procesos");
	if (tbody.rows.length > 0) {
		tbody.deleteRow(tbody.rows.length - 1);
	}
}

function agregarTiempo() {
	const filaTiempos = document.getElementById("subfila-principal");
	const nuevoTiempo = filaTiempos.children.length + 1;

	const th = document.createElement("th");
	th.textContent = `t${nuevoTiempo}`;
	th.rowSpan = "2";
	filaTiempos.appendChild(th);

	const filaPrincipal = document.getElementById("fila-principal");
	filaPrincipal.querySelector(".tiempo-header").colSpan = nuevoTiempo;

	const tbody = document.getElementById("tbody-procesos");
	for (const fila of tbody.rows) {
		const nuevaCelda = document.createElement("td");
		nuevaCelda.contentEditable = true;
		fila.appendChild(nuevaCelda);
	}
}

function eliminarUltimoTiempo() {
	const filaTiempos = document.getElementById("subfila-principal");
	const tiempos = filaTiempos.children.length;
	if (tiempos > 0) {
		filaTiempos.removeChild(filaTiempos.lastElementChild);

		const filaPrincipal = document.getElementById("fila-principal");
		filaPrincipal.querySelector(".tiempo-header").colSpan = tiempos - 1;

		const tbody = document.getElementById("tbody-procesos");
		for (const fila of tbody.rows) {
			fila.removeChild(fila.lastElementChild);
		}
	}
}
function leerTablaProcesos() {
	const tabla = document.getElementById("tabla-procesos");
	const filas = tabla.querySelectorAll("tbody tr");
	const procesos = [];
	let errores = [];

	filas.forEach((fila, index) => {
		const celdas = fila.querySelectorAll("td");
		const id = celdas[0].textContent.trim();
		const nombre = celdas[1].textContent.trim();
		const memoriaStr = celdas[2].textContent.trim();

		// Validaciones
		if (!nombre) {
			errores.push(`Fila ${index + 1}: El nombre no puede estar vacío.`);
		}

		if (!/^\d+$/.test(memoriaStr)) {
			errores.push(
				`Fila ${
					index + 1
				}: La memoria debe ser un número entero positivo.`
			);
		}

		// Leer duration como diccionario con claves numéricas desde la columna 3 en adelante
		const duration = {};
		for (let i = 3; i < celdas.length; i++) {
			const clave = i - 2; // Columnas extra desde la 3 en adelante
			const valor = celdas[i].textContent.trim();

			duration[clave] = valor;
		}

		// Si no hay errores en esta fila, convertir y agregar a la lista de procesos
		if (errores.length === 0) {
			procesos.push(crearProceso(id, nombre, memoriaStr, duration));
		}
	});

	if (errores.length > 0) {
		alert("Errores encontrados:\n" + errores.join("\n"));
		return null;
	}

	console.log("Procesos leídos correctamente:");
	console.log(
		JSON.stringify(
			procesos,
			(key, value) =>
				typeof value === "bigint" ? value.toString() : value,
			2
		)
	);
	return procesos;
}

function crearProceso(id, name, weight, duration = {}, positions = {}) {
	return {
		id,
		name,
		weight: BigInt(weight),
		duration,
		positions,
	};
}
