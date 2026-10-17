import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import { InterventionPage } from './pages/InterventionPage';
import './index.css';

const rootEl = document.getElementById('intervention-root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <AppProvider>
        <InterventionPage />
      </AppProvider>
    </React.StrictMode>
  );
}
