const { machineId } = require("node-machine-id");
const {
  testMySQLConnection,
  testPostgreSQLConnection,
} = require("./utils/dbTest");

const { testRedcapConnection, getRedcapRecords } = require("./utils/redcap");

const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const csv = require("csv-parser");
const fs = require("fs");
const Store = require("electron-store");

const store = new Store();

// const dbTestModulePath = path.join(app.getAppPath(), "/utils/dbTest.js");
// const redcapModulePath = path.join(app.getAppPath(), "utils/redcap.js");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 900,
    titleBarStyle: "hidden",
    minWidth: 1280, // Set the minimum width here
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

ipcMain.handle("open-file-dialog", async (event) => {
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile"],
    filters: [{ name: "CSV", extensions: ["csv"] }],
  });

  if (!result.canceled) {
    return new Promise((resolve, reject) => {
      const results = [];
      const filePath = result.filePaths[0]; // Get the selected file path.
      const fileName = path.basename(filePath); // Extract the file name from the path.

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          resolve({ title: fileName, contents: results }); // Return an object containing the title and contents.
        })
        .on("error", reject);
    });
  }
});

ipcMain.handle("generate-unique-id", async () => {
  try {
    const uniqueMachineId = await machineId();
    return uniqueMachineId;
  } catch (error) {
    console.error("Error generating unique machine ID:", error);
    return null;
  }
});

// Listen for the "testDBConnection" event from the renderer process
ipcMain.handle("testDBConnection", async (event, dataObj) => {
  // Perform your database connection test here
  // Example: return a boolean value indicating if the connection was successful
  if (dataObj.db === "MySQL") {
    try {
      // Your database connection code here
      const isMySQLConnected = await testMySQLConnection(dataObj);
      // Return a boolean value
      return isMySQLConnected;
    } catch (error) {
      console.error("Error connecting to MySQL:", error);
      return false;
    }
  } else if (dataObj.db === "PostgreSQL") {
    try {
      // Your database connection code here
      const isPostgreSQLConnected = await testPostgreSQLConnection(dataObj);
      // Return a boolean value
      return isPostgreSQLConnected;
    } catch (error) {
      console.error("Error connecting to PostgreSQL:", error);
      return false;
    }
  }
});

ipcMain.handle("testRedcapAPI", async (event, dataObj) => {
  try {
    // Your database connection code here
    const isRedcapConnected = await testRedcapConnection(dataObj);
    // Return a boolean value
    return isRedcapConnected;
  } catch (error) {
    console.error("Error connecting to Redcap:", error);
    return false;
  }
});

ipcMain.handle("getRedcapRecords", async (event, dataObj) => {
  try {
    // Your database connection code here
    const redcapRecords = await getRedcapRecords(dataObj);
    // Return a boolean value
    return redcapRecords;
  } catch (error) {
    console.error("Error connecting to Redcap:", error);
    return false;
  }
});

ipcMain.handle("getRecordsFromJson", async (event, filePath) => {
  console.log("get records from json", filePath);

  return new Promise((resolve, reject) => {
    // Ensure the file path is absolute or correctly relative to the main process file
    const absoluteFilePath = path.resolve(filePath);

    fs.readFile(absoluteFilePath, (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      try {
        const records = JSON.parse(data);
        resolve(records);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
});
// Listen for an IPC event from the renderer process to get the store data
ipcMain.handle("getStoreData", (event) => {
  return store.store;
});

// Listen for an IPC event from the renderer process to set the store data
ipcMain.on("setStoreData", (event, newData) => {
  // Get the current data from the store
  const currentData = store.store || {};

  // Merge the current data with the new data
  const updatedData = { ...currentData, ...newData };

  // Set the updated data in the store
  store.store = updatedData;

  // Optionally, you can send a response back to the renderer process if needed
  event.sender.send("storeDataUpdated", updatedData);
});

// // Listen for the before-quit event
// app.on('before-quit', () => {
//   // Clear the store data
//   store.clear();
// });

// // Listen for the ready event (when Electron has finished initializing)
// app.on('ready', () => {
//   // Clear the store data on app startup
//   store.clear();

//   // Additional code to create windows, handle IPC events, etc.
// });
