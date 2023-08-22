import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { HashRouter } from "react-router-dom";

const root = document.getElementById("root");

// Replace ReactDOM.render with createRoot
ReactDOM.createRoot(root).render(
  // <React.StrictMode>
    <HashRouter>
        <App />
    </HashRouter>
  // </React.StrictMode>
);
