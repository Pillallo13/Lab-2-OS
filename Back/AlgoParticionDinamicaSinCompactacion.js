function crearProceso(name, weight, duration = {}, positions = {}) {
	return {
		name,
		weight: BigInt(weight),
		duration,
		positions,
	};
}

const memoriaTotal = 16n * 1024n * 1024n;
const os = crearProceso("OS", 1048576n, [0, 1, 2, 3, 4, 5, 6], {
	0: {start: 0n, finish: 1048575n},
});

let procesos = [
	crearProceso("p4", 436201, {0: "x", 1: "x", 2: "x"}),
	crearProceso("p8", 2696608, {0: "x", 1: "x", 2: "x", 3: "x", 4: "x"}),
	crearProceso("p3", 309150, {0: "x", 1: "x"}),
];

// Cada tiempo tiene una lista de bloques ocupados
let memoriaPorTiempo = {};

export function gestionarMemoriaConFragmentacion(procesos, tiempo) {
	const bloquesOcupados = [];

	// Insertar bloque del sistema operativo (mismo en todos los tiempos)
	if (os.duration.includes(tiempo)) {
		bloquesOcupados.push({
			start: os.positions[0].start,
			finish: os.positions[0].finish,
			name: os.name,
		});
	}

	for (const proceso of procesos) {
		if (proceso.duration[tiempo] === "x") {
			// Verifica si ya fue asignado antes
			let yaAsignado = false;

			for (let tPrev = 0; tPrev < tiempo; tPrev++) {
				if (
					proceso.duration[tPrev] === "x" &&
					proceso.positions[tPrev]
				) {
					// Copiar la posición del tiempo anterior
					proceso.positions[tiempo] = proceso.positions[tPrev];
					bloquesOcupados.push({
						start: proceso.positions[tPrev].start,
						finish: proceso.positions[tPrev].finish,
						name: proceso.name,
					});
					yaAsignado = true;
					break;
				}
			}

			if (!yaAsignado) {
				// Asignar nueva posición solo si nunca fue asignado
				const espacioLibre = encontrarHuecoDisponible(
					bloquesOcupados,
					proceso.weight
				);

				if (espacioLibre) {
					const {start, finish} = espacioLibre;
					proceso.positions[tiempo] = {start, finish};
					bloquesOcupados.push({start, finish, name: proceso.name});
				} else {
					console.log(
						" Tiempo ${tiempo}: No hay espacio para ${proceso.name}"
					);
				}
			}
		}
	}

	memoriaPorTiempo[tiempo] = bloquesOcupados;

	console.log("\nTiempo ${tiempo}");
	console.log("Bloques ocupados:");
	bloquesOcupados
		.sort((a, b) => (a.start < b.start ? -1 : 1))
		.forEach((b) =>
			console.log(
				`- ${b.name}: [${b.start} - ${b.finish}] (${
					b.finish - b.start + 1n
				} bytes)`
			)
		);

	const memoriaOcupada = bloquesOcupados.reduce(
		(total, b) => total + (b.finish - b.start + 1n),
		0n
	);
	console.log("Memoria ocupada: " + memoriaOcupada.toString());
	console.log(
		"Memoria disponible: " + (memoriaTotal - memoriaOcupada).toString()
	);
}

// Busca un hueco entre bloques ocupados que sea suficientemente grande
function encontrarHuecoDisponible(bloques, tamaño) {
	bloques.sort((a, b) => (a.start < b.start ? -1 : 1));

	let prevEnd = -1n;
	for (const bloque of bloques) {
		const hueco = bloque.start - (prevEnd + 1n);
		if (hueco >= tamaño) {
			return {
				start: prevEnd + 1n,
				finish: prevEnd + tamaño,
			};
		}
		prevEnd = bloque.finish;
	}

	// ¿Hay espacio después del último bloque?
	if (memoriaTotal - (prevEnd + 1n) >= tamaño) {
		return {
			start: prevEnd + 1n,
			finish: prevEnd + tamaño,
		};
	}

	return null; // No hay espacio suficiente contiguo
}

// Simular tiempos
for (let t = 0; t < os.duration.length; t++) {
	gestionarMemoriaConFragmentacion(procesos, t);
}
// Mostrar posiciones finales
console.log("\n Procesos con sus posiciones por tiempo:");
console.log(
	JSON.stringify(
		procesos,
		(key, value) => (typeof value === "bigint" ? value.toString() : value),
		2
	)
);
