// Memoria total (16 MiB)
const memoriaTotal = 16n * 1024n * 1024n;

//Definir 4 particiones fijas de 4 MiB cada una
const partitionCount = 4;
const partitionSize = memoriaTotal / BigInt(partitionCount); // 4 MiB
const partitions = [];
for (let i = 0; i < partitionCount; i++) {
  const startOffset = BigInt(i) * partitionSize;
  partitions.push({
    start: startOffset,
    size: partitionSize,
  });
}
export function gestionarMemoriaFija(procesos, tiempo, os) {
  //Array vacío de bloques para este tiempo
  const bloquesOcupados = [];
  //Insertar bloque del OS si corresponde
  if (os?.positions?.[0]) {
    //Si existe os.positions[0], lo uso :)
    bloquesOcupados.push({
      start: os.positions[0].start,
      finish: os.positions[0].finish,
      name: os.name ?? "OS",
    });
  } else {
    //Si no existía, se garantiza que en la primera iteración quede asignado
    os.positions = { 0: { start: 0n, finish: 1048575n } };
    bloquesOcupados.push({
      start: 0n,
      finish: 1048575n,
      name: os.name ?? "OS",
    });
  }
  //Iterar sobre cada proceso de la lista
  for (const proceso of procesos) {
    const duracionHere = proceso.duration?.[tiempo];
    //Detectar si en este “tiempo” el proceso está activo (“x” o “X”).
    const activo =
      typeof duracionHere === "string" && duracionHere.toLowerCase() === "x";
    if (activo) {
      if (!proceso.positions) proceso.positions = {};
      let yaAsignado = false;
      // Si ya existía en algún tiempo anterior (tPrev < tiempo), la copia
      for (let tPrev = 0; tPrev < tiempo; tPrev++) {
        const durPrev = proceso.duration?.[tPrev];
        const activoPrev =
          typeof durPrev === "string" && durPrev.toLowerCase() === "x";
        if (activoPrev && proceso.positions?.[tPrev]) {
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
      //Si no estaba en un tiempo anterior, buscar una partición fija libre
      if (!yaAsignado) {
        const espacioLibre = encontrarHuecoDisponible(
          bloquesOcupados,
          proceso.weight,
          partitions
        );
        if (espacioLibre) {
          const { start, finish } = espacioLibre;
          proceso.positions[tiempo] = { start, finish };
          bloquesOcupados.push({
            start,
            finish,
            name: proceso.name,
          });
        } else {
          console.log(`Tiempo ${tiempo}: No hay espacio para ${proceso.name}`);
        }
      }
    }
  }
  //Devolver “procesos” (con sus posiciones actualizadas) y el array “bloquesOcupados”
  return { procesos, bloquesOcupados };
}

function encontrarHuecoDisponible(bloques, tamaño, partitions) {
  bloques.sort((a, b) => (a.start < b.start ? -1 : 1));
  for (const particion of partitions) {
    if (particion.size >= tamaño) {
      let colision = false;
      const partStart = particion.start;
      const partFinish = particion.start + particion.size - 1n;
      for (const b of bloques) {
        if (!(b.finish < partStart || b.start > partFinish)) {
          colision = true;
          break;
        }
      }
      if (!colision) {
        // Devuelvo toda la partición fija (sin fraccionar).
        return {
          start: partStart,
          finish: partFinish,
        };
      }
    }
  }
  return null;
}
