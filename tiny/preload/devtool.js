window.sendToHost = function () {
  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.sendToHost.apply(ipcRenderer, arguments);
};

window.listenToHost = function () {
  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.on.apply(ipcRenderer, arguments);
};

window.listenToHostOnce = function () {
  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.once.apply(ipcRenderer, arguments);
};