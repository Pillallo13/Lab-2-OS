export default class ParticionTamañoVariable {
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

    // 3) Definir particiones variables de ejemplo (5 bloques)
    //    Los tamaños suman en total 16 MiB
    //    - 5 120 000 bytes (≈5000 KiB)
    //    - 3 072 000 bytes (≈3000 KiB)
    //    - 2 048 000 bytes (≈2000 KiB)
    //    - 4 096 000 bytes (≈4000 KiB)
    //    - El resto (16 777 216 - 14 336 000) = 2 441 216 bytes (≈2384 KiB)
    const kb = 1024n;
    const tA = 5000n * kb; // 5 120 000 bytes
    const tB = 3000n * kb; // 3 072 000 bytes
    const tC = 2000n * kb; // 2 048 000 bytes
    const tD = 4000n * kb; // 4 096 000 bytes
    const tRestante =
      this.memoriaTotal - (tA + tB + tC + tD); // 2 441 216 bytes

    this.partitions = [
      { start: 0n, size: tA },
      { start: tA, size: tB },
      { start: tA + tB, size: tC },
      { start: tA + tB + tC, size: tD },
      { start: tA + tB + tC + tD, size: tRestante },
    ];

    this.os = ParticionTamañoVariable.crearProceso(
      "OS",
      1048576n,          // 1 MiB
      [0, 1, 2, 3, 4, 5, 6],
      { 0: { start: 0n, finish: 1048575n } }
    );

    this.procesos = [
      ParticionTamañoVariable.crearProceso(
        "p4",
        436201n,
        { 0: "x", 1: "x", 2: "x" }
      ),
      ParticionTamañoVariable.crearProceso(
        "p8",
        2696608n,
        { 0: "x", 1: "x", 2: "x", 3: "x", 4: "x" }
      ),
      ParticionTamañoVariable.crearProceso(
        "p3",
        309150n,
        { 0: "x", 1: "x" }
      ),
    ];

    this.memoriaPorTiempo = {};
  }

  gestionMemoria() {
    for (let t = 0; t < this.os.duration.length; t++) {
      this._gestionarMemoriaConFragmentacion(this.procesos, t);
    }

    // Mostrar posiciones finales de cada proceso
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

    if (this.os.duration.includes(tiempo)) {
      bloquesOcupados.push({
        start: this.os.positions[0].start,
        finish: this.os.positions[0].finish,
        name: this.os.name,
      });
    }

    // Para cada proceso
    for (const proceso of procesos) {
      if (proceso.duration[tiempo] === "x") {

        let yaAsignado = false;

        for (let tPrev = 0; tPrev < tiempo; tPrev++) {
          if (
            proceso.duration[tPrev] === "x" &&
            proceso.positions[tPrev]
          ) {
            // Copiar posición previa
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

    // Guardar estado
    this.memoriaPorTiempo[tiempo] = bloquesOcupados;

    // Imprimir en consola
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
    console.log(
      "Memoria disponible: " + (this.memoriaTotal - memoriaOcupada).toString()
    );
  }

  _encontrarHuecoDisponible(bloques, tamaño) {
    bloques.sort((a, b) => (a.start < b.start ? -1 : 1));

    for (const particion of this.partitions) {
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