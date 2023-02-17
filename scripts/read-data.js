import * as NodeBLE from 'node-ble';
import { delay } from '../common/delay.js';

const DEVICE_69 = 'CB:DD:58:D7:AA:A1';
const SERVICE_1_UUID = '70d51000-2c7f-4e75-ae8a-d758951ce4e0';
const CHAR_1_UUID = '70d51002-2c7f-4e75-ae8a-d758951ce4e0';

const { bluetooth } = NodeBLE.createBluetooth();

class BLEService {
  /**
   * @type {NodeBLE.Adapter|null}
   * @private
   */
  #adapter = null;

  async init() {
    await this.#getAdapter();
    // await this.#quickPoll();
    await this.#printDevices();
    const device = await this.#adapter.waitDevice(DEVICE_69);

    const alreadyConnected = await device.isConnected();
    if (!alreadyConnected) {
      await device.connect();
    }

    const gattServer = await device.gatt();
    const services = await gattServer.services();
    console.log({ services });

    const service = await gattServer.getPrimaryService(SERVICE_1_UUID);
    const characteristic = await service.getCharacteristic(CHAR_1_UUID);
    characteristic.on('valuechanged', (buffer) => {
      console.log(buffer);
    });
    await characteristic.startNotifications();
    await delay(10000);
    await characteristic.stopNotifications();

    await device.disconnect();
  }

  async #printDevices() {
    const devices = await this.#adapter?.devices();
    console.log({ devices });
  }

  async #getAdapter() {
    this.#adapter = await bluetooth.defaultAdapter();
  }

  async #startDiscovery() {
    const isDiscovering = await this.#adapter?.isDiscovering();
    if (!isDiscovering) {
      await this.#adapter?.startDiscovery();
    }
  }

  async #stopDiscovery() {
    const isDiscovering = await this.#adapter?.isDiscovering();
    if (isDiscovering) {
      await this.#adapter?.stopDiscovery();
    }
  }

  async #quickPoll() {
    await this.#startDiscovery();
    await delay(5000);
    await this.#stopDiscovery();
  }
}

const bleService = new BLEService();
await bleService.init();
