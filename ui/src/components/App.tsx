import { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useImmer, useImmerReducer } from 'use-immer';
import type { ImmerReducer } from 'use-immer';
import { ACI_MFR_ID, NOTIF_SERVICE_UUID } from '../constants';
import { MfrData, readMfrData } from '../lib/readMfrData';
import { simpleBluetoothService } from '../services/simpleBluetooth.service';
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

interface AppState {
  temp: number;
  humidity: number;
  connected: boolean;
  updated: Date | 'never';
}

const reducer: ImmerReducer<AppState, any> = (state, action) => {
  if (action === 'connected') {
    state.connected = true;
    return state;
  }

  if (action.temp) state.temp = action.temp;
  if (action.humid) state.humidity = action.humid;

  state.updated = new Date();

  return state;
};

export const App = () => {
  const [state, dispatch] = useImmerReducer<AppState, any>(reducer, {
    temp: -Infinity,
    humidity: -Infinity,
    connected: false,
    updated: 'never',
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    console.log('adding event listener');
    simpleBluetoothService.addEventListener('data', (ev) => {
      console.log(ev.detail);
      dispatch(ev.detail);
    });

    initialized.current = true;
  }, [dispatch]);

  const handleStartClick = useCallback(async () => {
    await simpleBluetoothService.connect({
      manufacturer: ACI_MFR_ID,
      services: [NOTIF_SERVICE_UUID],
    });

    dispatch('connected');
  }, [dispatch]);

  const handleStopClick = useCallback(() => null, []);

  return (
    <StyleContainer>
      <div className="actionBar">
        {!state.connected ? (
          <button onClick={handleStartClick}>Start notifications</button>
        ) : (
          <button onClick={handleStopClick}>Stop notifications</button>
        )}
      </div>

      <div className="info">
        <table>
          <tbody>
            <tr>
              <td>Temp:</td>
              <td>{state.temp} °C</td>
            </tr>
            <tr>
              <td>RH:</td>
              <td>{state.humidity} %</td>
            </tr>
            <tr>
              <td>Updated:</td>
              <td>{String(state.updated)}</td>
            </tr>
          </tbody>
        </table>
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

  table {
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
