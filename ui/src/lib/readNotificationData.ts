import { Notification } from '../lib/Notification';
import * as byteUtils from './byteUtils';
import { DECREASE_TREND } from './deviceInfo';

const dec = new TextDecoder('utf-8');

export const readNotificationData = (data: DataView) => {
  let i: number;

  const trimmedData = new DataView(
    new Uint8Array(data.buffer).slice(10, 32).buffer,
  );

  const arrayList = [];
  let curr = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (curr >= data.byteLength) break;
    const notification: Partial<Notification> = {};
    if (trimmedData.getInt8(curr) === 0x46) {
      if (trimmedData.getInt8(curr + 1) !== 0) {
        i = curr + 35;
        if (trimmedData.byteLength < i) {
          throw new Error('parse notification err');
        }
        notification.type = 1;

        let byte = trimmedData.getInt8(curr + 2);
        notification.advActive = !byteUtils.getBit(byte, 0);
        notification.open = !byteUtils.getBit(byte, 1);

        byte = trimmedData.getInt8(curr + 3);
        notification.id = byteUtils.getBits(byte, 0, 4);
        notification.groupIndex = byteUtils.getBits(byte, 4, 4);

        byte = trimmedData.getInt8(curr + 4);
        notification.childId = byteUtils.getBits(byte, 0, 4);
        notification.childIndex = byteUtils.getBits(byte, 4, 4);

        notification.day = trimmedData.getInt8(curr + 5);

        byte = trimmedData.getInt8(curr + 6);
        let byte2 = trimmedData.getInt8(curr + 7);
        if (byte !== -1 && byte2 !== -1) {
          notification.start = String.fromCodePoint(byte * 60 + byte2);
        } else {
          notification.start = String.fromCodePoint(65535);
        }

        byte = trimmedData.getInt8(curr + 8);
        byte2 = trimmedData.getInt8(curr + 9);
        if (byte !== -1 && byte2 !== -1) {
          notification.end = String.fromCodePoint(byte * 60 + byte2);
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

        byte = trimmedData.getInt8(curr + 24);
        notification.levelOff = byteUtils.getBits(byte, 4, 4);
        notification.levelOn = byteUtils.getBits(byte, 0, 4);

        if (notification.model === 1 || notification.model === 2) {
          byte = trimmedData.getInt8(curr + 33);
          notification.timeEnable = String.fromCodePoint((byte & 240) >> 4);
          notification.timeDuration = String.fromCodePoint(
            ((byte & 15) << 8) + trimmedData.getInt8(curr + 34),
          );
        } else if (notification.model === 3) {
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

          byte = trimmedData.getInt8(curr + 33);
          notification.timeEnable = String.fromCodePoint((byte & 240) >> 4);
          notification.timeDuration = String.fromCodePoint(
            ((byte & 15) << 8) + trimmedData.getInt8(curr + 34),
          );
        } else if (notification.model === 4) {
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
        } else if (notification.model === 6) {
          notification.vpdTmpHum = trimmedData.getInt8(curr + 25);
          notification.hVpd = trimmedData.getInt8(curr + 26);
          notification.lVpd = trimmedData.getInt8(curr + 27);
          notification.tVpd = trimmedData.getInt8(curr + 28);
        }

        curr = i;
        arrayList.push(notification);
      } else {
        curr += 2;
      }
    } else if (trimmedData.getInt8(curr + 1) === 0) {
      curr += 2;
    } else {
      i = curr + 10;
      if (trimmedData.byteLength < i) break;

      notification.type = 2;

      let byte = trimmedData.getInt8(curr + 2);
      notification.open = Boolean(1 ^ byteUtils.getBit(byte, 1));

      const bits = byteUtils.getBits(byte, 2, 6);
      notification.id = bits;
      notification.groupIndex = bits;

      byte = trimmedData.getInt8(curr + 3);
      notification.model = byte;
      if (!byteUtils.getBit(byte, 2)) {
        notification.tmpHum = trimmedData.getInt8(curr + 4);
        notification.hTmpF = trimmedData.getInt8(curr + 5);
        notification.hTmpC = trimmedData.getInt8(curr + 6);
        notification.lTmpF = trimmedData.getInt8(curr + 7);
        notification.lTmpC = trimmedData.getInt8(curr + 8);
      } else if (!byteUtils.getBit(notification.model, 3)) {
        notification.tmpHum = trimmedData.getInt8(curr + 4);
        notification.hHum = trimmedData.getInt8(curr + 5);
        notification.lHum = trimmedData.getInt8(curr + 6);
      } else if (!byteUtils.getBit(notification.model, 4)) {
        notification.tmpHum = trimmedData.getInt8(curr + 4);
        notification.hVpd = trimmedData.getInt8(curr + 5);
        notification.lVpd = trimmedData.getInt8(curr + 6);
      } else if (!byteUtils.getBit(notification.model, 5)) {
        notification.port = trimmedData.getInt8(curr + 5);
      }
      notification.beeps = trimmedData.getInt8(curr + 9);
      curr = i;
      arrayList.push(notification);
    }
  }
  return arrayList;
};
