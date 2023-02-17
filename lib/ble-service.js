import { backOff } from 'exponential-backoff';
import * as NodeBLE from 'node-ble';
import { delay } from '../common/delay.js';

const VALUE_CHANGED_EVENT = 'valuechanged';

export class BLEService {
  /**
   * @type {NodeBLE.Bluetooth}
   */
  #bluetooth;

  /**
   * @type {NodeBLE.Adapter|null}
   */
  #adapter = null;

  /**
   * @type {NodeBLE.Device|null}
   */
  #device = null;

  /**
   * @type {NodeBLE.GattServer|null}
   */
  #gatt = null;

  constructor() {
    const { bluetooth } = NodeBLE.createBluetooth();
    this.#bluetooth = bluetooth;
  }

  async connectToDevice(uuid) {
    if (!this.#adapter) {
      await this.#getAdapter();
    }

    this.#ensureAdapter();

    this.#device = await this.#adapter.waitDevice(uuid);

    const alreadyConnected = await this.#device.isConnected();
    if (!alreadyConnected) {
      await backOff(
        async () => {
          await this.#device.connect();
        },
        {
          startingDelay: 1_000,
          maxDelay: 60_000,
        },
      );
    }

    this.#gatt = await this.#device.gatt();
  }

  async streamNotifications(serviceUuid, charUuid, callbackFn) {
    this.#ensureGattServer();

    const service = await this.#gatt.getPrimaryService(serviceUuid);
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

  async disconnect() {
    this.#ensureDevice();

    await this.#device.disconnect();
  }

  async #getAdapter() {
    this.#adapter = await this.#bluetooth.defaultAdapter();
  }

  #ensureAdapter() {
    if (!this.#adapter) throw new Error('missing adapter');
  }

  #ensureDevice() {
    if (!this.#device) throw new Error('missing device');
  }

  #ensureGattServer() {
    if (!this.#gatt) throw new Error('missing gatt server');
  }

  async #printDevices() {
    this.#ensureAdapter();

    const devices = await this.#adapter.devices();
    console.log({ devices });
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
