import { describe, expect, test } from 'vitest';
import { createDataViewFromHexString } from './createDataViewFromHexString';
import { readScanRecordData } from './readScanRecordData';

const dataView = Object.freeze(
  createDataViewFromHexString(
    '0xcbdd58d7aaa1435437373203078a07f714ed000480005d04000000',
  ),
);

describe('readScanRecordData', () => {
  test('returns expected result', () => {
    expect(readScanRecordData(dataView)).toEqual({
      version: 3,
      type: 7,
      typeName: 'CT772',
      canBeAdded: 0,
      isCelcius: true,
      fanState: 0,
      tmpState: 2,
      humState: 2,
      temp: 20.39,
      humid: 53.57,
    });
  });
});
