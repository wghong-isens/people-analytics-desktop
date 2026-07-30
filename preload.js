'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  getServerUrl: () => ipcRenderer.invoke('get-server-url'),
  setServerUrl: (url) => ipcRenderer.invoke('set-server-url', url),
});
