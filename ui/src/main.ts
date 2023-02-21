import { enableMapSet } from 'immer';
import React from 'react';
import ReactDOM from 'react-dom/client';

import './assets/index.css';
import { Root } from './components/Root';
import './globals';

enableMapSet();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  React.createElement(Root),
);
