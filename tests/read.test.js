import assert from 'node:assert/strict';
import test from 'node:test';
import { TaskStore } from '../src/task-store.js';
import { fc, taskInput, invalidId } from './generators.js';

test('Read: obtener y listar conservan los datos y el estado', () => {
  fc.assert(fc.property(fc.array(taskInput, { maxLength: 40 }), (inputs) => {
    const store = new TaskStore();
    const created = inputs.map((input) => store.create(input));
    created.forEach((task) => {
      assert.deepEqual(store.get(task.id), task);
      assert.deepEqual(store.get(task.id), task);
    });
    assert.deepEqual(store.list(), created);
    assert.deepEqual(store.list(), created);
  }));
});

test('Read: un ID inexistente devuelve null sin cambiar el listado', () => {
  fc.assert(fc.property(fc.array(taskInput, { maxLength: 30 }), fc.integer({ min: 1 }), (inputs, offset) => {
    const store = new TaskStore();
    const created = inputs.map((input) => store.create(input));
    assert.equal(store.get(created.length + offset), null);
    assert.deepEqual(store.list(), created);
  }));
});

test('Read: cambiar entradas o resultados de create y get no altera el almacen', () => {
  fc.assert(fc.property(taskInput, (input) => {
    const store = new TaskStore();
    const data = { ...input };
    const created = store.create(data);
    const expected = { ...created };
    data.title = 'Modificada';
    data.completed = !data.completed;
    created.title = 'Modificada';
    created.completed = !created.completed;
    created.id = 0;
    const read = store.get(expected.id);
    assert.deepEqual(read, expected);
    read.title = 'Otra';
    read.completed = !read.completed;
    read.id = 0;
    assert.deepEqual(store.get(expected.id), expected);
  }));
});

test('Read: el listado y sus elementos son copias independientes', () => {
  fc.assert(fc.property(fc.array(taskInput, { minLength: 1, maxLength: 30 }), (inputs) => {
    const store = new TaskStore();
    const expected = inputs.map((input) => store.create(input));
    const listed = store.list();
    listed[0].title = 'Modificada';
    listed[0].completed = !listed[0].completed;
    listed[0].id = 0;
    listed.reverse();
    listed.pop();
    listed.push({ id: 0, title: 'Extra', completed: false });
    assert.deepEqual(store.list(), expected);
  }));
});

test('Read: rechaza IDs invalidos sin modificar las tareas', () => {
  fc.assert(fc.property(taskInput, invalidId, (input, id) => {
    const store = new TaskStore();
    const created = store.create(input);
    assert.throws(() => store.get(id), TypeError);
    assert.deepEqual(store.list(), [created]);
  }));
});
