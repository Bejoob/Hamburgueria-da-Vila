/**
 * Ponto de entrada da aplicação React.
 * Monta o componente raiz App no elemento #root do index.html.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
