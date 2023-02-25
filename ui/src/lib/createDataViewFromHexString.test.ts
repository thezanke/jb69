import { describe, expect, test } from 'vitest';
import { createDataViewFromHexString } from './createDataViewFromHexString';

describe('createDataViewFromHexString', () => {
  test('returns expected result for 0x-prefixed string', () => {
    expect(
      createDataViewFromHexString(
        '0xcbdd58d7aaa1435437373203078a07f714ed000480005d04000000',
      ).buffer,
    ).toStrictEqual(
      new Uint8Array([
        203, 221, 88, 215, 170, 161, 67, 84, 55, 55, 50, 3, 7, 138, 7, 247, 20,
        237, 0, 4, 128, 0, 93, 4, 0, 0, 0,
      ]).buffer,
    );
  });
});
