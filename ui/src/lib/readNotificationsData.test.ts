import _ from 'lodash';
import { describe, expect, test } from 'vitest';
import { AciNotification } from '../types/aciNotification';
import { readNotificationsData } from './readNotificationsData';
import { readNotificationsDataOriginal } from './readNotificationsDataOriginal';

const dv = Object.freeze(
  new DataView(
    new Uint8Array([
      30, 255, 2, 9, 3, 28, 76, 4, 8, 55, 20, 198, 0, 99, 0, 0, 0, 1, 38, 213,
      0, 51, 19, 161, 0, 35, 12, 140, 0, 7, 61, 48, 0, 3,
    ]).buffer,
  ),
);

// omit received since it's `new Date()` and can be different
const omitReceived = (results: AciNotification[]) =>
  _.map(results, (n) => _.omit(n, 'received'));

describe('readNotificationData', () => {
  test('results match original implementation', () => {
    expect(omitReceived(readNotificationsData(dv))).toEqual(
      omitReceived(readNotificationsDataOriginal(dv)),
    );
  });
});
