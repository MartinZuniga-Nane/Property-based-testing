import { TaskStore } from '../src/task-store.js';

const store = new TaskStore();
const task = store.create({ title: 'Estudiar pruebas basadas en propiedades' });
console.log('Crear:', task);
console.log('Obtener:', store.get(task.id));
console.log('Actualizar:', store.update(task.id, { completed: true }));
console.log('Listar:', store.list());
console.log('Eliminar:', store.delete(task.id));
console.log('Obtener despues de eliminar:', store.get(task.id));
console.log('Listado final:', store.list());
