import { useCallback, useRef, useState } from 'react';
import { readNotificationsData } from '../lib/readNotificationsData';
import { AciNotification } from '../types/aciNotification';
import { bluetoothService, NotificationEvent } from './bluetooth.service';

const SERVICE_UUID = '70d51000-2c7f-4e75-ae8a-d758951ce4e0';
const CHAR_UUID = '70d51002-2c7f-4e75-ae8a-d758951ce4e0';
const MFR_ID = 0x0902;

export type AciNotificationHandler = (notificaton: AciNotification) => void;

export class AciDataService {
  #notificationEventHandlers: Set<AciNotificationHandler> = new Set();
  #advertEventHandlers: Set<EventListener> = new Set();

  get isConnected() {
    return bluetoothService.isConnected;
  }

  connect() {
    bluetoothService.addNotificationHandler(this.#handleNotificationEvent);
    bluetoothService.addAdvertisementHandler(this.#handleAdvertEvent);

    return bluetoothService.connect(SERVICE_UUID, CHAR_UUID, MFR_ID, [
      { name: 'ACI-E' },
    ]);
  }

  async startNotifications() {
    if (!this.isConnected) await this.connect();
    await bluetoothService.startNotifications();
  }

  async stopNotifications() {
    await bluetoothService.stopNotifications();
    if (this.isConnected) await bluetoothService.disconnect();
  }

  addAdvertisementHandler = (handler: EventListener) => {
    console.log('handler added');
    this.#advertEventHandlers.add(handler);
  };

  addNotificationHandler = (handler: AciNotificationHandler) => {
    this.#notificationEventHandlers.add(handler);
  };

  removeNotificationHandler = (handler: AciNotificationHandler) => {
    this.#notificationEventHandlers.delete(handler);
  };

  #handleNotificationEvent = (ev: NotificationEvent) => {
    if (!ev.target.value) return;

    const aciNotifications = readNotificationsData(ev.target.value);

    this.#notificationEventHandlers.forEach(async (handler) => {
      await Promise.all(
        aciNotifications.map(async (aciNotification) => {
          try {
            await handler(aciNotification);
          } catch (e) {
            console.warn('error in handler:');
            console.trace(e);
          }
        }),
      );
    });
  };
  #handleAdvertEvent = (ev: Event) => {
    this.#advertEventHandlers.forEach(async (handler) => {
      await handler(ev);
    });
  };
}

export const aciNotificationsService = new AciDataService();

export const useAciData = (
  advertHandler: EventListener,
  notificationHandler: (notification: AciNotification) => unknown,
) => {
  const [isNotifying, setNotifying] = useState<boolean>(false);
  const boundHandler = useRef<AciNotificationHandler | null>(null);

  const startNotifications = useCallback(async () => {
    if (!advertHandler || !notificationHandler) return;
    console.log('click');

    aciNotificationsService.addAdvertisementHandler(advertHandler);
    aciNotificationsService.addNotificationHandler(notificationHandler);

    if (!aciNotificationsService.isConnected) {
      await aciNotificationsService.connect();
      // await aciNotificationsService.startNotifications();
    }

    boundHandler.current = notificationHandler;

    setNotifying(true);
  }, [advertHandler, notificationHandler]);

  const stopNotifications = useCallback(async () => {
    if (boundHandler.current) {
      aciNotificationsService.removeNotificationHandler(boundHandler.current);
    }

    await aciNotificationsService.stopNotifications();

    setNotifying(false);
  }, []);

  return {
    isNotifying,
    start: startNotifications,
    stop: stopNotifications,
  };
};
