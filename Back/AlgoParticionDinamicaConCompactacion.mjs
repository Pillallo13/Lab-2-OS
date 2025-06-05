export function gestionarMemoriaConTiempos(procesos, tiempoActual, os) {
	const memoriaTotal = 16n * 1024n * 1024n;
	tiempoActual = tiempoActual.toString();

	let memoriaDisponible = memoriaTotal - os.weight;
	let tope = os.positions[0].finish;

	let bloquesOcupados = [
		{
			start: os.positions[0].start,
			finish: os.positions[0].finish,
			name: os.name ?? "SO",
		},
	];

	for (const proceso of procesos) {
		if (proceso.duration?.[tiempoActual]) {
			if (!proceso.positions) proceso.positions = {};

			if (memoriaDisponible >= proceso.weight) {
				const start = tope + 1n;
				const finish = start + proceso.weight - 1n;

				proceso.positions[tiempoActual] = { start, finish };
				tope = finish;
				memoriaDisponible -= proceso.weight;

				bloquesOcupados.push({
					start,
					finish,
					name: proceso.name,
				});
			}
		}
	}

	return { procesos, bloquesOcupados };
}
