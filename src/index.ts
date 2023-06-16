import {app, ipcMain, BrowserWindow} from "electron";
import { readFileSync } from 'fs';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);
ipcMain.on("readFileSync", (event, filePath) => {
    try {
        const data = readFileSync(filePath);
        event.returnValue = data.toString("utf-8");
    } catch (err) {
        console.error(err);
        event.returnValue = err;
    }
});
ipcMain.on("highlightAuto", (event, code) => {
    let htmlString = hljs.highlightAuto(code).value;
    event.returnValue = htmlString;
});
ipcMain.on("toggleFullScreen", (event) => {
    window.setFullScreen(!window.isFullScreen());
    event.returnValue = "nothingm8lmao";
});


let window: BrowserWindow; 
const createWindow = (): void => {
    window = new BrowserWindow({
        useContentSize: true,
        width: 900,
        height: 506,
        webPreferences: {
            preload: __dirname + "/preload.js"
        },
        show: false,
        autoHideMenuBar: true,
        icon: "logo.png",
        resizable: false,
    });
    window.loadFile("./index.html");
    window.on("ready-to-show", () => window.show())
}

app.on("ready", createWindow);


