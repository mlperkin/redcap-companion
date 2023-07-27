import React from "react";
import { Routes, Route } from "react-router-dom";
// import TitleBar from "./components/Titlebar";
import SelectDataDict from "./pages/SelectDataDictPage";
import ConnectionsSetupPage from "./pages/ConnectionsSetupPage";
import ExecutePage from "./pages/ExecutePage";

const App = () => (
  <>
    <Routes>
      <Route path="/" element={<SelectDataDict />} />
      <Route path="/setupConnections" element={<ConnectionsSetupPage />} />
      <Route path="/execute" element={<ExecutePage />} />
    </Routes>
  </>
);

export default App;
