import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// *** IMPORTS DE BOOTSTRAP 4 ***
// Importa el CSS de Bootstrap 4
import 'bootstrap/dist/css/bootstrap.min.css';

// Importa las dependencias de JavaScript de Bootstrap 4 (jQuery, Popper)
import 'jquery';
import 'popper.js';
// Importa el JavaScript de Bootstrap 4 (incluye la lógica de data-*)
import 'bootstrap/dist/js/bootstrap.min.js';
// *** FIN IMPORTS DE BOOTSTRAP 4 ***

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);
