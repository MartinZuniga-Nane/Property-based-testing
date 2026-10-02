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
}
