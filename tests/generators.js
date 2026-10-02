import fc from 'fast-check';

const numRuns = Number(process.env.FC_NUM_RUNS ?? 500);
const seed = process.env.FC_SEED === undefined ? undefined : Number(process.env.FC_SEED);
if (!Number.isSafeInteger(numRuns) || numRuns <= 0) {
  throw new RangeError('FC_NUM_RUNS must be a positive integer');
}
if (seed !== undefined && (!Number.isInteger(seed) || seed < -2147483648 || seed > 2147483647)) {
  throw new RangeError('FC_SEED must be a signed 32-bit integer');
}
fc.configureGlobal({ numRuns, ...(seed === undefined ? {} : { seed }) });

export { fc };
export const title = fc.oneof(
  fc.string({ minLength: 1, maxLength: 120 }),
  fc.string({ unit: 'binary', minLength: 1, maxLength: 120 }),
).filter((value) => value.trim().length > 0 && value.trim().length <= 120);
export const taskInput = fc.record({ title, completed: fc.boolean() });
export const invalidTitle = fc.oneof(
  fc.constantFrom(undefined, null, true, false),
  fc.integer(),
  fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { maxLength: 150 }).map((parts) => parts.join('')),
  fc.string({ minLength: 121, maxLength: 200 }).map((value) => `x${value}x`),
);
export const invalidInput = fc.oneof(
  fc.constantFrom(undefined, null), fc.boolean(), fc.integer(), fc.string(), fc.array(fc.integer()),
);
export const invalidCompleted = fc.oneof(
  fc.constantFrom(undefined, null), fc.integer(), fc.string(), fc.array(fc.boolean()),
);
