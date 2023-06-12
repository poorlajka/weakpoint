import {app, ipcMain, BrowserWindow} from "electron";
let mainWindow: BrowserWindow;

const createWindows = (): void => {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: __dirname + "/preload.js"
        },
        show: false
    });
    mainWindow.loadFile("./index.html");
    mainWindow.on("ready-to-show", () => mainWindow.show())
}

app.on("ready", createWindows);
