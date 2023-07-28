const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const csv = require("csv-parser");
const fs = require("fs");
let win;
function createWindow() {
  let _frame;

  if (isDev) _frame = true;
  else _frame = false;

  win = new BrowserWindow({
    width: 1280,
    height: 720,
    titleBarStyle: "hidden",
    minWidth: 650, // Set the minimum width here
    minHeight: 600, // Set the minimum height here
    // titleBarOverlay: true,
    titleBarOverlay: {
      color: "#2f3241",
      symbolColor: "#74b1be",
      height: 49,
    },
    frame: _frame, // Set frame to false for a frameless window
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

  // Create an empty menu template to hide the menu bar
  console.log("isDev?", isDev);
  if (!isDev) {
    win.on("closed", () => {
      win = null;
    });

    const menuTemplate = [];
    const appMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(appMenu);
  }
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
