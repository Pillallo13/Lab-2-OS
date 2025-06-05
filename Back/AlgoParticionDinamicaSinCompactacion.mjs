export function gestionarMemoriaConFragmentacion(procesos, tiempo, os) {
	const memoriaTotal = 16n * 1024n * 1024n; // 16 MB
	let bloquesOcupados = [];

	// Insertar bloque del sistema operativo si aplica en este tiempo
	if (os?.positions?.[0]) {
		bloquesOcupados.push({
			start: os.positions[0].start,
			finish: os.positions[0].finish,
			name: os.name ?? "SO",
		});
	}

	for (const proceso of procesos) {
		const duracion = proceso.duration?.[tiempo]?.toLowerCase();
		if (duracion) {
			if (!proceso.positions) proceso.positions = {};
			if (!proceso.weight) proceso.weight = BigInt(proceso.memoria);

			let yaAsignado = false;

			for (let tPrev = 0; tPrev < tiempo; tPrev++) {
				if (
					proceso.duration?.[tPrev]?.toLowerCase() === "x" &&
					proceso.positions?.[tPrev]
				) {
					proceso.positions[tiempo] = proceso.positions[tPrev];
					bloquesOcupados.push({
						start: proceso.positions[tPrev].start,
						finish: proceso.positions[tPrev].finish,
						name: proceso.nombre ?? proceso.name,
					});
					yaAsignado = true;
					break;
				}
			}

			if (!yaAsignado) {
				const espacioLibre = encontrarHuecoDisponible(
					bloquesOcupados,
					proceso.weight,
					memoriaTotal
				);

				if (espacioLibre) {
					const {start, finish} = espacioLibre;
					proceso.positions[tiempo] = {start, finish};
					bloquesOcupados.push({
						start,
						finish,
						name: proceso.nombre ?? proceso.name,
					});
				}
			}
		}
	}

	// Retornar los datos en vez de solo imprimir
	return { procesos, bloquesOcupados };
}


function encontrarHuecoDisponible(bloques, tamaño, memoriaTotal) {
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

	// Espacio libre al final
	if (memoriaTotal - (prevEnd + 1n) >= tamaño) {
		return {
			start: prevEnd + 1n,
			finish: prevEnd + tamaño,
		};
	}

	return null;
}
