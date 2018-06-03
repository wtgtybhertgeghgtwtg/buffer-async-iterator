// @flow
export type Eitherable<Yield> = AsyncIterable<Yield> | Iterable<Yield>;

/**
 * I dunno.
 * @callback Write
 */
export type Write<
  Yield,
  MappedYield,
  Interable: Eitherable<Yield>,
  Bufferable: Eitherable<MappedYield>,
> = (iterable: Interable, buffer: Bufferable) => Promise<void>;
