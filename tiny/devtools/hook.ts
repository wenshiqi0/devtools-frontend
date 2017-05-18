import { ipcRenderer as ipc } from 'electron';

// Now we only support one overlay for one dom selected.
import Overlay from './overlay';
import installGlobalReactHook from './installReactHook';

installGlobalReactHook();

const disposes = [];

window.ipc = ipc;

let container;

// We can not get styales form the context of react component.
// So we make it by ourselves.
const globalClassStyleMap = {};
const globalElementStyleMap = {};
let reactElementIds;
let realPropsTree;
let componentElementMapping;
let getNativeFromReactElement;

// React devtools gloabl hook.
// The hook is setupped before the <head> dom ready,
// so it can not be install here.
// See installReactHook.js.
const globalHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

// React dev tool
const attachRenderer = require('./attachRenderer');

function setupBackend(hook) {
  console.log('devicePixelRatio: ', window.devicePixelRatio);
  for (const rid in hook._renderers) {
    const ids = {};
    hook.helpers[rid] = attachRenderer(hook, rid, hook._renderers[rid]);
    const mapping = hook.helpers[rid].mapCurrentComponentToElement();
    componentElementMapping = mapping;
    const tree = hook.helpers[rid].rebuildTinyTree(ids);

    const root = {
      attributes: [],
      backendNodeId: 1,
      nodeName: 'document'.toUpperCase(),
      localName: 'document'.toLowerCase(),
      nodeType: 9,
      nodeId: 0,
      nodeValue: '',
      children: tree,
      childNodeCount: tree.length,
    };

    reactElementIds = ids;
    realPropsTree = root;
    getNativeFromReactElement = hook.helpers[rid].getNativeFromReactElement;
    // hook.helpers[rid].buildStylesContext(globalClassStyleMap);
    // hook.helpers[rid].buildElementStyles(globalElementStyleMap, reactElementIds);

    sendMessage({
      method: 'documentUpdated',
      payload: {
        root,
      },
    })
  }
}

let loadCheckInterval = setInterval(() => {
  checkTinyAndReact();
}, 500);

// console.log('tiny-devtools is start to work');
const checkTinyAndReact = () => {
  // check if react is rendered.
  if (window.currentTinyPageInstance && window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers && Object.keys(window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers).length > 0) {
    clearInterval(loadCheckInterval);
    try {
      setupBackend(globalHook);
      loadCheckInterval = null;
    } catch (e) {
      // In this time actually react is not ready, so we catch the error and restart the interval.
      console.log(e);
      loadCheckInterval = setInterval(() => {
        checkTinyAndReact();
      }, 500);
    }
  }
};

const sendMessage = ({ method, payload }) => {
  ipc.sendToHost('devtools', {
    method, payload,
  })
}

const messageHandler = {
  refresh: () => {
    sendMessage({
      method: 'refresh',
      payload: {
        root: realPropsTree,
      },
    });
  },
  enable: () => {
    // console.log('tiny enable');
    // enable tiny
    checkTinyAndReact();
  },
  getDocument: () => {
    if (loadCheckInterval) return;
    else
      sendMessage({
        method: 'documentUpdated',
        payload: {
          root: realPropsTree,
        },
      })
  },
  highlight: ({ nodeId }) => {
    const id = parseInt(nodeId);
    const { element, node } = reactElementIds[id] || {};
    if (element) {
      const realReact = componentElementMapping.get(element);
      const realDom = getNativeFromReactElement(realReact);
      if (realDom) {
        if (!container) {
          container = new Overlay(window);
        }
        container.inspect(realDom, node.name);
      }
    }
  },
  unhighlight: () => {
    if (container) {
      container.remove();
      container = null;
    }
  },
  style: () => {

  },
};

// handle all messages from devtools
ipc.on('devtools', (event, args) => {
  const { method, payload } = args;
  messageHandler[method](payload);
});
