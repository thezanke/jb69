import { backOff } from 'exponential-backoff';

export type NotificationEvent = Event & {
  target: BluetoothRemoteGATTCharacteristic;
  currentTarget: BluetoothRemoteGATTCharacteristic;
};

export type NotificationEventHandler = (ev: NotificationEvent) => void;

const CHAR_NOTIFY_EVENT = 'characteristicvaluechanged';

export class BluetoothService {
  bt: Bluetooth;
  device?: BluetoothDevice;
  #gattServer?: BluetoothRemoteGATTServer;
  #service?: BluetoothRemoteGATTService;
  #characteristic?: BluetoothRemoteGATTCharacteristic;
  #notificationEventHandlers: Set<NotificationEventHandler> = new Set();
  #advertEventHandlers: Set<EventListener> = new Set();

  constructor() {
    this.bt = navigator.bluetooth;
  }

  get isConnected() {
    return this.#gattServer?.connected ?? false;
  }

  async connect(
    serviceUuid: string,
    charUuid: string,
    mfrId: number,
    filters?: BluetoothLEScanFilter[],
  ) {
    const isBluetoothAvailable = await this.bt.getAvailability();
    if (!isBluetoothAvailable) throw new Error('bluetooth is not available');

    const bleRequestOpts: Record<string, any> = {
      optionalServices: [serviceUuid],
      optionalManufacturerData: [mfrId],
    };

    if (filters) bleRequestOpts.filters = filters;

    const device = await this.bt.requestDevice(
      bleRequestOpts as RequestDeviceOptions,
    );

    this.device = device;

    this.device.addEventListener(
      'advertisementreceived',
      this.#handleAdvertEvent,
    );

    await device.watchAdvertisements();

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

    const service = await this.#gattServer?.getPrimaryService(serviceUuid);
    this.#service = service;

    const characteristic = await this.#service?.getCharacteristic(charUuid);
    if (!characteristic) throw new Error('characterstic undefined');

    characteristic.addEventListener(
      CHAR_NOTIFY_EVENT,
      this.#handleNotificationEvent,
    );

    this.#characteristic = characteristic;

    await this.startNotifications();
  }

  async disconnect() {
    if (this.#characteristic) {
      this.#characteristic.removeEventListener(
        CHAR_NOTIFY_EVENT,
        this.#handleNotificationEvent,
      );
      this.#characteristic = undefined;
    }

    if (this.#service) this.#service = undefined;

    if (this.#gattServer) {
      this.#gattServer.disconnect();
      this.#gattServer = undefined;
    }
  }

  async startNotifications() {
    await this.#characteristic?.startNotifications();
  }

  async stopNotifications() {
    await this.#characteristic?.stopNotifications();
  }

  addNotificationHandler = (handler: NotificationEventHandler) => {
    this.#notificationEventHandlers.add(handler);
  };

  removeNotificationHandler = (handler: NotificationEventHandler) => {
    this.#notificationEventHandlers.delete(handler);
  };

  #handleNotificationEvent = (ev: Event) => {
    this.#notificationEventHandlers.forEach(async (handler) => {
      try {
        await handler(ev as NotificationEvent);
      } catch (e) {
        console.warn('error in handler:');
        console.trace(e);
      }
    });
  };
  #handleAdvertEvent = (ev: Event) => {
    this.#advertEventHandlers.forEach(async (handler) => {
      try {
        await handler(ev);
      } catch (e) {
        console.warn('error in handler:');
        console.trace(e);
      }
    });
  };

  addAdvertisementHandler = (handler: EventListener) => {
    this.#advertEventHandlers.add(handler);
  };
}

export const bluetoothService = new BluetoothService();

export const useBluetoothService = () => {
  return { service: bluetoothService };
};
