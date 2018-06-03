// @flow
import invariant from 'assert';
import {$$asyncIterator, getAsyncIterator, getIterator} from 'iterall';
import type {Eitherable} from './types';

// Or, targetting `node@10`.
// export default async function* thenAsyncIterator(iterable, promise) {
//   await promise;
//   yield* iterable;
// }

export default function thenAsyncIterator<Yield>(
  iterable: Eitherable<Yield>,
  promise: Promise<any>,
): AsyncIterator<Yield> {
  const resolved = Promise.resolve(promise);
  const iterator = getAsyncIterator(iterable) || getIterator(iterable);
  invariant(iterator, '"iterable" must be an AsyncIterable or Iterable.');
  // $FlowFixMe
  return {
    [$$asyncIterator]() {
      return this;
    },
    next() {
      return resolved.then(() => iterator.next());
    },
  };
}
