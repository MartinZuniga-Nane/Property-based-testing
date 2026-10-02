import assert from 'node:assert/strict';
import test from 'node:test';
import { TaskStore } from '../src/task-store.js';
import { fc, taskInput } from './generators.js';

const operation = fc.oneof(
  fc.record({ kind: fc.constant('create'), input: taskInput }),
  fc.record({ kind: fc.constant('read'), target: fc.nat() }),
  fc.record({ kind: fc.constant('update'), target: fc.nat(), input: taskInput }),
  fc.record({ kind: fc.constant('delete'), target: fc.nat() }),
  fc.constant({ kind: 'list' }),
);

test('CRUD: las secuencias de operaciones coinciden con el modelo esperado', () => {
  fc.assert(fc.property(fc.array(operation, { minLength: 1, maxLength: 80 }), (operations) => {
    const store = new TaskStore();
    let expected = [];
    let nextId = 1;

    for (const action of operations) {
      const id = (action.target ?? 0) % nextId + 1;
      const existing = expected.find((task) => task.id === id);
      switch (action.kind) {
        case 'create': {
          const task = { id: nextId++, title: action.input.title.trim(), completed: action.input.completed };
          assert.deepEqual(store.create(action.input), task);
          expected.push(task);
          break;
        }
        case 'read':
          assert.deepEqual(store.get(id), existing ?? null);
          break;
        case 'update': {
          if (existing) {
            const task = { id, title: action.input.title.trim(), completed: action.input.completed };
            assert.deepEqual(store.update(id, action.input), task);
            expected = expected.map((item) => item.id === id ? task : item);
          } else {
            assert.throws(() => store.update(id, action.input), RangeError);
          }
          break;
        }
        case 'delete':
          assert.equal(store.delete(id), existing !== undefined);
          expected = expected.filter((task) => task.id !== id);
          break;
        case 'list':
          assert.deepEqual(store.list(), expected);
          break;
      }
      assert.deepEqual(store.list(), expected);
      expected.forEach((task) => assert.deepEqual(store.get(task.id), task));
    }
  }));
});

test('CRUD: cada tarea puede crearse, leerse, actualizarse y eliminarse', () => {
  fc.assert(fc.property(taskInput, taskInput, (input, changes) => {
    const store = new TaskStore();
    const created = store.create(input);
    assert.deepEqual(store.get(created.id), created);
    const updated = store.update(created.id, changes);
    assert.equal(updated.id, created.id);
    assert.equal(updated.title, changes.title.trim());
    assert.equal(updated.completed, changes.completed);
    assert.deepEqual(store.get(created.id), updated);
    assert.equal(store.delete(created.id), true);
    assert.equal(store.get(created.id), null);
    assert.deepEqual(store.list(), []);
  }));
});
