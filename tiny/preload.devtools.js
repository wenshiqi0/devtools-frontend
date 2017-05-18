window.sendToHost = function () {
  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.sendToHost.apply(ipcRenderer, arguments);
};

window.listenToHost = function () {
  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.on.apply(ipcRenderer, arguments);
};