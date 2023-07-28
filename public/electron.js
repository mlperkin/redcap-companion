const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const csv = require("csv-parser");
const fs = require("fs");
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    titleBarStyle: "hidden",
    minWidth: 650, // Set the minimum width here
    minHeight: 600, // Set the minimum height here
    frame: false, // Set frame to false for a frameless window
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // Load your index.html file
  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

 // Handle window maximize event
 app.on("maximize", () => {
  win.webContents.send("window-maximized", true);
});

// Handle window restore event
app.on("unmaximize", () => {
  win.webContents.send("window-maximized", false);
});

ipcMain.handle("is-window-maximized", () => {
  if (win.isMaximized()) {
    return true;
  } else {
    return false;
  }
});

// Handle messages from the renderer process
ipcMain.handle("window-minimize", () => {
  win.minimize();
});

ipcMain.handle("window-maximize", () => {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.handle("window-close", () => {
  win.close();
});

// Here is the new ipcMain event for opening file dialog and reading file
ipcMain.handle("open-file-dialog", async (event) => {
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile"],
    filters: [{ name: "CSV", extensions: ["csv"] }],
  });

  if (!result.canceled) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(result.filePaths[0])
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          resolve(results);
        })
        .on("error", reject);
    });
  }
});
