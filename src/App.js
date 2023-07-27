import React from "react";
import SelectDataDict from "./pages/SelectDataDictPage";
import ConnectionsSetupPage from "./pages/ConnectionsSetupPage";
import ExecutePage from "./pages/ExecutePage";
import { Routes, Route } from "react-router-dom";

const App = () => (
  <Routes>
    <Route path="/" element={<SelectDataDict />} />
    <Route path="/setupConnections" element={<ConnectionsSetupPage />} />
    <Route path="/execute" element={<ExecutePage />} />
  </Routes>
);

export default App;
