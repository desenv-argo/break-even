import React from "react";
import ReactDOM from "react-dom/client";
import "./chartRegister";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import App from "./App";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error(
    'Elemento de mount não encontrado. Verifique se o index.html contém <div id="root"></div>.',
  );
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
