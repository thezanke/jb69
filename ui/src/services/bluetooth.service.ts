import { backOff } from 'exponential-backoff';

export type NotificationEvent = Event & {
  target: BluetoothRemoteGATTCharacteristic;
  currentTarget: BluetoothRemoteGATTCharacteristic;
};

export type NotificationEventHandler = (ev: NotificationEvent) => void;

const CHAR_NOTIFY_EVENT = 'characteristicvaluechanged';

const SERVICE_UUID = '70d51000-2c7f-4e75-ae8a-d758951ce4e0';
const CHAR_UUID = '70d51002-2c7f-4e75-ae8a-d758951ce4e0';

export class BluetoothService {
  bt: Bluetooth;
  device?: BluetoothDevice;
  #gattServer?: BluetoothRemoteGATTServer;
  #service?: BluetoothRemoteGATTService;
  #characteristic?: BluetoothRemoteGATTCharacteristic;
  #notificationEventHandlers: Set<NotificationEventHandler> = new Set();

  constructor() {
    this.bt = navigator.bluetooth;
  }

  get isConnected() {
    return this.#gattServer?.connected;
  }

  async connect() {
    const isBluetoothAvailable = await this.bt.getAvailability();
    if (!isBluetoothAvailable) throw new Error('bluetooth is not available');

    const device = await this.bt.requestDevice({
      filters: [{ name: 'ACI-E' }],
      optionalServices: [SERVICE_UUID],
    });

    this.device = device;

    await backOff(
      async () => {
        const gattServer = await device.gatt;
        if (!gattServer) throw new Error('gatt server missing');
        await gattServer.connect();
        if (!gattServer.connected) throw 'failed to connect';
        this.#gattServer = gattServer;
      },
      {
        numOfAttempts: 5,
        retry(e, attemptNumber) {
          console.warn('connect error:');
          console.trace(e);
          console.info(`retry #${attemptNumber}...`);
          return true;
        },
      },
    );

    const service = await this.#gattServer?.getPrimaryService(SERVICE_UUID);
    this.#service = service;

    const characteristic = await this.#service?.getCharacteristic(CHAR_UUID);
    if (!characteristic) throw new Error('characterstic undefined');

    characteristic.addEventListener(
      CHAR_NOTIFY_EVENT,
      this.#handleNotification,
    );

    this.#characteristic = characteristic;

    await this.enableNotifications();
  }

  async disconnect() {
    if (this.#characteristic) {
      this.#characteristic.removeEventListener(
        CHAR_NOTIFY_EVENT,
        this.#handleNotification,
      );
      this.#characteristic = undefined;
    }

    if (this.#service) this.#service = undefined;

    if (this.#gattServer) {
      this.#gattServer.disconnect();
      this.#gattServer = undefined;
    }

    if (this.device) {
      await this.device.forget();
      this.device = undefined;
    }
  }

  async enableNotifications() {
    await this.#characteristic?.startNotifications();
  }

  async disableNotifications() {
    await this.#characteristic?.stopNotifications();
  }

  addNotificationHandler = (handler: NotificationEventHandler) => {
    this.#notificationEventHandlers.add(handler);
  };

  removeNotificationHandler = (handler: NotificationEventHandler) => {
    this.#notificationEventHandlers.delete(handler);
  };

  #handleNotification = (ev: Event) => {
    this.#notificationEventHandlers.forEach(async (handler) => {
      try {
        await handler(ev as NotificationEvent);
      } catch (e) {
        console.warn('error in handler:');
        console.trace(e);
      }
    });
  };
}

const service = new BluetoothService();

export const useBluetooth = () => {
  return { service };
};
