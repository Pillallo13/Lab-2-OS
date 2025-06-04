export function gestionarMemoriaConFragmentacion(procesos, tiempo, os) {
	const memoriaTotal = 16n * 1024n * 1024n; // 16 MB
	let memoriaPorTiempo = {};
	const bloquesOcupados = [];

	// Insertar bloque del sistema operativo si aplica en este tiempo
	if (os?.positions?.[0]) {
		bloquesOcupados.push({
			start: os.positions[0].start,
			finish: os.positions[0].finish,
			name: os.name ?? "SO",
		});
	}

	for (const proceso of procesos) {
		// Normalizar duración (puede ser "X1", "x", etc.)
		const duracion = proceso.duration?.[tiempo]?.toLowerCase();
		if (duracion) {
			// Asegurar estructura
			if (!proceso.positions) proceso.positions = {};
			if (!proceso.weight) {
				proceso.weight = BigInt(proceso.memoria); // ← conversión desde campo original
			}

			// Verificar si ya fue asignado antes
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
				} else {
					console.log(
						`Tiempo ${tiempo}: No hay espacio para ${
							proceso.nombre ?? proceso.name
						}`
					);
				}
			}
		}
	}

	memoriaPorTiempo[tiempo] = bloquesOcupados;

	// 🔵 Mostrar resumen
	console.log("\n Tiempo " + tiempo);
	console.log(" Bloques ocupados:");
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

	console.log(" Memoria ocupada: " + memoriaOcupada.toString());
	console.log(
		" Memoria disponible: " + (memoriaTotal - memoriaOcupada).toString()
	);

	console.log("\n Procesos con posiciones por tiempo:");
	console.log(
		JSON.stringify(
			procesos,
			(key, value) =>
				typeof value === "bigint" ? value.toString() : value,
			2
		)
	);
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
