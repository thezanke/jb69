import { Fragment, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useImmer } from 'use-immer';
import {
  NotificationEventHandler,
  useBluetooth,
} from '../services/bluetooth.service';
import {
  DataSerializationFormat,
  serializeBuffer,
} from '../utils/serializeBuffer';

import './index.css';

const StyleContainer = styled.div`
  padding: 1em;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  button {
    display: block;
    border-radius: 4px;
    background-color: transparent;
    box-shadow: none;
    border: 1px solid #ccc;
    padding: 0.5em 1.5em;
    color: #222;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }
  }
`;

export const App = () => {
  const bluetooth = useBluetooth();
  const isInitialized = useRef(false);
  const [payloads, setPayloads] = useImmer<Map<number, string>>(new Map());

  const notificationHandler = useCallback<NotificationEventHandler>(
    (ev) => {
      const buffer = ev.target.value?.buffer;
      if (!buffer) return;
      const timestamp = Number(new Date());
      setPayloads((draft) => {
        draft.set(
          timestamp,
          serializeBuffer(buffer, DataSerializationFormat.binary),
        );
      });
    },
    [setPayloads],
  );

  useEffect(() => {
    if (!isInitialized.current) {
      bluetooth.service.addNotificationHandler(notificationHandler);
      isInitialized.current = true;
    }
  }, [bluetooth, notificationHandler]);

  const connectToDevice = useCallback(
    async () => await bluetooth.service.connect(),
    [bluetooth],
  );

  return (
    <StyleContainer>
      <div>
        <button onClick={connectToDevice}>Connect</button>
      </div>
      <fieldset className="payloads">
        <legend>Payloads</legend>
        <pre>
          {Array.from(payloads.keys())
            .sort((a, b) => b - a)
            .map((ts) => (
              <Fragment key={ts}>{`${ts}: ${payloads.get(ts)}\n`}</Fragment>
            ))}
        </pre>
      </fieldset>
    </StyleContainer>
  );
};
