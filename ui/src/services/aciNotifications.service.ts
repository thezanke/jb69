import { useCallback, useRef, useState } from 'react';
import { readNotificationsData } from '../lib/readNotificationsData';
import { AciNotification } from '../types/aciNotification';
import { bluetoothService, NotificationEvent } from './bluetooth.service';

const SERVICE_UUID = '70d51000-2c7f-4e75-ae8a-d758951ce4e0';
const CHAR_UUID = '70d51002-2c7f-4e75-ae8a-d758951ce4e0';

export type AciNotificationHandler = (notificaton: AciNotification) => void;

export class AciNotificationsService {
  #notificationEventHandlers: Set<AciNotificationHandler> = new Set();

  get isConnected() {
    return bluetoothService.isConnected;
  }

  connect = () => {
    bluetoothService.addNotificationHandler(this.#handleNotificationEvent);
    return bluetoothService.connect(SERVICE_UUID, CHAR_UUID, [
      { name: 'ACI-E' },
    ]);
  };

  async startNotifications() {
    if (!this.isConnected) await this.connect();
    await bluetoothService.startNotifications();
  }

  async stopNotifications() {
    await bluetoothService.stopNotifications();
    if (this.isConnected) await bluetoothService.disconnect();
  }

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
}

export const aciNotificationsService = new AciNotificationsService();

export const useAciNotifications = (
  handler: (notification: AciNotification) => unknown,
) => {
  const [isNotifying, setNotifying] = useState<boolean>(false);
  const boundHandler = useRef<AciNotificationHandler | null>(null);

  const startNotifications = useCallback(async () => {
    if (!aciNotificationsService.isConnected) {
      await aciNotificationsService.connect();
      await aciNotificationsService.startNotifications();
    }

    aciNotificationsService.addNotificationHandler(handler);
    boundHandler.current = handler;

    setNotifying(true);
  }, [handler]);

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
