function crearProceso(
	name,
	weight,
	duration = {}, //Clave: timepo, valor: "x"(para cuando esta activo en ese tiempo) o "-"(para cuando no esta activo en ese tiempo) // y los tiempos van hasta que el os valga monda
	positions = {} // clave: tiempo, valor: { start, finish }
) {
	return {
		name,
		weight: BigInt(weight),
		duration,
		positions,
	};
}

const os = crearProceso("OS", 1048576n, [0, 1, 2], {
	0: {start: 0n, finish: 1048575n},
});
// Simulación de llegada de procesos en tiempos t1 y t2
let procesos = [
	crearProceso("p4", 436201, {0: "x", 1: "x", 2: "x"}),
	crearProceso("p8", 2696608, {0: "x", 1: "x", 2: "x", 3: "x", 4: "x"}),
	crearProceso("p3", 309150, {0: "x", 1: "x"}),
];

const memoriaTotal = 16n * 1024n * 1024n;

console.log("Memoria total: " + memoriaTotal.toString());
console.log("Memoria total(HEX): " + memoriaTotal.toString(16));

// Simula la gestión de memoria por tiempo
function gestionarMemoriaConTiempos(procesos, tiempoActual) {
	let memoriaDisponible = memoriaTotal - os.weight;
	let tope = os.positions[0].finish;

	console.log(
		"\n -Prosexos--------------------------------------------------------------"
	);
	for (let i = 0; i < procesos.length; i++) {
		const proceso = procesos[i];
		// Si el proceso debe ejecutarse a partir del tiempo actual
		if (proceso.duration[tiempoActual]) {
			const start = tope + 1n;
			const finish = start + proceso.weight - 1n;
			proceso.positions[tiempoActual] = {start, finish};

			tope = finish;
			memoriaDisponible -= proceso.weight;
			console.log(proceso.name);
			console.log(proceso.positions[tiempoActual]);
		}
	}

	console.log("\n Tiempo: " + tiempoActual);
	console.log("Memoria disponible: " + memoriaDisponible.toString());
	console.log(
		"Memoria ocupada: " + (memoriaTotal - memoriaDisponible).toString()
	);
	// Mostrar estado final de los procesos con sus posiciones en el tiempo
	console.log("\n Procesos con posiciones por tiempo:");
}

// Simula varios tiempos
for (let t = 0; t < os.duration.length; t++) {
	gestionarMemoriaConTiempos(procesos, t);
}
console.log(
	JSON.stringify(
		procesos,
		(key, value) => (typeof value === "bigint" ? value.toString() : value),
		2
	)
);
