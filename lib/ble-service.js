import * as Exponential from 'exponential-backoff';
import * as NodeBLE from 'node-ble';
import { delay } from '../common/delay.js';

const VALUE_CHANGED_EVENT = 'valuechanged';
const MAX_CONNECTION_ATTEMPTS = 10;

const DEVICE_CONNECT_BACKOFF_OPTIONS = Object.freeze({
  startingDelay: 1_000,
  numOfAttempts: MAX_CONNECTION_ATTEMPTS,

  /**
   * @param {*} e
   * @param {number} num
   */
  retry(e, num) {
    console.info('Device connection error:');
    console.error(e);
    console.log(`Retrying connection... (${num}/${MAX_CONNECTION_ATTEMPTS})`);

    return true;
  },
});

export class BLEService {
  /** @type {NodeBLE.Bluetooth} */
  #bluetooth;

  /** @type {NodeBLE.Adapter|null} */
  #adapter = null;

  /** @type {Map<string, NodeBLE.Device>|null} */
  #devices = new Map();

  constructor() {
    const { bluetooth } = NodeBLE.createBluetooth();
    this.#bluetooth = bluetooth;
  }

  /**
   * @param {string} uuid
   */
  async connectToDevice(uuid) {
    if (!this.#adapter) {
      await this.#getAdapter();
    }

    let device;

    await Exponential.backOff(
      async () => {
        device = await this.#adapter.waitDevice(uuid);

        const alreadyConnected = await device.isConnected();
        if (!alreadyConnected) {
          await device.connect();
        }
      },

      DEVICE_CONNECT_BACKOFF_OPTIONS,
    );

    this.#devices.set(uuid, device);
  }

  /**
   * @param {string} deviceUuid
   * @param {string} serviceUuid
   * @param {string} charUuid
   * @param {(data?: Buffer, ble?: BLEService) => void} callbackFn
   */
  async streamNotifications(deviceUuid, serviceUuid, charUuid, callbackFn) {
    const device = this.#getDevice(deviceUuid);
    const gatt = await device.gatt();
    const service = await gatt.getPrimaryService(serviceUuid);
    const characteristic = await service.getCharacteristic(charUuid);

    const handleValueChange = (buffer) => {
      callbackFn(buffer, this);
    };

    characteristic.on(VALUE_CHANGED_EVENT, handleValueChange);
    await characteristic.startNotifications();

    return async () => {
      characteristic.off(VALUE_CHANGED_EVENT, handleValueChange);
      await characteristic.stopNotifications();
    };
  }

  /**
   * @param {string} uuid
   */
  async disconnectFromDevice(uuid) {
    const device = this.#getDevice(uuid);
    await device.disconnect();
    this.#devices.delete(uuid);
  }

  /**
   * @param {string} uuid
   */
  #getDevice(uuid) {
    this.#ensureDevice(uuid);

    return this.#devices.get(uuid);
  }

  async #getAdapter() {
    this.#adapter = await this.#bluetooth.defaultAdapter();
  }

  #ensureAdapter() {
    if (!this.#adapter) throw new Error('missing adapter');
  }

  /**
   * @param {string} uuid
   */
  #ensureDevice(uuid) {
    if (!this.#devices.has(uuid)) throw new Error(`missing device: ${uuid}`);
  }

  async #startDiscovery() {
    this.#ensureAdapter();

    const isDiscovering = await this.#adapter.isDiscovering();
    if (!isDiscovering) {
      await this.#adapter?.startDiscovery();
    }
  }

  async #stopDiscovery() {
    this.#ensureAdapter();

    const isDiscovering = await this.#adapter.isDiscovering();
    if (isDiscovering) {
      await this.#adapter.stopDiscovery();
    }
  }

  async #quickPoll() {
    await this.#startDiscovery();
    await delay(5_000);
    await this.#stopDiscovery();
  }
}
