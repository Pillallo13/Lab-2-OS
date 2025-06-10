// Memoria total (16 MiB)
const memoriaTotal = 16n * 1024n * 1024n;

// Definir las particiones variables (5 bloques) cuya suma es 16 MiB
// - 5 120 000 bytes (≈5000 KiB)
// - 3 072 000 bytes (≈3000 KiB)
// - 2 048 000 bytes (≈2000 KiB)
// - 4 096 000 bytes (≈4000 KiB)
// - El resto (16 777 216 - 14 336 000) = 2 441 216 bytes (≈2384 KiB)
const kb = 1024n;
const tA = 5000n * kb; // 5 120 000 bytes (≈5000 KiB)
const tB = 3000n * kb; // 3 072 000 bytes (≈3000 KiB)
const tC = 2000n * kb; // 2 048 000 bytes (≈2000 KiB)
const tD = 4000n * kb; // 4 096 000 bytes (≈4000 KiB)
const tRestante = memoriaTotal - (tA + tB + tC + tD); // = 2 441 216 bytes (2384 KiB)

const partitions = [
  { start: 0n, size: tA },
  { start: tA, size: tB },
  { start: tA + tB, size: tC },
  { start: tA + tB + tC, size: tD },
  { start: tA + tB + tC + tD, size: tRestante },
];

export function gestionarMemoriaVariable(procesos, tiempo, os) {
  const bloquesOcupados = [];

  // Insertar bloque del SO en cada tiempo
  if (os?.positions?.[0]) {
    bloquesOcupados.push({
      start: os.positions[0].start,
      finish: os.positions[0].finish,
      name: os.name ?? "OS",
    });
  } else {
    // Si no estaba inicializado, lo colocamos ahora en [0..1 048 575]
    os.positions = { 0: { start: 0n, finish: 1048575n } };
    bloquesOcupados.push({
      start: 0n,
      finish: 1048575n,
      name: os.name ?? "OS",
    });
  }

  // Para cada proceso
  for (const proceso of procesos) {
    // Antes: solo consideraba "x" o "X"
    // Ahora: cualquier valor no vacío se toma como activo (igual que en caso 3/4)
    const duracionHere = proceso.duration?.[tiempo];
    const activo = duracionHere != null && duracionHere !== "";

    if (activo) {
      if (!proceso.positions) proceso.positions = {};
      let yaAsignado = false;

      // Si estuvo activo en un tiempo previo tPrev < tiempo, copiamos esa posición
      for (let tPrev = 0; tPrev < tiempo; tPrev++) {
        const durPrev = proceso.duration?.[tPrev];
        const activoPrev = durPrev != null && durPrev !== "";
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

      // Si no estaba copiado, buscamos hueco libre en alguna partición variable
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
    } else {
      // Si no está activo, mostramos en consola para que el flujo llegue al render
      console.log(
        `Tiempo ${tiempo}: Proceso ${proceso.name} inactivo (duración="${duracionHere}")`
      );
    }
  }

  // Devolver procesos y bloques para construir la tabla en el controlador
  return { procesos, bloquesOcupados };
}

function encontrarHuecoDisponible(bloques, tamaño, partitions) {
  // Ordenar los bloques existentes por dirección de inicio
  bloques.sort((a, b) => (a.start < b.start ? -1 : 1));

  for (const particion of partitions) {
    if (particion.size >= tamaño) {
      let colision = false;
      const partStart = particion.start;
      const partFinish = particion.start + particion.size - 1n;

      // Comprobar solapamiento con cualquiera de los bloques actuales
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