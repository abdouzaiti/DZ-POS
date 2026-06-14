const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getProducts: () => ipcRenderer.invoke('get-products'),
  saveProducts: (products) => ipcRenderer.invoke('save-products', products),
  getSales: () => ipcRenderer.invoke('get-sales'),
  saveSales: (sales) => ipcRenderer.invoke('save-sales', sales),
  getCredits: () => ipcRenderer.invoke('get-credits'),
  saveCredits: (credits) => ipcRenderer.invoke('save-credits', credits),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings)
});
