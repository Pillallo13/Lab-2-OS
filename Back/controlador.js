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
function simular() {
	//Apartado para la constante os ----------------------------------------------------------------
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
		{0: {start: 0n, finish: 1048575n}}
	);
	console.log(os);
	//-------------------------------------------------------------------------------------------
	const procesos = leerTablaProcesos();
	if (!procesos) return;

	const selector = document.getElementById("selector"); // Asegúrate que tenga este ID en el HTML
	const seleccion = selector.value;

	switch (seleccion) {
		case "1":
			alert("Manu hace esta mkda");
			break;
		case "2":
			alert("Manu hace esta mkda");
			break;
		case "3":
			for (let t = 1; t < osTiempos.length + 1; t++) {
				particionesSinCompactacion.gestionarMemoriaConFragmentacion(
					procesos,
					t,
					os
				);
			}
			break;
		case "4":
			for (let t = 1; t < osTiempos.length + 1; t++) {
				particionesConCompactacion.gestionarMemoriaConTiempos(
					procesos,
					t,
					os
				);
			}
			break;
		default:
			alert("jaiiii niño, usted como llego aqui??");
			break;
	}
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
