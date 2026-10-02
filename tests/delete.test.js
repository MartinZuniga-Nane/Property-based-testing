import assert from 'node:assert/strict';
import test from 'node:test';
import { TaskStore } from '../src/task-store.js';
import { fc, taskInput, invalidId } from './generators.js';

test('Delete: elimina solo la tarea elegida y repetirlo no cambia el estado', () => {
  fc.assert(fc.property(fc.array(taskInput, { minLength: 1, maxLength: 40 }), fc.nat(), (inputs, index) => {
    const store = new TaskStore();
    const created = inputs.map((input) => store.create(input));
    const selected = created[index % created.length];
    const remaining = created.filter((task) => task.id !== selected.id);
    assert.equal(store.delete(selected.id), true);
    assert.equal(store.get(selected.id), null);
    assert.deepEqual(store.list(), remaining);
    remaining.forEach((task) => assert.deepEqual(store.get(task.id), task));
    assert.equal(store.delete(selected.id), false);
    assert.deepEqual(store.list(), remaining);
  }));
});

test('Delete: eliminar IDs inexistentes no modifica el almacen', () => {
  fc.assert(fc.property(fc.array(taskInput, { maxLength: 30 }), fc.integer({ min: 1 }), (inputs, offset) => {
    const store = new TaskStore();
    const created = inputs.map((input) => store.create(input));
    assert.equal(store.delete(created.length + offset), false);
    assert.deepEqual(store.list(), created);
  }));
});

test('Delete: eliminar todo deja el almacen vacio y no reutiliza IDs', () => {
  fc.assert(fc.property(fc.array(taskInput, { minLength: 1, maxLength: 40 }), taskInput, (inputs, input) => {
    const store = new TaskStore();
    const created = inputs.map((data) => store.create(data));
    [...created].reverse().forEach((task) => assert.equal(store.delete(task.id), true));
    assert.deepEqual(store.list(), []);
    const next = store.create(input);
    assert.ok(next.id > Math.max(...created.map((task) => task.id)));
    created.forEach((task) => assert.equal(store.get(task.id), null));
    assert.deepEqual(store.list(), [next]);
  }));
});

test('Delete: rechaza IDs invalidos sin modificar las tareas', () => {
  fc.assert(fc.property(taskInput, invalidId, (input, id) => {
    const store = new TaskStore();
    const created = store.create(input);
    assert.throws(() => store.delete(id), TypeError);
    assert.deepEqual(store.list(), [created]);
  }));
});
