import { BLEService } from '../lib/ble-service.js';
import { configService } from '../lib/config-service.js';
import { InfluxService } from '../lib/influx-service.js';

const DEVICE_69 = 'CB:DD:58:D7:AA:A1';
const SERVICE_1_UUID = '70d51000-2c7f-4e75-ae8a-d758951ce4e0';
const CHAR_1_UUID = '70d51002-2c7f-4e75-ae8a-d758951ce4e0';

const influxService = new InfluxService(configService.influxDb);

const ble = new BLEService();
await ble.connectToDevice(DEVICE_69);
const stopStream = await ble.streamNotifications(
  DEVICE_69,
  SERVICE_1_UUID,
  CHAR_1_UUID,
  async (buffer) => {
    await influxService.write(buffer.toString('hex'), 'string', CHAR_1_UUID);
  },
);

process.on('SIGINT', async () => {
  await stopStream();
  await ble.disconnectFromDevice(DEVICE_69);
  await influxService.close();
  process.exit();
});
