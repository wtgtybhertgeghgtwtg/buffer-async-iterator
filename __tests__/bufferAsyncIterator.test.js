// @flow
/* eslint-disable require-yield */
import bufferAsyncIterator from '../src';

async function* sample(done = () => {}) {
  yield 1;
  yield 2;
  yield 3;
  done();
}

function* syncSample(done = () => {}) {
  yield 1;
  yield 2;
  yield 3;
  done();
}

describe('bufferAsyncIterator', () => {
  describe('invariants', () => {
    it('throws if "iterable" is neither an AsyncIterable nor an Iterable.', () => {
      // $FlowFixMe
      expect(() => bufferAsyncIterator(3)).toThrow(
        '"iterable" must be an AsyncIterable or Iterable.',
      );
    });

    it('throws if "write" is neither a function nor undefined.', () => {
      expect(() =>
        // $FlowFixMe
        bufferAsyncIterator([], 'Neither a function nor undefined.'),
      ).toThrow('"write" must be a function or undefined.');
    });

    it('throws if "buffer" is neither an AsyncIterable, an Iterable, or undefined.', () => {
      // $FlowFixMe
      expect(() => bufferAsyncIterator([], undefined, 3)).toThrow(
        '"buffer" must be an AsyncIterable, an Iterable, or undefined.',
      );
    });

    it('throws if "write" is undefined and "buffer.push" is not a function.', () => {
      expect(() => bufferAsyncIterator([], undefined, new Map())).toThrow(
        'When using the default "write" function, "buffer.push" must be a function.',
      );
    });
  });

  describe('default buffering', () => {
    it('buffers an AsyncIterable.', done => {
      bufferAsyncIterator(sample(done));
    });

    it('buffers an Iterable.', done => {
      bufferAsyncIterator(syncSample(done));
    });

    it('passes through all values.', async () => {
      const values = [1, 2, 3];
      let index = 0;
      for await (const value of bufferAsyncIterator(values)) {
        expect(values[index]).toEqual(value);
        index += 1;
      }
    });

    it('rejects if "iterable" rejects.', async () => {
      const message = 'Iterable error.';

      async function* rejectSample() {
        throw new Error(message);
      }

      await expect(bufferAsyncIterator(rejectSample()).next()).rejects.toThrow(
        message,
      );
    });

    it('rejects if "iterable" throws.', async () => {
      const message = 'Iterable error.';

      function* rejectSample() {
        throw new Error(message);
      }

      await expect(bufferAsyncIterator(rejectSample()).next()).rejects.toThrow(
        message,
      );
    });
  });

  describe('with a "write" function.', () => {
    it('does not iterate through "buffer" until "write" resolves.', async () => {
      let hasResolved = false;
      async function write() {
        hasResolved = true;
      }
      await bufferAsyncIterator(sample(), write).next();
      expect(hasResolved).toBe(true);
    });

    it('rejects if "write" rejects.', async () => {
      const message = 'Write error.';

      async function write() {
        throw new Error(message);
      }
      await expect(bufferAsyncIterator(sample(), write).next()).rejects.toThrow(
        message,
      );
    });

    it('yields the values "write" adds to "buffer".', async () => {
      async function write(iterable, buffer) {
        for (const value of iterable) {
          buffer.push(value * 3);
        }
      }

      const values = [1, 2, 3];
      let index = 0;

      for await (const value of bufferAsyncIterator(values, write)) {
        expect(value).toBe(values[index] * 3);
        index += 1;
      }
    });
  });

  describe('with a "buffer".', () => {
    it('rejects if "buffer" rejects.', async () => {
      const message = 'Buffer error.';

      async function* buffer() {
        throw new Error(message);
      }

      await expect(
        bufferAsyncIterator(sample(), () => {}, buffer()).next(),
      ).rejects.toThrow(message);
    });
  });
});
