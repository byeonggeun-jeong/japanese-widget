const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('widget', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  getImage: () => ipcRenderer.invoke('get-image'),
  onSettings: (cb) => ipcRenderer.on('settings', (_e, s) => cb(s)),
  showMenu: () => ipcRenderer.send('show-menu'),
});
