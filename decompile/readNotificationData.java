   public static List<Notification> parseNotifications(byte[] bArr) {
        int i;
        byte b;
        byte b2;
        byte[] trimmedData = b(bArr);
        ArrayList arrayList = new ArrayList();
        int curr = 0;
        while (true) {
            if (curr >= trimmedData.length) {
                break;
            }
            Notification notification = new Notification();
            if (trimmedData[curr] == 54) {
                if (trimmedData[curr + 1] != 0) {
                    i = curr + 35;
                    if (trimmedData.length < i) {
                        a80.e("parse notification err");
                        break;
                    }
                    notification.type = (byte) 1;
                    int i3 = curr + 2;
                    notification.advActive = !zf.getBit(trimmedData[i3], 0);
                    notification.open = !zf.getBit(trimmedData[i3], 1);
                    int i4 = curr + 3;
                    notification.id = zf.getBits(trimmedData[i4], 0, 4);
                    notification.groupIndex = (byte) zf.getBits(trimmedData[i4], 4, 4);
                    int i5 = curr + 4;
                    notification.childId = (byte) zf.getBits(trimmedData[i5], 0, 4);
                    notification.childIndex = (byte) zf.getBits(trimmedData[i5], 4, 4);
                    notification.day = trimmedData[curr + 5];
                    byte b4 = trimmedData[curr + 6];
                    if (b4 != -1 && (b2 = trimmedData[curr + 7]) != -1) {
                        notification.start = (char) ((b4 * 60) + b2);
                    } else {
                        notification.start = (char) 65535;
                    }
                    byte b5 = trimmedData[curr + 8];
                    if (b5 != -1 && (b = trimmedData[curr + 9]) != -1) {
                        notification.end = (char) ((b5 * 60) + b);
                    } else {
                        notification.end = (char) 65535;
                    }
                    notification.portType = trimmedData[curr + 10];
                    notification.portInfo = trimmedData[curr + 11];
                    notification.portStatus = trimmedData[curr + 12];
                    notification.model = trimmedData[curr + 13];
                    notification.gearSetModel = trimmedData[curr + 14];
                    notification.gearTransTmpF = trimmedData[curr + 15];
                    notification.gearTransHum = trimmedData[curr + 16];
                    notification.gearTransVpd = trimmedData[curr + 17];
                    notification.gearBuffTmpF = trimmedData[curr + 18];
                    notification.gearBuffHum = trimmedData[curr + 19];
                    notification.gearBuffVpd = trimmedData[curr + 20];
                    notification.switchBuffTmpF = trimmedData[curr + 21];
                    notification.switchBuffHum = trimmedData[curr + 22];
                    notification.switchBuffVpd = trimmedData[curr + 23];
                    int i6 = curr + 24;
                    notification.levelOff = zf.getBits(trimmedData[i6], 4, 4);
                    notification.levelOn = zf.getBits(trimmedData[i6], 0, 4);
                    byte b6 = notification.model;
                    if (b6 == 1) {
                        notification.timeEnable = (char) ((trimmedData[curr + 33] & 240) >> 4);
                        notification.timeDuration = (char) (((trimmedData[curr + 33] & 15) << 8) + trimmedData[curr + 34]);
                    } else if (b6 == 2) {
                        notification.timeEnable = (char) ((trimmedData[curr + 33] & 240) >> 4);
                        notification.timeDuration = (char) (((trimmedData[curr + 33] & 15) << 8) + trimmedData[curr + 34]);
                    } else if (b6 == 3) {
                        notification.cycleOn = (char) (((((trimmedData[curr + 27] & DeviceInfo.DECREASE_TREND) << 16) + ((trimmedData[curr + 28] & DeviceInfo.DECREASE_TREND) << 8)) + (trimmedData[curr + 29] & DeviceInfo.DECREASE_TREND)) / 60);
                        notification.cycleOff = (char) (((((trimmedData[curr + 30] & DeviceInfo.DECREASE_TREND) << 16) + ((trimmedData[curr + 31] & DeviceInfo.DECREASE_TREND) << 8)) + (trimmedData[curr + 32] & DeviceInfo.DECREASE_TREND)) / 60);
                        byte b9 = trimmedData[curr + 33];
                        notification.timeEnable = (char) ((b9 & 240) >> 4);
                        notification.timeDuration = (char) (((b9 & 15) << 8) + trimmedData[curr + 34]);
                    } else if (b6 == 4) {
                        notification.tmpHum = trimmedData[curr + 25];
                        notification.hTmpF = trimmedData[curr + 26];
                        notification.hTmpC = trimmedData[curr + 27];
                        notification.lTmpF = trimmedData[curr + 28];
                        notification.lTmpC = trimmedData[curr + 29];
                        notification.hHum = trimmedData[curr + 30];
                        notification.lHum = trimmedData[curr + 31];
                        notification.tTmpC = trimmedData[curr + 33];
                        notification.tTmpF = trimmedData[curr + 32];
                        notification.tHum = trimmedData[curr + 34];
                    } else if (b6 != 5 && b6 == 6) {
                        notification.vpdTmpHum = trimmedData[curr + 25];
                        notification.hVpd = trimmedData[curr + 26];
                        notification.lVpd = trimmedData[curr + 27];
                        notification.tVpd = trimmedData[curr + 28];
                    }
                    curr = i;
                    arrayList.add(notification);
                } else {
                    curr += 2;
                }
            } else if (trimmedData[curr + 1] == 0) {
                curr += 2;
            } else {
                i = curr + 10;
                if (trimmedData.length < i) {
                    break;
                }
                notification.type = (byte) 2;
                int i7 = curr + 2;
                notification.open = true ^ zf.getBit(trimmedData[i7], 1);
                int bits = zf.getBits(trimmedData[i7], 2, 6);
                notification.id = bits;
                notification.groupIndex = (byte) bits;
                byte b10 = trimmedData[curr + 3];
                notification.model = b10;
                if (!zf.getBit(b10, 2)) {
                    notification.tmpHum = trimmedData[curr + 4];
                    notification.hTmpF = trimmedData[curr + 5];
                    notification.hTmpC = trimmedData[curr + 6];
                    notification.lTmpF = trimmedData[curr + 7];
                    notification.lTmpC = trimmedData[curr + 8];
                } else if (!zf.getBit(notification.model, 3)) {
                    notification.tmpHum = trimmedData[curr + 4];
                    notification.hHum = trimmedData[curr + 5];
                    notification.lHum = trimmedData[curr + 6];
                } else if (!zf.getBit(notification.model, 4)) {
                    notification.tmpHum = trimmedData[curr + 4];
                    notification.hVpd = trimmedData[curr + 5];
                    notification.lVpd = trimmedData[curr + 6];
                } else if (!zf.getBit(notification.model, 5)) {
                    notification.port = trimmedData[curr + 5];
                } else if (zf.getBit(notification.model, 6)) {
                    zf.getBit(notification.model, 7);
                }
                notification.beeps = trimmedData[curr + 9];
                curr = i;
                arrayList.add(notification);
            }
        }
        return arrayList;
    }
