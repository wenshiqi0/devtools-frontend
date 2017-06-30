import { ipcRenderer as ipc } from 'electron';
import installGlobalReactHook from './installReactHook';

installGlobalReactHook();

// check devicePixelRatio
console.log(window.devicePixelRatio);

const disposes = [];

window.ipc = ipc;

let container;

// We can not get styles form the context of react component.
// So we make it by ourselves.
const nodeIdForDom = new Map();

// React devtools gloabl hook.
// The hook is setupped before the <head> dom ready,
// so it can not be install here.
// See installReactHook.js.
const globalHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

function getTinyData(element) {
  const props = {};
  if (!element || !element.props) return element;
  const name = element.props.$tag;
  Object.keys(element.props).forEach((prop) => {
    if (!(typeof element.props[prop] === 'function' || prop === 'children' || prop === '$tag')) {
      props[prop] = element.props[prop];
    }
  });
  return {
    name,
    props,
  };
};

const sendMessage = ({ method, payload }) => {
  ipc.sendToHost('devtools', {
    method, payload,
  })
}

function fetchRemoteUrl(callback) {
  const port = 9224;
  const request = new Request(`http://127.0.0.1:${port}/json/list`);
  const path = window.$page.getPagePath();
  fetch(request)
    .then(res => res.json()
      .then(body => {
        console.log(body);
        const remoteInfo = body.find(item => item.url.indexOf(path) > -1);
        callback({ path, ws: remoteInfo.webSocketDebuggerUrl });
      })
      .catch(e => {
        console.error(e);
        callback({});
      })
}

function mappingDomToNodeId(root, dom) {
  nodeIdForDom.set(root.nodeId, dom);
  if (root.children && root.children.length > 0) {
    root.children.forEach((next, index) => {
      mappingDomToNodeId(next, dom.children[index]);
    })
  }
}

function mappingDomToNodeIdChildren(parent, children, getReactElementFromNative) {
  if (!parent) return;
  const reactComponents = [];
  if (children && children.length > 0) {
    children.forEach((next, index) => {
      reactComponents.push('');
      nodeIdForDom.set(next.nodeId, parent.children[index]);
      try {
        const reactComponent = getReactElementFromNative(parent.children[index]);
        reactComponents[reactComponents.length - 1] = getTinyData(reactComponent._currentElement._owner._currentElement);
      } catch (e) { }
    });
  }
  return reactComponents;
}

function detectGetReactElementFromNative(dom) {
  for (const rid in globalHook._renderers) {
    const render = globalHook._renderers[rid];
    let reactComponent = null;
    try {
      reactComponent = render.ComponentTree.getClosestInstanceFromNode(dom);
    } catch (e) { console.error('detect', e); }
    if (reactComponent) {
      return {
        getReactElementFromNative: render.ComponentTree.getClosestInstanceFromNode,
        rootReactDom: reactComponent,
      }
    }
  }
}

const messageHandler = {
  initOnce: () => {
    fetchRemoteUrl((payload) => {
      sendMessage({
        method: 'initOnce',
        payload,
      });
    })
  },
  refresh: () => {
    sendMessage({ method: 'switchTarget' });
  },
  setDocumentNodeIdOnce: ({ root }) => {
    const rootDom = document.getElementById('__react-content');
    console.log(rootDom.children.length);
    const { rootReactDom } = detectGetReactElementFromNative(rootDom.children[0].children[0]);
    nodeIdForDom.set(root.nodeId, rootDom.children[0].children[0]);
    sendMessage({
      method: 'setDocumentNodeIdOnce',
      payload: {
        data: getTinyData(rootReactDom._currentElement._owner._currentElement),
      },
    })
  },
  setChildNodeIdOnce: ({ parentId, payloads }) => {
    let reactComponents = null;
    const realDom = nodeIdForDom.get(parentId);
    const rootDom = document.getElementById('__react-content');
    const { getReactElementFromNative } = detectGetReactElementFromNative(realDom || rootDom.children[0].children[0]);
    if (getReactElementFromNative) {
      if (nodeIdForDom.size === 0 || !realDom) {
        nodeIdForDom.set(parentId, rootDom.children[0].children[0]);
        reactComponents = mappingDomToNodeIdChildren(rootDom.children[0].children[0], payloads, getReactElementFromNative);
      } else {
        reactComponents = mappingDomToNodeIdChildren(realDom, payloads, getReactElementFromNative);
      }
    }
    sendMessage({
      method: 'setChildNodeIdOnce',
      payload: {
        data: reactComponents,
      },
    })
  },
};

// handle all messages from devtools
ipc.on('devtools', (event, args) => {
  const { method, payload } = args;
  if (messageHandler[method]) {
    messageHandler[method](payload);
  } else {
    throw new Error(`Error: method ${method} is not defined`);
  }
});
