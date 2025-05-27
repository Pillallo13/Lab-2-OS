# Lab-2-os

# 🧠 Gestión de Memoria en Sistemas Operativos

La **gestión de memoria** es uno de los componentes fundamentales de un sistema operativo. Permite a múltiples procesos compartir eficientemente la memoria principal y garantiza estabilidad, seguridad y rendimiento.

---

## 📚 ¿Qué es la gestión de memoria?

La gestión de memoria es el conjunto de técnicas y mecanismos que permiten al sistema operativo:

- Asignar y liberar memoria a los procesos.
- Mantener la integridad del espacio de memoria.
- Optimizar el uso de la memoria física y virtual.

---

## 🔍 Objetivos principales

- ✅ Proteger la memoria entre procesos.
- ✅ Maximizar el uso de la memoria disponible.
- ✅ Garantizar acceso eficiente a los datos.
- ✅ Soportar la multiprogramación y la memoria virtual.

---

## 🧩 Estrategias comunes

### 1. **Segmentación**

- Divide la memoria en segmentos lógicos (código, datos, pila).
- Proporciona mayor organización y protección.

### 2. **Paginación**

- Divide la memoria física y lógica en páginas del mismo tamaño.
- Evita la fragmentación externa.
- Usa tablas de páginas para traducir direcciones.

### 3. **Memoria Virtual**

- Permite ejecutar programas más grandes que la RAM.
- Usa almacenamiento secundario (como el disco) para simular más memoria.
- Se apoya en mecanismos como el _swapping_.

---

## ⚙️ Técnicas de asignación

- **Asignación contigua:** simple pero propensa a fragmentación externa.
- **Asignación enlazada:** mejora el uso de memoria pero es más lenta.
- **Asignación con tablas:** balance entre rendimiento y flexibilidad.

---

## 📌 Ejemplos en la vida real

- Sistemas como **Windows**, **Linux** o **macOS** utilizan complejas estructuras de paginación y segmentación.
- Aplicaciones que consumen mucha memoria, como videojuegos o editores de video, dependen fuertemente de una buena gestión de memoria.

---

## 🧪 ¿Por qué es importante?

Una mala gestión de memoria puede causar:

- 🔴 Pérdida de rendimiento.
- 🔴 Fallos por falta de recursos.
- 🔴 Vulnerabilidades de seguridad (como buffer overflows).

---

## 📎 Recursos recomendados

- 📘 _Operating System Concepts_ – Silberschatz, Galvin & Gagne
- 📘 _Modern Operating Systems_ – Andrew Tanenbaum
- 📺 [Video: Gestión de Memoria - Paginación](https://www.youtube.com/watch?v=GQp1zzTwrIg)

---

## ✨ Conclusión

La gestión de memoria es una pieza clave en el diseño de sistemas operativos modernos. Gracias a ella, es posible ejecutar múltiples aplicaciones simultáneamente de manera segura y eficiente.
