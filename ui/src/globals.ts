import { createDataViewFromHexString } from './lib/createDataViewFromHexString';
import { readMfrData } from './lib/readMfrData';
import { readNotificationsData } from './lib/readNotificationsData';
import { bluetoothService } from './services/bluetooth.service';

window.readMfrData = readMfrData;
window.createDataViewFromHexString = createDataViewFromHexString;
window.readNotificationData = readNotificationsData;
window.bluetoothService = bluetoothService;
