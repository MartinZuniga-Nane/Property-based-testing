function validateFields(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Task data must be an object');
  }
  if (Object.keys(input).some((key) => key !== 'title' && key !== 'completed')) {
    throw new TypeError('Only title and completed can be set');
  }
  if (Object.hasOwn(input, 'completed') && typeof input.completed !== 'boolean') {
    throw new TypeError('Completed must be a boolean');
  }
}

function normalizeTitle(title) {
  if (typeof title !== 'string') {
    throw new TypeError('Title must be a string');
  }
  const normalized = title.trim();
  if (normalized.length === 0 || normalized.length > 120) {
    throw new RangeError('Title must contain between 1 and 120 UTF-16 code units');
  }
  return normalized;
}

function validateId(id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new TypeError('ID must be a positive safe integer');
  }
}

export class TaskStore {
  #tasks = new Map();
  #nextId = 1;

  create(input) {
    validateFields(input);
    const title = normalizeTitle(input.title);
    const task = {
      id: this.#nextId++,
      title,
      completed: input.completed ?? false,
    };
    this.#tasks.set(task.id, task);
    return { ...task };
  }

  get(id) {
    validateId(id);
    const task = this.#tasks.get(id);
    return task ? { ...task } : null;
  }

  list() {
    return Array.from(this.#tasks.values(), (task) => ({ ...task }));
  }

  update(id, changes) {
    validateId(id);
    const current = this.#tasks.get(id);
    if (!current) {
      throw new RangeError('Task not found');
    }
    validateFields(changes);
    if (Object.keys(changes).length === 0) {
      throw new TypeError('At least one field must be provided');
    }
    const updated = { ...current };
    if (Object.hasOwn(changes, 'title')) {
      updated.title = normalizeTitle(changes.title);
    }
    if (Object.hasOwn(changes, 'completed')) {
      updated.completed = changes.completed;
    }
    this.#tasks.set(id, updated);
    return { ...updated };
  }
}
