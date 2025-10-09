import { describe, expect, it } from 'vitest';
import { shallowEqual as namedShallowEqual, shallowEqual } from './index';

describe('shallowEqual', () => {
  it('returns true for the same reference', () => {
    const obj = { a: 1 };
    expect(shallowEqual(obj, obj)).toBe(true);
  });

  it('returns false for null vs object', () => {
    expect(shallowEqual(null, {} as any)).toBe(false);
  });

  it('returns false when key lengths differ', () => {
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('returns false when a key is missing', () => {
    expect(shallowEqual({ a: 1 }, { b: 1 } as any)).toBe(false);
  });

  it('returns false when values differ by Object.is', () => {
    expect(shallowEqual({ a: NaN }, { a: 1 })).toBe(false);
  });

  it('returns true for shallowly equal objects', () => {
    expect(shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
  });

  it('named export works the same', () => {
    expect(namedShallowEqual({ a: 1 }, { a: 1 })).toBe(true);
  });
});
