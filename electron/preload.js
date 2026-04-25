const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getJobLogs: () => ipcRenderer.invoke("get-job-logs"),
  saveJobLogs: (logs) => ipcRenderer.invoke("save-job-logs", logs),
});