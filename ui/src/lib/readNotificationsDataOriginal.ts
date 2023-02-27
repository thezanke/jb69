import { AciNotification } from '../types/aciNotification';
import * as dataUtils from './dataUtils';
import { DECREASE_TREND } from './deviceInfo';

export const readNotificationsDataOriginal = (data: DataView) => {
  let i: number;
  let b: number;
  let b2: number;

  const trimmedData = new DataView(
    new Uint8Array(data.buffer).slice(10, 32).buffer,
  );

  const notifications: AciNotification[] = [];

  let curr = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (curr >= data.byteLength) break;

    const notification: Partial<AciNotification> = {};

    if (dataUtils.handleRangeError(() => trimmedData.getInt8(curr)) === 54) {
      if (trimmedData.getInt8(curr + 1) !== 0) {
        i = curr + 35;

        if (trimmedData.byteLength < i) {
          throw new Error('parse notification err');
        }

        notification.type = 1;

        const i3 = curr + 2;
        notification.advActive = !dataUtils.getBit(trimmedData.getInt8(i3), 0);
        notification.open = !dataUtils.getBit(trimmedData.getInt8(i3), 1);

        const i4 = curr + 3;
        notification.id = dataUtils.getBits(trimmedData.getInt8(i4), 0, 4);
        notification.groupIndex = dataUtils.getBits(
          trimmedData.getInt8(i4),
          4,
          4,
        );

        const i5 = curr + 4;
        notification.childId = dataUtils.getBits(trimmedData.getInt8(i5), 0, 4);
        notification.childIndex = dataUtils.getBits(
          trimmedData.getInt8(i5),
          4,
          4,
        );

        notification.day = trimmedData.getInt8(curr + 5);

        const b4 = trimmedData.getInt8(curr + 6);
        if (b4 !== -1 && (b2 = trimmedData.getInt8(curr + 7)) !== -1) {
          notification.start = String.fromCodePoint(b4 * 60 + b2);
        } else {
          notification.start = String.fromCodePoint(65535);
        }

        const b5 = trimmedData.getInt8(curr + 8);
        if (b5 !== -1 && (b = trimmedData.getInt8(curr + 9)) !== -1) {
          notification.end = String.fromCodePoint(b5 * 60 + b);
        } else {
          notification.end = String.fromCodePoint(65535);
        }

        notification.portType = trimmedData.getInt8(curr + 10);
        notification.portInfo = trimmedData.getInt8(curr + 11);
        notification.portStatus = trimmedData.getInt8(curr + 12);
        notification.model = trimmedData.getInt8(curr + 13);
        notification.gearSetModel = trimmedData.getInt8(curr + 14);
        notification.gearTransTmpF = trimmedData.getInt8(curr + 15);
        notification.gearTransHum = trimmedData.getInt8(curr + 16);
        notification.gearTransVpd = trimmedData.getInt8(curr + 17);
        notification.gearBuffTmpF = trimmedData.getInt8(curr + 18);
        notification.gearBuffHum = trimmedData.getInt8(curr + 19);
        notification.gearBuffVpd = trimmedData.getInt8(curr + 20);
        notification.switchBuffTmpF = trimmedData.getInt8(curr + 21);
        notification.switchBuffHum = trimmedData.getInt8(curr + 22);
        notification.switchBuffVpd = trimmedData.getInt8(curr + 23);

        const i6 = curr + 24;
        notification.levelOff = dataUtils.getBits(
          trimmedData.getInt8(i6),
          4,
          4,
        );
        notification.levelOn = dataUtils.getBits(trimmedData.getInt8(i6), 0, 4);

        const b6 = notification.model;
        if (b6 === 1) {
          notification.timeEnable = String.fromCodePoint(
            (trimmedData.getInt8(curr + 33) & 240) >> 4,
          );
          notification.timeDuration = String.fromCodePoint(
            ((trimmedData.getInt8(curr + 33) & 15) << 8) +
              trimmedData.getInt8(curr + 34),
          );
        } else if (b6 === 2) {
          notification.timeEnable = String.fromCodePoint(
            (trimmedData.getInt8(curr + 33) & 240) >> 4,
          );
          notification.timeDuration = String.fromCodePoint(
            ((trimmedData.getInt8(curr + 33) & 15) << 8) +
              trimmedData.getInt8(curr + 34),
          );
        } else if (b6 === 3) {
          notification.cycleOn = String.fromCodePoint(
            (((trimmedData.getInt8(curr + 27) & DECREASE_TREND) << 16) +
              ((trimmedData.getInt8(curr + 28) & DECREASE_TREND) << 8) +
              (trimmedData.getInt8(curr + 29) & DECREASE_TREND)) /
              60,
          );
          notification.cycleOff = String.fromCodePoint(
            (((trimmedData.getInt8(curr + 30) & DECREASE_TREND) << 16) +
              ((trimmedData.getInt8(curr + 31) & DECREASE_TREND) << 8) +
              (trimmedData.getInt8(curr + 32) & DECREASE_TREND)) /
              60,
          );

          const b9 = trimmedData.getInt8(curr + 33);
          notification.timeEnable = String.fromCodePoint((b9 & 240) >> 4);
          notification.timeDuration = String.fromCodePoint(
            ((b9 & 15) << 8) + trimmedData.getInt8(curr + 34),
          );
        } else if (b6 === 4) {
          notification.tmpHum = trimmedData.getInt8(curr + 25);
          notification.hTmpF = trimmedData.getInt8(curr + 26);
          notification.hTmpC = trimmedData.getInt8(curr + 27);
          notification.lTmpF = trimmedData.getInt8(curr + 28);
          notification.lTmpC = trimmedData.getInt8(curr + 29);
          notification.hHum = trimmedData.getInt8(curr + 30);
          notification.lHum = trimmedData.getInt8(curr + 31);
          notification.tTmpC = trimmedData.getInt8(curr + 33);
          notification.tTmpF = trimmedData.getInt8(curr + 32);
          notification.tHum = trimmedData.getInt8(curr + 34);
        } else if (b6 !== 5 && b6 === 6) {
          notification.vpdTmpHum = trimmedData.getInt8(curr + 25);
          notification.hVpd = trimmedData.getInt8(curr + 26);
          notification.lVpd = trimmedData.getInt8(curr + 27);
          notification.tVpd = trimmedData.getInt8(curr + 28);
        }

        curr = i;
        notifications.push(notification as AciNotification);
      } else {
        curr += 2;
      }
    } else if (
      dataUtils.handleRangeError(() => trimmedData.getInt8(curr + 1)) === 0
    ) {
      curr += 2;
    } else {
      i = curr + 10;

      if (trimmedData.byteLength < i) break;

      notification.type = 2;

      const i7 = curr + 2;
      notification.open = !dataUtils.getBit(trimmedData.getInt8(i7), 1);

      const bits = dataUtils.getBits(trimmedData.getInt8(i7), 2, 6);
      notification.id = bits;
      notification.groupIndex = bits;

      const b10 = trimmedData.getUint8(curr + 3);
      notification.model = b10;

      if (!dataUtils.getBit(b10, 2)) {
        notification.tmpHum = trimmedData.getInt8(curr + 4);
        notification.hTmpF = trimmedData.getInt8(curr + 5);
        notification.hTmpC = trimmedData.getInt8(curr + 6);
        notification.lTmpF = trimmedData.getInt8(curr + 7);
        notification.lTmpC = trimmedData.getInt8(curr + 8);
      } else if (!dataUtils.getBit(notification.model, 3)) {
        notification.tmpHum = trimmedData.getInt8(curr + 4);
        notification.hHum = trimmedData.getInt8(curr + 5);
        notification.lHum = trimmedData.getInt8(curr + 6);
      } else if (!dataUtils.getBit(notification.model, 4)) {
        notification.tmpHum = trimmedData.getInt8(curr + 4);
        notification.hVpd = trimmedData.getInt8(curr + 5);
        notification.lVpd = trimmedData.getInt8(curr + 6);
      } else if (!dataUtils.getBit(notification.model, 5)) {
        notification.port = trimmedData.getInt8(curr + 5);
      } else if (dataUtils.getBit(notification.model, 6)) {
        dataUtils.getBit(notification.model, 7);
      }

      notification.beeps = trimmedData.getUint8(curr + 9);
      notification.received = new Date();

      notifications.push(notification as AciNotification);

      curr = i;
    }
  }

  return notifications;
};
