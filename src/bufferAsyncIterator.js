// @flow
/* eslint-disable no-redeclare */
import invariant from 'assert';
import {isAsyncIterable, isIterable} from 'iterall';
import defaultWrite from './defaultWrite';
import thenAsyncIterator from './thenAsyncIterator';
import type {Eitherable, Write} from './types';

declare function bufferAsyncIterator<Yield>(
  iterable: Eitherable<Yield>,
): AsyncIterator<Yield>;

declare function bufferAsyncIterator<
  Yield,
  MappedYield,
  Interable: Eitherable<Yield>,
>(
  iterable: Interable,
  write: Write<Yield, MappedYield, Interable, Array<MappedYield>>,
): AsyncIterator<MappedYield>;

declare function bufferAsyncIterator<
  Yield,
  MappedYield,
  Interable: Eitherable<Yield>,
  Bufferable: Eitherable<MappedYield>,
>(
  iterable: Interable,
  write?: Write<Yield, MappedYield, Interable, Bufferable>,
  buffer: Bufferable,
): AsyncIterator<MappedYield>;

/**
 * Create an AsyncIterator from `iterable`, with the values eagerly buffered.
 * @example
 * import bufferAsyncIterator from 'bufferAsyncIterator';
 * import got from 'got';
 *
 * async function* getWebsites(sites) {
 *   for (const site of sites) {
 *     const {requestUrl} = got.head(site);
 *     yield requestUrl;
 *   }
 * }
 *
 * // Immediate start running the generator.
 * const websiteIterator = bufferAsyncIterator(getWebsites(['google.com', 'bing.com', 'yahoo.com']));
 *
 * // Other potentially time-consuming stuff here.
 *
 * // Iteration begins only after the original generator has finished.
 * for await (const site of websiteIterator) {
 *   console.log(site);
 * }
 *
 * @param {AsyncIterable<Value>|Iterable<Value>} iterable The iterable whose values will be buffered.
 * @param {Write} write A function that takes `iterable` and `buffer` and returns a Promise.  `buffer` will not be iterated through until it resolves.
 * @param {AsyncIterable<Value>|Iterable<Value>} buffer An iterable representing the data being buffered.
 */
export default function bufferAsyncIterator(
  iterable,
  write = defaultWrite,
  buffer = [],
) {
  invariant(
    isAsyncIterable(iterable) || isIterable(iterable),
    '"iterable" must be an AsyncIterable or Iterable.',
  );
  invariant(
    typeof write === 'function',
    '"write" must be a function or undefined.',
  );
  invariant(
    isAsyncIterable(buffer) || isIterable(buffer),
    '"buffer" must be an AsyncIterable, an Iterable, or undefined.',
  );
  const writePromise = write(iterable, buffer);
  return thenAsyncIterator(buffer, writePromise);
}
