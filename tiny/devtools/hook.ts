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

let cssTempState = {};

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

const shortHandsConst = ['margin', 'padding', 'borderRadius', 'border', 'background', 'font', 'flex', 'animation'];

function handleShortHands(styles) {
  const shortHands = [];
  shortHandsConst.forEach(name => {
    if (styles[name]) {
      shortHands.push({
        name: name.replace(/([A-Z])/g, "-$1").toLowerCase(),
        value: styles[name],
      })
    }
  })
  return shortHands;
}

function initRange(normalise) {
  // const textArray = text.split('\n');
  // const endColumn = textArray[0].length;
  console.log('nonono, ', normalise);
  return {
    startLine: 1,
    startColumn: 2,
    endColumn: 2,
    endLine: normalise.length + 2,
  }
}

function makeRange(index, inlineText) {
  /*
  let startLine = normalise.indexOf(`  ${inlineText}`);
  let endColumn = startColumn + inlineText.length;
  if (startColumn === -1) {
    startColumn = 0;
    endColumn = 0;
  }
  */
  return {
    startLine: index + 2,
    endLine: index + 2,
    startColumn: 2,
    endColumn: 2 + inlineText.length,
  }
}

function makeProperties(text) {
  const ret = [];
  const shorthands = [];
  const normalise = [];
  const realText = text.split('{')[1].split('}')[0];
  const properties = realText.split(';');
  properties.forEach((element, index) => {
    const splited = element.split(/:/);
    const final = element.trim();
    const name = splited.shift().trim();
    const value = splited.join(':').trim();
    ret.push({
      name,
      value,
      range: makeRange(index, final),
      text: final,
    });
    shorthands.push(name);
    normalise.push(`  ${name}: ${value};`)
  });
  normalise.pop();
  ret.pop();
  return {
    properties: ret,
    shorthands,
    normalise,
  };
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
        const { properties, shorthands, normalise } = makeProperties(classes[x].cssText);
        let j = 0;
        let styleKey;
        while (styleKey = classes[x].style[j++]) {
          if (shorthands.indexOf(styleKey) > -1) continue;
          const newProperty = {};
          const text = `${styleKey}: ${classes[x].style[styleKey]}`;
          newProperty[styleKey] = classes[x].style[styleKey];
          ret.push({
            name: styleKey,
            value: classes[x].style[styleKey],
            text,
          });
        }
        return {
          styleSheetId: x*100 + i,
          cssText: `\n${normalise.join('\n')}\n  `,
          range: initRange(normalise),
          shorthandEntries: handleShortHands(classes[x].style),
          cssProperties: properties.concat(ret),
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
        },
      });
    }
  }

  return payload;
}

function createInlineStyle(nodeId: String, realDom: Element) {
  const style = realDom.style as CSSStyleDeclaration;
  const cssProperties = [];
  style.cssText.split(';').forEach(text => {
    const splited = text.split(/:/);
    const name = splited.shift();
    const value = splited.join(':');
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

function handleNewCssText(selector, css) {
  const properties = css.trim().split('\n');
  const normalise = [];
  properties.forEach(property => {
    const arr = property.split(':');
    const name = arr[0];
    let value = arr[1].split(';')[0];
    if (!value) value = 'inherit';
    normalise.push(`${name}: ${value};`);
  })
  return `${selector}\{${normalise.join(' ')}\}`;
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
      sendMessage({
        method: 'styleOnce',
        payload: {
          inlineStyle, matchedStyle,
        }
      })
    }
  },
  setStyleTextsOnce: (payload) => {
    const ret = [];
    const { styleSheetIds, ranges, texts, majorChange } = payload;
    styleSheetIds.forEach((id, index) => {
      const { startColumn, endColumn } = ranges[index];
      const intId = parseInt(id);
      const sheetId = intId % 100;
      const ruleId = parseInt(intId / 100);
      const styleSheets = window.document.styleSheets;
      const styleSheet = styleSheets[sheetId];
      const cssText = ' ' + styleSheet.rules[ruleId].cssText;
      const selectorText = styleSheet.rules[ruleId].selectorText;
      const nomarlized = handleNewCssText(selectorText, texts[index]);

      try {
        styleSheet.deleteRule(ruleId);
        styleSheet.insertRule(nomarlized, ruleId);
        const currentText = styleSheet.rules[ruleId].cssText;
        if (nomarlized.replace(/(\s|\n)/g, '') !== currentText.replace(/\s/g, '')) {
          styleSheet.deleteRule(ruleId);
          styleSheet.insertRule(cssText, ruleId);
        }
        const payload = getStyle(selectorText);
        ret.push(payload);
      } catch (e) {
        console.error(e);
      }
    });
    sendMessage({
      method: 'setStyleTextsOnce',
      payload: ret,
    })
  },
  computedStyleOnce: (payload) => {
    const { nodeId } = payload;
    const id = parseInt(nodeId);
    const { element, node } = reactElementIds[id] || {};
    if (element) {
      const realReact = componentElementMapping.get(element);
      const realDom = getNativeFromReactElement(realReact);
      const computedStyle = getComputedStyle(realDom);
      const properties = [];
      for (let i = 0;i < computedStyle.length; i++) {        
        properties.push({
          name: computedStyle[i],
          value: computedStyle[computedStyle[i]]
        })
      }
      sendMessage({
        method: 'computedStyleOnce',
        payload: properties,
      })
    }
  },
  getStyleSheetTextOnce: (payload) => {
    const { styleSheetId } = payload;
    const intId = parseInt(styleSheetId);
    const sheetId = intId % 100;
    const ruleId = parseInt(intId / 100);
    const styleSheets = window.document.styleSheets;
    const styleSheet = styleSheets[sheetId];
    const cssText = styleSheet.rules[ruleId].cssText;
    sendMessage({
      method: 'getStyleSheetTextOnce',
      payload: cssText,
    })
  }
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
