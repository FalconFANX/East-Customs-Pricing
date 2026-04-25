const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
        win.loadFile(path.join(__dirname, 'dist/index.html'));
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