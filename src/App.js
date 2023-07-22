import React from "react";
import PickDataDict from "./pages/PickDataDict";
import SetupConnections from "./pages/SetupConnections";
import { Routes, Route } from "react-router-dom";

const App = () => (
  <Routes>
    <Route path="/" element={<PickDataDict />} />
    <Route path="/setupConnections" element={<SetupConnections />} />
  </Routes>
);

export default App;
