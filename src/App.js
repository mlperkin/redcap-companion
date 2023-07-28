import React from "react";
import { Routes, Route } from "react-router-dom";
// import TitleBar from "./components/Titlebar";
import SelectDataDict from "./pages/SelectDataDictPage";
import ConnectionsSetupPage from "./pages/ConnectionsSetupPage";
import ExecutePage from "./pages/ExecutePage";

const App = () => (
  <>
    <Routes>
      {/* set init page */}
      <Route path="/" element={<ConnectionsSetupPage />} />
      <Route path="/selectDataDict" element={<SelectDataDict />} />
      <Route path="/setupConnections" element={<ConnectionsSetupPage />} />
      <Route path="/execute" element={<ExecutePage />} />
    </Routes>
  </>
);

export default App;
