import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import { ThemeProvider } from "@mui/material/styles";
// import { CssBaseline } from "@mui/material"; // Optional, to apply global CSS baseline
// import theme from "./theme";

import { HashRouter } from "react-router-dom";

const root = document.getElementById("root");

// Replace ReactDOM.render with createRoot
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <HashRouter>
      {/* <ThemeProvider theme={theme}>
        <CssBaseline />  */}
        <App />
      {/* </ThemeProvider> */}
    </HashRouter>
  </React.StrictMode>
);
