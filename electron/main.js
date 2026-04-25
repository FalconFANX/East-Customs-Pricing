const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store').default;
const store = new Store();
const { ipcMain } = require('electron');


ipcMain.handle("get-job-logs", () => {
  return store.get("jobLogs") || [];
});

ipcMain.handle("save-job-logs", (event, logs) => {
  store.set("jobLogs", logs);
});


function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });


      const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}


app.whenReady().then(() => {
    createWindow();

    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', () => {
        console.log('Update available');
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('Update Downloaded');
        autoUpdater.quitAndInstall();
    });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});