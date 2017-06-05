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
  if (window.$page && window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers && Object.keys(window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers).length > 0) {
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

function getStyle(className_) {
  const ret = [];
  const styleSheets = window.document.styleSheets;
  const styleSheetsLength = styleSheets.length;
  for (let i = 0; i < styleSheetsLength; i++) {
    const classes = styleSheets[i].rules || styleSheets[i].cssRules;
    if (!classes)
      continue;
    const classesLength = classes.length;
    for (var x = 0; x < classesLength; x++) {
      if (classes[x].selectorText == className_) {
        console.log(classes[x]);
        let j = 0;
        let styleKey;
        while(styleKey = classes[x].style[j++]) {
          const newProperty = {};
          newProperty[styleKey] = classes[x].style[styleKey];
          ret.push({
            name: styleKey,
            value: classes[x].style[styleKey],
          });
        }
        return {
          shorthandEntries: [],
          cssProperties: ret,
        };
      }
    }
  }
}

function createMathedStyle(nodeId: String, element: Element) {
  const payload = [];
  const classList = element.classList;

  for (let i = 0; i < classList.length; i++) {
    const prop = getStyle(`.${classList[i]}`);
    if (prop) {
      payload.push({
        matchingSelectors: [0],
        rule: {
          media: [],
          origin: 'regular',
          selectorList: {
            text: `.${classList[i]}`,
            selectors: [{ text: `.${classList[i]}` }]
          },
          style: prop,
        }
      });
    } 
  }

  return payload;
}

function createInlineStyle(nodeId: String, realDom: Element) {
  const style = realDom.style as CSSStyleDeclaration;
  const cssProperties = [];
  style.cssText.split(';').forEach(text => {
    const splited = text.split(':');
    const name = splited[0];
    const value = splited[1];
    if (value) {
      cssProperties.push({
        disabled: false,
        implicit: false,
        value: value.replace(/^\s/g, '').replace(/\s$/g, ''),
        name: name.replace(/\s/g, ''),
        text,
      });
    }
  });

  return {
    cssText: style.cssText,
    shorthandEntries: [],
    cssProperties,
    styleSheetId: nodeId * 10 + 1,
  }
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
  inlineStyleOnce: ({ nodeId }) => {
    const id = parseInt(nodeId);
    const { element, node } = reactElementIds[id] || {};
    if (element) {
      const realReact = componentElementMapping.get(element);
      const realDom = getNativeFromReactElement(realReact);
      sendMessage({
        method: 'inlineStyleOnce',
        payload: createInlineStyle(nodeId, realDom),
      })
    }
  },
  matchedStyleOnce: ({ nodeId }) => {
    const id = parseInt(nodeId);
    const { element, node } = reactElementIds[id] || {};
    if (element) {
      const realReact = componentElementMapping.get(element);
      const realDom = getNativeFromReactElement(realReact);
      sendMessage({
        method: 'matchedStyleOnce',
        payload: createMathedStyle(nodeId, realDom),
      })
    }
  },
  styleOnce: ({ nodeId }) => {
    const id = parseInt(nodeId);
    const { element, node } = reactElementIds[id] || {};
    if (element) {
      const realReact = componentElementMapping.get(element);
      const realDom = getNativeFromReactElement(realReact);
      const inlineStyle = createInlineStyle(nodeId, realDom);
      const matchedStyle = createMathedStyle(nodeId, realDom);

      console.log({
        inlineStyle, matchedStyle,
      });

      sendMessage({
        method: 'styleOnce',
        payload: {
          inlineStyle, matchedStyle,
        }
      })
    }
  },
};

// handle all messages from devtools
ipc.on('devtools', (event, args) => {
  const { method, payload } = args;
  if (messageHandler[method]) {
    messageHandler[method](payload);
  } else {
    throw neww Error(`Error: method ${method} is not defined`);
  }
});
