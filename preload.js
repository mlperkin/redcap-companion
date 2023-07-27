// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose required Node.js modules to the renderer process
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer,
});
