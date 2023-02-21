// import { useCallback, useEffect, useRef } from 'react';
// import styled from 'styled-components';
// import { useImmer } from 'use-immer';
// import {
//   NotificationEventHandler,
//   useBluetoothService,
// } from '../services/bluetooth.service';
// import { DataPoint, DataTable } from './DataTable';

// export const App = () => {
//   const bluetooth = useBluetoothService();
//   const isInitialized = useRef(false);
//   const [dataPoints, updateDataPoints] = useImmer<DataPoint[]>([]);
//   // const [notifications, updateNotifications] = useImmer<Notification[]>([]);

//   const notificationsHandler = useRef<NotificationEventHandler | null>(null);

//   useEffect(() => {
//     if (!isInitialized.current) {
//       notificationsHandler.current = (ev) => {
//         const view = ev.target.value;
//         if (!view) return;

//         const timestamp = new Date();

//         updateDataPoints((draft) => {
//           draft.unshift({ timestamp, view });
//         });

//         // const notifications = readNotificationsData(view);
//       };

//       bluetooth.service.addNotificationHandler(notificationsHandler.current);
//       isInitialized.current = true;
//     }

//     return () => {
//       if (notificationsHandler.current) {
//         bluetooth.service.removeNotificationHandler(
//           notificationsHandler.current,
//         );

//         notificationsHandler.current = null;
//       }

//       isInitialized.current = false;
//     };
//   }, [bluetooth, updateDataPoints]);

//   const connectToDevice = useCallback(
//     async () => await bluetooth.service.connect(),
//     [bluetooth],
//   );

//   return (
//     <StyleContainer>
//       <div className="actionBar">
//         <button onClick={connectToDevice}>Connect</button>
//       </div>
//       <div className="contents">
//         <DataTable dataPoints={dataPoints} />
//       </div>
//     </StyleContainer>
//   );
// };

// const StyleContainer = styled.div`
//   padding: 1em;
//   position: relative;
//   display: flex;
//   flex-direction: column;
//   height: 100%;

//   button {
//     display: block;
//     border-radius: 4px;
//     background-color: transparent;
//     box-shadow: none;
//     border: 1px solid #ccc;
//     padding: 0.5em 1.5em;
//     color: #222;
//     font-weight: 600;
//     cursor: pointer;

//     &:hover {
//       background-color: rgba(255, 255, 255, 0.5);
//     }
//   }

//   .actionBar {
//     padding: 0 0 1em;
//   }

//   .contents {
//   }

//   .contents table {
//     width: 100%;
//     &,
//     & td {
//       border: 1px solid;
//     }

//     pre {
//       padding: 0;
//       margin: 0;
//     }
//   }
// `;

export default 'unimplemented';
