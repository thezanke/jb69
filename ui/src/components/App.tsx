import { useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useImmer } from 'use-immer';
import {
  AciNotificationHandler,
  useAciNotifications,
} from '../services/aciNotifications.service';
import { AciNotification } from '../types/aciNotification';

const bitValueTypes: Array<keyof AciNotification> = ['model', 'beeps'];

const serializeNotificationValue = <K extends keyof AciNotification>(
  key: K,
  value: AciNotification[K],
) => {
  if (value === undefined) return '<undefined>';
  if (key === 'received') return (value as Date).toUTCString();
  if (bitValueTypes.includes(key)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{value.toString()}</span>
        <pre style={{ display: 'block' }}>{value.toString(2)}</pre>
      </div>
    );
  }
  return value.toString();
};

export const App = () => {
  const [notificationStore, updateNotificationStore] = useImmer<
    AciNotification[]
  >([]);

  const handleAciNotification = useRef<AciNotificationHandler>(
    (notification) => {
      updateNotificationStore((store) => {
        store.unshift(notification);
      });
    },
  );

  const aciNotifications = useAciNotifications(handleAciNotification.current);

  const handleStartClick = useCallback(
    () => aciNotifications.start(),
    [aciNotifications],
  );

  const handleStopClick = useCallback(
    () => aciNotifications.stop(),
    [aciNotifications],
  );

  return (
    <StyleContainer>
      <div className="actionBar">
        {!aciNotifications.isNotifying ? (
          <button onClick={handleStartClick}>Start notifications</button>
        ) : (
          <button onClick={handleStopClick}>Stop notifications</button>
        )}
      </div>

      <div className="contents">
        {notificationStore.map((notification, i) => (
          <table key={i}>
            <tbody>
              {Object.entries(notification).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>
                    {serializeNotificationValue(
                      key as keyof AciNotification,
                      value,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </StyleContainer>
  );
};

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

  .actionBar {
    padding: 0 0 1em;
  }

  .contents {
  }

  .contents table {
    display: inline-table;
    border-collapse: collapse;
    border-radius: 3px;
    border-style: solid;
    margin: 0.33em;

    &,
    & td {
      border: 1px solid;
      padding: 0 0.5rem;
    }

    & tr > td:first-child {
      background-color: #ddd;
      text-align: right;
      padding: 0 0.25rem;
    }

    pre {
      padding: 0;
      margin: 0;
    }
  }
`;
