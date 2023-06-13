import { ipcRenderer, ContextBridge, contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
    readFileSync: (filePath: string) => ipcRenderer.sendSync("readFileSync", filePath),
    highlightAuto: (htmlString: string) => ipcRenderer.sendSync("highlightAuto", htmlString),
});