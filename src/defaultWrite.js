// @flow
import invariant from 'assert';
import {forAwaitEach} from 'iterall';
import type {Eitherable} from './types';

export default function defaultWrite<Yield>(
  iterable: Eitherable<Yield>,
  buffer: Array<Yield>,
) {
  invariant(
    typeof buffer.push === 'function',
    'When using the default "write" function, "buffer.push" must be a function.',
  );
  return forAwaitEach(iterable, data => buffer.push(data));
}
