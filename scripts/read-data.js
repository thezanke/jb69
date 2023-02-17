import { delay } from '../common/delay.js';
import { BLEService } from '../lib/ble-service.js';

const DEVICE_69 = 'CB:DD:58:D7:AA:A1';
const SERVICE_1_UUID = '70d51000-2c7f-4e75-ae8a-d758951ce4e0';
const CHAR_1_UUID = '70d51002-2c7f-4e75-ae8a-d758951ce4e0';

const ble = new BLEService();
await ble.connectToDevice(DEVICE_69);
const stopStream = await ble.streamNotifications(
  SERVICE_1_UUID,
  CHAR_1_UUID,
  (buffer) => {
    console.log(buffer);
  },
);

await delay(25_000);
await stopStream();
await ble.disconnect();
