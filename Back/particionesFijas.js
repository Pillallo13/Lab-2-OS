export default class ParticionTamañoFijo {
  static crearProceso(name, weight, duration = {}, positions = {}) {
    return {
      name,
      weight: BigInt(weight),
      duration,
      positions,
    };
  }

  constructor() {
    // Memoria total
    this.memoriaTotal = 16n * 1024n * 1024n; // 16 MiB en bytes

    // Definición de particiones fijas: 4 particiones de 4 MiB (4 194 304 bytes) cada una
    const partitionCount = 4;
    const partitionSize = this.memoriaTotal / BigInt(partitionCount); // 4 MiB en bytes
    
    this.partitions = [];
    for (let i = 0; i < partitionCount; i++) {
      const startOffset = BigInt(i) * partitionSize;
      this.partitions.push({
        start: startOffset,             // offset en bytes donde arranca esta partición
        size: partitionSize,            // 4 194 304 bytes (4 MiB)
      });
    }
    this.os = ParticionTamañoFijo.crearProceso(
      "OS",
      1048576n,          // 1 MiB = 1 * 1024 * 1024 bytes
      [0, 1, 2, 3, 4, 5, 6], // instantes de tiempo a simular (0..6)
      { 0: { start: 0n, finish: 1048575n } }
    );

    this.procesos = [
      ParticionTamañoFijo.crearProceso(
        "p4",
        436201n,
        { 0: "x", 1: "x", 2: "x" }
      ),
      ParticionTamañoFijo.crearProceso(
        "p8",
        2696608n,
        { 0: "x", 1: "x", 2: "x", 3: "x", 4: "x" }
      ),
      ParticionTamañoFijo.crearProceso(
        "p3",
        309150n,
        { 0: "x", 1: "x" }
      ),
    ];

    //Objeto para almacenar, por cada tiempo, la lista de bloques ocupados
    this.memoriaPorTiempo = {};
  }

  gestionMemoria() {
    for (let t = 0; t < this.os.duration.length; t++) {
      this._gestionarMemoriaConFragmentacion(this.procesos, t);
    }

    console.log("\nProcesos con sus posiciones por tiempo:");
    console.log(
      JSON.stringify(
        this.procesos,
        (key, value) => (typeof value === "bigint" ? value.toString() : value),
        2
      )
    );
  }

  _gestionarMemoriaConFragmentacion(procesos, tiempo) {
    const bloquesOcupados = [];

    // 1) Insertar bloque de OS si OS está activo en este tiempo
    if (this.os.duration.includes(tiempo)) {
      bloquesOcupados.push({
        start: this.os.positions[0].start,
        finish: this.os.positions[0].finish,
        name: this.os.name,
      });
    }

    // 2) Para cada proceso de la lista
    for (const proceso of procesos) {
      if (proceso.duration[tiempo] === "x") {
        // 2.1) Verificar si ya fue asignado en un tPrev < tiempo
        let yaAsignado = false;

        for (let tPrev = 0; tPrev < tiempo; tPrev++) {
          if (
            proceso.duration[tPrev] === "x" &&
            proceso.positions[tPrev]
          ) {
            // Copiar la misma posición del tiempo anterior
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

        // 2.2) Si no estaba asignado, buscamos una partición fija libre
        if (!yaAsignado) {
          const espacioLibre = this._encontrarHuecoDisponible(
            bloquesOcupados,
            proceso.weight
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

    // 3) Guardar estado de bloques en este tiempo
    this.memoriaPorTiempo[tiempo] = bloquesOcupados;

    // 4) Imprimir por consola
    console.log(`\nTiempo ${tiempo}`);
    console.log("Bloques ocupados:");
    // Ordenar bloques por start
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
    console.log(
      "Memoria disponible: " + (this.memoriaTotal - memoriaOcupada).toString()
    );
  }

  _encontrarHuecoDisponible(bloques, tamaño) {
    // 1) Ordenar bloques ocupados por start
    bloques.sort((a, b) => (a.start < b.start ? -1 : 1));

    // 2) Para cada partición fija, verificar si está libre (no se superpone a ningún bloque)
    for (const particion of this.partitions) {
      // Si el proceso cabe en esta partición en términos de tamaño
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
          return {
            start: partStart,
            finish: partFinish,
          };
        }
      }
    }
    return null;
  }
}