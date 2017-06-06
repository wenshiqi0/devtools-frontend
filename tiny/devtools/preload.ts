import './hook';
import { Global } from './types.ts';

declare const window: Global;

const NProgress = require('nprogress');

window.NProgress = NProgress;

const CALL_PREFIX = 'tea-fn';
let callCount = 0;

window.sendToHost = (...args) => {
  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.sendToHost(...args);
};

window.listenToHost = (...args) => {
  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.on(...args);
};

window.callElectron = (...args) => {
  const ipcRenderer = require('electron').ipcRenderer;
  const len = args.length;
  const lastArg = args[len - 1];

  const hasCallback = typeof lastArg === 'object' && (lastArg.success || lastArg.fail);
  if (hasCallback) {
    const { success, fail } = lastArg;
    const id = `${CALL_PREFIX}-${callCount}`;
    callCount += 1;
    if (success) {
      ipcRenderer.on(`${id}-success`, success);
    }
    if (fail) {
      ipcRenderer.on(`${id}-fail`, fail);
    }
    const newArgs = [].slice.call(args, 0, -1).concat({
      type: 'callElectronArgs',
      id,
    });
    ipcRenderer.sendToHost(...newArgs);
  } else {
    ipcRenderer.sendToHost(...args);
  }
};

console.log('page load');
