import assert from 'node:assert/strict';
import test from 'node:test';
import { TaskStore } from '../src/task-store.js';
import { fc, taskInput, invalidTitle, invalidCompleted, invalidInput, invalidId } from './generators.js';

test('Update: conserva el ID, la cantidad y las otras tareas', () => {
  fc.assert(fc.property(
    fc.array(taskInput, { minLength: 2, maxLength: 30 }), taskInput, fc.nat(),
    (inputs, changes, index) => {
      const store = new TaskStore();
      const before = inputs.map((input) => store.create(input));
      const selected = index % before.length;
      const id = before[selected].id;
      const updated = store.update(id, changes);
      const expected = { id, title: changes.title.trim(), completed: changes.completed };
      assert.deepEqual(updated, expected);
      assert.deepEqual(store.get(id), expected);
      assert.deepEqual(store.list(), before.map((task, i) => i === selected ? expected : task));
    },
  ));
});

test('Update: una actualizacion parcial conserva el campo omitido', () => {
  fc.assert(fc.property(taskInput, taskInput, fc.boolean(), (input, changes, changeTitle) => {
    const store = new TaskStore();
    const created = store.create(input);
    const patch = changeTitle ? { title: changes.title } : { completed: changes.completed };
    const expected = changeTitle
      ? { ...created, title: changes.title.trim() }
      : { ...created, completed: changes.completed };
    assert.deepEqual(store.update(created.id, patch), expected);
    assert.deepEqual(store.get(created.id), expected);
  }));
});

test('Update: aplicar el mismo cambio dos veces produce el mismo estado', () => {
  fc.assert(fc.property(taskInput, taskInput, (input, changes) => {
    const store = new TaskStore();
    const created = store.create(input);
    const first = store.update(created.id, changes);
    assert.deepEqual(store.update(created.id, changes), first);
    assert.deepEqual(store.list(), [first]);
  }));
});

test('Update: los cambios invalidos se rechazan sin modificar el estado', () => {
  fc.assert(fc.property(
    taskInput, invalidTitle, invalidCompleted, invalidInput,
    (input, badTitle, badCompleted, badInput) => {
      const store = new TaskStore();
      const created = store.create(input);
      const invalidChanges = [
        { title: badTitle, completed: !created.completed },
        { title: 'Valida', completed: badCompleted },
        badInput,
        {},
        { id: created.id + 1 },
        { title: 'Valida', extra: true },
      ];
      invalidChanges.forEach((changes) => {
        assert.throws(() => store.update(created.id, changes));
        assert.deepEqual(store.list(), [created]);
      });
    },
  ));
});

test('Update: rechaza IDs invalidos o inexistentes sin crear tareas', () => {
  fc.assert(fc.property(taskInput, invalidId, fc.integer({ min: 2 }), (input, badId, missingId) => {
    const store = new TaskStore();
    const created = store.create(input);
    assert.throws(() => store.update(badId, input), TypeError);
    assert.throws(() => store.update(missingId, input), RangeError);
    assert.deepEqual(store.list(), [created]);
  }));
});

test('Update: modificar el resultado o los cambios no altera la tarea guardada', () => {
  fc.assert(fc.property(taskInput, taskInput, (input, changes) => {
    const store = new TaskStore();
    const created = store.create(input);
    const patch = { ...changes };
    const updated = store.update(created.id, patch);
    const expected = { ...updated };
    patch.title = 'Otra';
    patch.completed = !patch.completed;
    updated.title = 'Otra';
    updated.completed = !updated.completed;
    updated.id = 0;
    assert.deepEqual(store.get(created.id), expected);
  }));
});
