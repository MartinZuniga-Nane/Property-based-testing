import assert from 'node:assert/strict';
import test from 'node:test';
import { TaskStore } from '../src/task-store.js';
import { fc, title, taskInput, invalidTitle, invalidInput, invalidCompleted } from './generators.js';

test('Create: conserva los datos validos y asigna IDs unicos', () => {
  fc.assert(fc.property(fc.array(taskInput, { minLength: 1, maxLength: 40 }), (inputs) => {
    const store = new TaskStore();
    const tasks = inputs.map((input) => store.create(input));
    assert.equal(new Set(tasks.map((task) => task.id)).size, inputs.length);
    tasks.forEach((task, index) => {
      assert.ok(Number.isSafeInteger(task.id) && task.id > 0);
      assert.equal(task.title, inputs[index].title.trim());
      assert.equal(task.completed, inputs[index].completed);
    });
  }));
});

test('Create: las tareas nuevas estan pendientes por defecto', () => {
  fc.assert(fc.property(title, (value) => {
    const task = new TaskStore().create({ title: value });
    assert.equal(task.completed, false);
    assert.equal(task.title, value.trim());
  }), { examples: [['  Estudiar PBT  '], ['á漢字📝'], ['x'.repeat(120)]] });
});

test('Create: rechaza titulos invalidos sin consumir IDs', () => {
  fc.assert(fc.property(invalidTitle, taskInput, (value, valid) => {
    const store = new TaskStore();
    assert.throws(() => store.create({ title: value }));
    assert.equal(store.create(valid).id, 1);
  }));
});

test('Create: rechaza entradas y estados de tipo incorrecto', () => {
  fc.assert(fc.property(invalidInput, invalidCompleted, title, (input, completed, value) => {
    const store = new TaskStore();
    assert.throws(() => store.create(input), TypeError);
    assert.throws(() => store.create({ title: value, completed }), TypeError);
    assert.equal(store.create({ title: value }).id, 1);
  }));
});

test('Create: el ID solo puede asignarlo el gestor', () => {
  fc.assert(fc.property(taskInput, fc.anything(), (input, id) => {
    const store = new TaskStore();
    assert.throws(() => store.create({ ...input, id }), TypeError);
    assert.equal(store.create(input).id, 1);
  }));
});
