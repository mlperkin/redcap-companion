import React from "react";
import { ipcRenderer } from "electron";

const TitleBar = () => {
  // Here's how to handle window control button clicks using ipcRenderer
  // This part of the code is specific to the renderer process (browser environment)
  const handleMinimize = () => {
    ipcRenderer.send("window-control-minimize");
  };

  const handleMaximize = () => {
    ipcRenderer.send("window-control-maximize");
  };

  const handleClose = () => {
    ipcRenderer.send("window-control-close");
  };

  return (
    <div className="title-bar">
      <div className="title">Your App Title</div>
      <div className="window-controls">
        <div
          id="minimize-btn"
          className="window-control"
          onClick={handleMinimize}
        >
          -
        </div>
        <div
          id="maximize-btn"
          className="window-control"
          onClick={handleMaximize}
        >
          +
        </div>
        <div id="close-btn" className="window-control" onClick={handleClose}>
          ×
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
