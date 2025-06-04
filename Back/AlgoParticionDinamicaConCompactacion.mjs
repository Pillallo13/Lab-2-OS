export function gestionarMemoriaConTiempos(procesos, tiempoActual, os) {
	const memoriaTotal = 16n * 1024n * 1024n;
	tiempoActual = tiempoActual.toString(); // Asegura que la clave funcione

	let memoriaDisponible = memoriaTotal - os.weight;
	let tope = os.positions[0].finish;

	console.log(
		"\n -Procesos--------------------------------------------------------------"
	);

	console.log(os.name);
	console.log(os.positions[0]);
	for (let i = 0; i < procesos.length; i++) {
		const proceso = procesos[i];

		if (proceso.duration?.[tiempoActual]) {
			if (!proceso.positions) proceso.positions = {};

			if (memoriaDisponible >= proceso.weight) {
				const start = tope + 1n;
				const finish = start + proceso.weight - 1n;

				proceso.positions[tiempoActual] = {start, finish};
				tope = finish;
				memoriaDisponible -= proceso.weight;

				console.log(proceso.name);
				console.log(proceso.positions[tiempoActual]);
			} else {
				console.warn(
					`No hay suficiente memoria para ${proceso.name} en t=${tiempoActual}`
				);
			}
		}
	}

	console.log("\n Tiempo: " + tiempoActual);
	console.log("Memoria disponible: " + memoriaDisponible.toString());
	console.log(
		"Memoria ocupada: " + (memoriaTotal - memoriaDisponible).toString()
	);
}
