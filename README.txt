GESTOR DE TAREAS — PROPERTY-BASED TESTING

Sistema de gestión de tareas en memoria, sin interfaz gráfica.
Requiere Node.js 22.16 o superior y npm.

EJECUCIÓN

1. Instalar las dependencias exactas: npm ci
2. Ejecutar la demostración del CRUD: npm start
3. Ejecutar las pruebas: npm test

USO DESDE JAVASCRIPT

import { TaskStore } from './src/task-store.js';

const tasks = new TaskStore();
const task = tasks.create({ title: 'Preparar laboratorio' });
tasks.get(task.id);
tasks.list();
tasks.update(task.id, { completed: true });
tasks.delete(task.id);

REGLAS DEL DOMINIO

- Una tarea tiene id, title y completed. No se aceptan otros campos.
- ID: entero positivo seguro asignado automáticamente. No se reutiliza.
- title: texto obligatorio, recortado con trim, de 1 a 120 unidades UTF-16.
  Se usa String.length; un emoji puede ocupar dos unidades.
- completed: booleano; false por defecto al crear.
- update admite title, completed o ambos y exige al menos un campo.
- La actualización mantiene el ID, el orden y el número de tareas.
- get devuelve una copia o null si el ID no existe.
- list devuelve copias de las tareas en orden de creación.
- update sobre un ID inexistente lanza RangeError.
- delete devuelve true si eliminó una tarea y false si el ID no existía.
- Los IDs de entrada inválidos producen TypeError.
- Los tipos de entrada incorrectos producen TypeError; un título vacío
  o demasiado largo produce RangeError.
- Una operación rechazada conserva el estado anterior.
- Cada instancia tiene su propio almacén. Los datos se pierden al finalizar
  el proceso; no se requiere persistencia para este laboratorio.

PRUEBAS BASADAS EN PROPIEDADES

Se usa fast-check con node:test y node:assert/strict. fast-check genera datos
y reduce un fallo a un contraejemplo pequeño. Una propiedad expresa una regla
que debe cumplirse para cualquier entrada del dominio generado.

Los generadores incluyen títulos ASCII y Unicode, estados booleanos, listas
de tareas, entradas inválidas y secuencias de operaciones. Cada caso usa una
instancia nueva. Se ejecutan 500 casos por propiedad, con tres ejemplos
adicionales explícitos de borde incluidos en la propiedad del estado inicial.
Esos ejemplos forman parte de las 500 ejecuciones, no se suman a ellas.

Propiedades principales requeridas:

Create — tests/create.test.js
Para cualquier lista de entradas válidas, crear conserva los datos
normalizados y produce IDs únicos. El estado inicial es pendiente si se omite.

Read — tests/read.test.js
Para cualquier conjunto de tareas creadas, obtener y listar devuelven sus
datos sin modificar el estado. Mutar los resultados no modifica el almacén.

Update — tests/update.test.js
Para cualquier tarea y cambio válido, actualizar aplica el cambio y conserva
su ID, los campos omitidos, la cantidad de tareas y las otras entidades.

Delete — tests/delete.test.js
Para cualquier tarea existente, eliminar la retira sin afectar a las demás.
Repetir la eliminación devuelve false y mantiene el mismo estado.

Integración — tests/lifecycle.test.js
Se generan secuencias de hasta 80 operaciones y se compara cada paso con
una lista de datos esperados. También se valida el ciclo CRUD completo.

En total hay 22 propiedades, incluyendo validaciones, aislamiento de datos,
idempotencia e IDs no reutilizados: 11.000 casos por ejecución normal.

REPRODUCIR UNA EJECUCIÓN

En PowerShell:
$env:FC_SEED = '20261002'
npm test
Remove-Item Env:FC_SEED

FC_NUM_RUNS permite cambiar el número de casos por propiedad.
Cuando falla una propiedad, fast-check informa seed, path y counterexample.
Para reproducir exactamente ese fallo, agregar seed y path a las opciones
de fc.assert en la propiedad afectada y conservar la misma versión del lockfile.

FUENTES OFICIALES

https://fast-check.dev/docs/introduction/
https://fast-check.dev/docs/core-blocks/arbitraries/primitives/string/
https://fast-check.dev/docs/core-blocks/runners/
https://fast-check.dev/docs/advanced/model-based-testing/
https://nodejs.org/docs/latest-v22.x/api/test.html

ENTREGA

El código y las pruebas ejecutables están versionados en src/ y tests/.
La carpeta pruebas/ contiene las evidencias de validación y también está
incluida en el repositorio:

- Prueba1.png y Prueba 2.png: demostración de las operaciones CRUD.
- Prueba 3.png y Prueba 4.png: ejecución y resumen de las 22 pruebas aprobadas.
- resultados.txt: resultados completos y cobertura del gestor.
- demo.txt: salida de la demostración CRUD.
- resumen.txt: entorno, semilla, número de casos y comando de reproducción.
- investigacion.txt: fuentes consultadas y decisiones de implementación.

node_modules/, .env y los archivos .md permanecen excluidos de Git.
