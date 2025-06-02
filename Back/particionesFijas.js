function crearProceso(name, weight, duration = {}, positions = {}) {
  return {
    name,
    weight: BigInt(weight),
    duration,
    positions,
  };
}

// Memoria total (16 MiB)
const memoriaTotal = 16n * 1024n * 1024n;

// Proceso “OS” reserva 1 MiB al inicio en todos los tiempos de 0 a 6
const os = crearProceso(
  "OS",
  1048576n, // 1 MiB = 1 * 1024 * 1024 bytes
  [0, 1, 2, 3, 4, 5, 6],
  { 0: { start: 0n, finish: 1048575n } }
);

// Lista de procesos de ejemplo
let procesos = [
  crearProceso("p4", 436201n, { 0: "x", 1: "x", 2: "x" }),
  crearProceso("p8", 2696608n, { 0: "x", 1: "x", 2: "x", 3: "x", 4: "x" }),
  crearProceso("p3", 309150n, { 0: "x", 1: "x" }),
];

 // Objeto para almacenar, por cada tiempo, la lista de bloques ocupados
let memoriaPorTiempo = {};

export function ejecutarParticionFija() {
  // Reinicializar estados
  procesos.forEach((p) => (p.positions = {}));
  // Reinicializamos memoriaPorTiempo:
  memoriaPorTiempo = {};

  // Definir las 4 particiones fijas de 4 MiB cada una
  const partitionCount = 4;
  const partitionSize = memoriaTotal / BigInt(partitionCount); // 4 MiB
  const partitions = [];
  for (let i = 0; i < partitionCount; i++) {
    const startOffset = BigInt(i) * partitionSize;
    partitions.push({
      start: startOffset, // offset de inicio en bytes
      size: partitionSize, // 4 MiB
    });
  }

  for (let t = 0; t < os.duration.length; t++) {
    gestionarMemoriaConFragmentacion(procesos, t, partitions);
  }

  // Devolver resultados (bloques por tiempo y procesos con posiciones)
  return { memoriaPorTiempo, procesos };
}

function gestionarMemoriaConFragmentacion(procesos, tiempo, partitions) {
  const bloquesOcupados = [];

  if (os.duration.includes(tiempo)) {
    bloquesOcupados.push({
      start: os.positions[0].start,
      finish: os.positions[0].finish,
      name: os.name,
    });
  }

  // Para cada proceso en la lista
  for (const proceso of procesos) {
    if (proceso.duration[tiempo] === "x") {
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

      // Si no estaba asignado, buscar nueva partición fija
      if (!yaAsignado) {
        const espacioLibre = encontrarHuecoDisponible(
          bloquesOcupados,
          proceso.weight,
          partitions
        );

        if (espacioLibre) {
          const { start, finish } = espacioLibre;
          proceso.positions[tiempo] = { start, finish };
          bloquesOcupados.push({ start, finish, name: proceso.name });
        } else {
          console.log(
            `  Tiempo ${tiempo}: No hay espacio para ${proceso.name}`
          );
        }
      }
    }
  }

  // Guardar lista de bloques ocupados en este tiempo
  memoriaPorTiempo[tiempo] = bloquesOcupados;

  // Imprimir estado de bloques y métricas en consola
  console.log(`\nTiempo ${tiempo}`);
  console.log("Bloques ocupados:");
  bloquesOcupados
    .sort((a, b) => (a.start < b.start ? -1 : 1))
    .forEach((b) =>
      console.log(
        `- ${b.name}: [${b.start} - ${b.finish}] (${(b.finish - b.start + 1n).toString()} bytes)`
      )
    );

  const memoriaOcupada = bloquesOcupados.reduce(
    (total, b) => total + (b.finish - b.start + 1n),
    0n
  );
  console.log("Memoria ocupada: " + memoriaOcupada.toString());
  console.log("Memoria disponible: " + (memoriaTotal - memoriaOcupada).toString());
}

function encontrarHuecoDisponible(bloques, tamaño, partitions) {
  bloques.sort((a, b) => (a.start < b.start ? -1 : 1));
  // Recorrer cada partición fija
  for (const particion of partitions) {
    if (particion.size >= tamaño) {
      let colision = false;
      const partStart = particion.start;
      const partFinish = particion.start + particion.size - 1n;
      // Comprobar sobreposicionamiento con los bloques actuales
      for (const b of bloques) {
        if (!(b.finish < partStart || b.start > partFinish)) {
          colision = true;
          break;
        }
      }
      if (!colision) {
        return {
          start: partStart,
          finish: partFinish,
        };
      }
    }
  }
  return null;
}