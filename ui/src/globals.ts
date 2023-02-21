import { createDataViewFromHexString } from './lib/createDataViewFromHexString';
import { readNotificationsData } from './lib/readNotificationsData';
import { readScanRecordData } from './lib/readScanRecordData';

window.readScanRecordData = readScanRecordData;
window.createDataViewFromHexString = createDataViewFromHexString;
window.readNotificationData = readNotificationsData;
